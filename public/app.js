// Google OAuth Client ID (Web) — замените на свой
const G_CLIENT_ID = "xxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com";

// Telegram токен и чат берутся из URL: ?t=<BOT_TOKEN>&c=<CHAT_ID>
const url = new URL(location.href);
const TG_TOKEN = url.searchParams.get("t") || "";
const TG_CHAT_ID = url.searchParams.get("c") || "";

// i18n — один язык на экране
let currentLang = "ru";
const t = {
  ru: {
    title: "Видео осмотр трейлера",
    truck: "Трак №",
    trailer: "Трейлер №",
    pickup: "Когда забирал",
    video: "Видео",
    hint: "все стороны трейлера внутри и снаружи • каждое колесо • потолок изнутри • углы и двери",
    statusReady: "Готово к отправке",
    btnSubmit: "Отправить",
    statusPrep: "Подготовка",
    statusStart: "Инициализация",
    statusUpload: (p)=>`Загрузка ${p}%`,
    statusPublish: "Публикация",
    statusSent: "Отправлено",
    urlNeed: "Добавьте ?t=<bot_token>&c=<chat_id> в URL",
  },
  en: {
    title: "Trailer video inspection",
    truck: "Truck #",
    trailer: "Trailer #",
    pickup: "Pickup time",
    video: "One video",
    hint: "all trailer sides inside and outside • every wheel • interior roof • corners and doors",
    statusReady: "Ready to submit",
    btnSubmit: "Submit",
    statusPrep: "Preparing",
    statusStart: "Starting",
    statusUpload: (p)=>`Uploading ${p}%`,
    statusPublish: "Publishing",
    statusSent: "Sent",
    urlNeed: "Append ?t=<bot_token>&c=<chat_id> to URL",
  }
};
function applyLang(lang){
  currentLang = lang;
  const L = t[lang];
  document.title = L.title;
  document.getElementById("title").textContent = L.title;
  document.getElementById("labelTruck").textContent = L.truck;
  document.getElementById("labelTrailer").textContent = L.trailer;
  document.getElementById("labelPickup").textContent = L.pickup;
  document.getElementById("labelVideo").textContent = L.video;
  document.getElementById("hint").textContent = L.hint;
  document.getElementById("status").textContent = L.statusReady;
  document.getElementById("submitBtn").textContent = L.btnSubmit;
}
document.getElementById("langRU").onclick = ()=> applyLang("ru");
document.getElementById("langEN").onclick = ()=> applyLang("en");
applyLang("ru");

// ---- helpers
const $ = (id) => document.getElementById(id);
const form = $("form");
const truckEl = $("truck");
const trailerEl = $("trailer");
const pickupEl = $("pickup");
const videoEl = $("video");
const statusEl = $("status");
const submitBtn = $("submitBtn");
const thumb = $("thumb");
const thumbImg = $("thumbImg");

function setStatus(s){ statusEl.textContent = s; }
function needTelegram(){ return !(TG_TOKEN && TG_CHAT_ID); }

function validate(){
  return truckEl.checkValidity()
    && trailerEl.checkValidity()
    && !!pickupEl.value.trim()
    && !!videoEl.files[0];
}

async function extractPoster(file){
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.src = url; v.muted = true; v.playsInline = true;
    v.addEventListener("loadeddata", ()=>{ v.currentTime = Math.min(1, (v.duration||1)*0.1); });
    v.addEventListener("seeked", ()=>{
      const c = document.createElement("canvas");
      const w = 640, h = Math.round((v.videoHeight/v.videoWidth)*w)||360;
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(v, 0, 0, w, h);
      c.toBlob((blob)=>{ URL.revokeObjectURL(url); resolve(blob); }, "image/jpeg", 0.75);
    });
  });
}

// Google OAuth
let gAccessToken = "";
function gapiLoad(){ return new Promise((resolve)=> gapi.load("client", resolve)); }
async function initGapi(){
  if (!G_CLIENT_ID) throw new Error("No Google OAuth Client ID");
  await gapiLoad();
  await gapi.client.init({ discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"] });
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: G_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (t) => { gAccessToken = t.access_token; }
  });
  return tokenClient;
}
function authHeader(){
  if (!gAccessToken) throw new Error("No Google token");
  return { "Authorization": "Bearer " + gAccessToken };
}

// Drive resumable
async function driveCreateSession({name, size, mime, description}){
  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
    method:"POST",
    headers:{
      ...authHeader(),
      "Content-Type":"application/json; charset=UTF-8",
      "X-Upload-Content-Type": mime,
      "X-Upload-Content-Length": String(size),
    },
    body: JSON.stringify({ name, description })
  });
  if (!res.ok) throw new Error("init_failed: " + await res.text());
  const loc = res.headers.get("Location");
  if (!loc) throw new Error("no_session_location");
  return loc;
}
async function driveUploadChunks(sessionUrl, file, onProgress){
  const chunkSize = 8*1024*1024;
  let start = 0, lastPct = -1;
  while (start < file.size){
    const end = Math.min(start+chunkSize, file.size)-1;
    const chunk = file.slice(start, end+1);
    const range = `bytes ${start}-${end}/${file.size}`;
    const res = await fetch(sessionUrl, { method:"PUT", headers:{ "Content-Range": range, "Content-Type": file.type||"application/octet-stream" }, body: chunk });
    if (res.status === 308){
      const rng = res.headers.get("Range");
      start = rng ? (parseInt(rng.match(/bytes=0-(\d+)/)[1],10)+1) : end+1;
    } else if (res.ok){
      const j = await res.json(); onProgress(100); return j.id;
    } else { throw new Error("upload_failed: " + await res.text()); }
    const pct = Math.floor((start/file.size)*100);
    if (pct !== lastPct){ onProgress(pct); lastPct = pct; }
  }
}
async function driveMakePublic(fileId){
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method:"POST", headers:{ ...authHeader(), "Content-Type":"application/json" },
    body: JSON.stringify({ role:"reader", type:"anyone" })
  });
  if (!r.ok) console.warn("perm_failed", await r.text());
}

// Telegram
async function tgSendText(text){
  if (needTelegram()) throw new Error(t[currentLang].urlNeed);
  const r = await fetch(`https://api.telegram.org/bot${encodeURIComponent(TG_TOKEN)}/sendMessage`, {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text })
  });
  if (!r.ok) throw new Error("telegram_failed: " + await r.text());
}

// Flow
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if (!validate()) { setStatus(currentLang==="ru" ? "Заполните все поля" : "Fill in all fields"); return; }
  if (needTelegram()) { setStatus(t[currentLang].urlNeed); return; }

  submitBtn.disabled = true;

  const file = document.getElementById("video").files[0];
  const meta = {
    name: file.name || "trailer-video.mp4",
    size: file.size,
    mime: file.type || "video/mp4",
    truck: document.getElementById("truck").value.trim(),
    trailer: document.getElementById("trailer").value.trim(),
    pickup: document.getElementById("pickup").value.trim(),
  };

  try{
    setStatus(t[currentLang].statusPrep);
    const poster = await extractPoster(file);
    thumb.classList.remove("hidden");
    thumbImg.src = URL.createObjectURL(poster);

    const tokenClient = await initGapi();
    if (!gAccessToken) tokenClient.requestAccessToken({ prompt: "" });

    setStatus(t[currentLang].statusStart);
    const sessionUrl = await driveCreateSession({
      name: meta.name, size: meta.size, mime: meta.mime,
      description: `TRUCK: ${meta.truck} | TRAILER: ${meta.trailer} | PICKUP_AT: ${meta.pickup}`
    });

    setStatus(t[currentLang].statusUpload(0));
    const fileId = await driveUploadChunks(sessionUrl, file, (p)=> setStatus(t[currentLang].statusUpload(p)));

    setStatus(t[currentLang].statusPublish);
    await driveMakePublic(fileId);
    const link = `https://drive.google.com/file/d/${fileId}/view`;

    const ru = [
      `TRUCK: ${meta.truck}`,
      `TRAILER: ${meta.trailer}`,
      `PICKUP_AT: ${meta.pickup}`,
      `VIDEO: ${link}`,
      `ORDER: Front → Right → Rear → Left`,
      `SOURCE: XtraLease form`
    ].join("\n");
    await tgSendText(ru); // текст универсальный. при желании дублируйте EN.

    // успех: зелёная кнопка и текст "Отправлено"/"Sent"
    submitBtn.classList.remove("primary");
    submitBtn.classList.add("success");
    submitBtn.textContent = t[currentLang].statusSent;
    setStatus(t[currentLang].statusSent);
  }catch(err){
    console.error(err);
    setStatus("Ошибка / Error: " + err.message);
    submitBtn.disabled = false;
  }
});

// язык переключатель
document.getElementById("langRU").onclick = ()=> applyLang("ru");
document.getElementById("langEN").onclick = ()=> applyLang("en");
function applyLang(lang){ currentLang = lang; const L = t[lang];
  document.title = L.title;
  document.getElementById("title").textContent = L.title;
  document.getElementById("labelTruck").textContent = L.truck;
  document.getElementById("labelTrailer").textContent = L.trailer;
  document.getElementById("labelPickup").textContent = L.pickup;
  document.getElementById("labelVideo").textContent = L.video;
  document.getElementById("hint").textContent = L.hint;
  document.getElementById("status").textContent = L.statusReady;
  document.getElementById("submitBtn").textContent = L.btnSubmit;
}
