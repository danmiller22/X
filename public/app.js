// ==== CONFIG ====
// Подставь свой OAuth Client ID (Web) из Google Cloud
const G_CLIENT_ID = "xxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com";

// Телеграм из URL: ?t=<BOT_TOKEN>&c=<CHAT_ID>
const url = new URL(location.href);
const TG_TOKEN = url.searchParams.get("t") || "";
const TG_CHAT_ID = url.searchParams.get("c") || "";

// ==== I18N ====
let currentLang = (url.searchParams.get("l") || "ru").toLowerCase(); // ?l=en для старта на EN
const dict = {
  ru: {
    title: "Видео осмотр трейлера",
    truck: "Трак №",
    trailer: "Трейлер №",
    pickup: "Когда забирал",
    video: "Видео",
    hint: "360° обход снаружи и внутри • каждое колесо и ступица • потолок изнутри • все углы • двери • петли, замки",
    statusReady: "Готово к отправке",
    btnSubmit: "Отправить",
    statusPrep: "Подготовка",
    statusStart: "Инициализация",
    statusUpload: (p)=>`Загрузка ${p}%`,
    statusPublish: "Публикация",
    statusSent: "Отправлено",
    urlNeed: "Добавьте ?t=<bot_token>&c=<chat_id> в URL",
    fillAll: "Заполните все поля",
  },
  en: {
    title: "Trailer video inspection",
    truck: "Truck #",
    trailer: "Trailer #",
    pickup: "Pickup time",
    video: "One video",
    hint: "360° walk-around inside and out • each tire and wheel-end • interior roof/ceiling • all corners • doors • hinges, latches",
    statusReady: "Ready to submit",
    btnSubmit: "Submit",
    statusPrep: "Preparing",
    statusStart: "Starting",
    statusUpload: (p)=>`Uploading ${p}%`,
    statusPublish: "Publishing",
    statusSent: "Sent",
    urlNeed: "Append ?t=<bot_token>&c=<chat_id> to URL",
    fillAll: "Fill in all fields",
  }
};

function $(id){ return document.getElementById(id); }

function applyLang(lang){
  currentLang = (lang === "en") ? "en" : "ru";
  const L = dict[currentLang];

  document.documentElement.setAttribute("lang", currentLang);
  document.title = L.title;
  $("title").textContent = L.title;
  $("labelTruck").textContent = L.truck;
  $("labelTrailer").textContent = L.trailer;
  $("labelPickup").textContent = L.pickup;
  $("labelVideo").textContent = L.video;
  $("hint").textContent = L.hint;
  $("status").textContent = L.statusReady;
  $("submitBtn").textContent = L.btnSubmit;

  // визуально активная кнопка языка
  $("langRU").classList.toggle("active", currentLang === "ru");
  $("langEN").classList.toggle("active", currentLang === "en");
}

// инициализация языков
$("langRU").onclick = () => applyLang("ru");
$("langEN").onclick = () => applyLang("en");
applyLang(currentLang);

// ==== FORM / FLOW ====
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
    const u = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.src = u; v.muted = true; v.playsInline = true;
    v.addEventListener("loadeddata", ()=>{ v.currentTime = Math.min(1, (v.duration||1)*0.1); });
    v.addEventListener("seeked", ()=>{
      const c = document.createElement("canvas");
      const w = 640, h = Math.round((v.videoHeight/v.videoWidth)*w)||360;
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(v, 0, 0, w, h);
      c.toBlob((blob)=>{ URL.revokeObjectURL(u); resolve(blob); }, "image/jpeg", 0.75);
    });
  });
}

// ==== Google OAuth + Drive resumable ====
let gAccessToken = "";
function gapiLoad(){ return new Promise((res)=> gapi.load("client", res)); }
async function initGapi(){
  if (!G_CLIENT_ID) throw new Error("No Google OAuth Client ID");
  await gapiLoad();
  await gapi.client.init({ discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"] });
  return google.accounts.oauth2.initTokenClient({
    client_id: G_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (t) => { gAccessToken = t.access_token; }
  });
}
function authHeader(){
  if (!gAccessToken) throw new Error("No Google token");
  return { "Authorization": "Bearer " + gAccessToken };
}
async function driveCreateSession({name, size, mime, description}){
  const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
    method:"POST",
    headers:{ ...authHeader(), "Content-Type":"application/json; charset=UTF-8",
      "X-Upload-Content-Type": mime, "X-Upload-Content-Length": String(size) },
    body: JSON.stringify({ name, description })
  });
  if (!r.ok) throw new Error("init_failed: " + await r.text());
  const loc = r.headers.get("Location"); if (!loc) throw new Error("no_session_location");
  return loc;
}
async function driveUploadChunks(sessionUrl, file, onProgress){
  const chunkSize = 8*1024*1024; let start = 0, last = -1;
  while (start < file.size){
    const end = Math.min(start+chunkSize, file.size)-1;
    const chunk = file.slice(start, end+1);
    const res = await fetch(sessionUrl, {
      method:"PUT",
      headers:{ "Content-Range": `bytes ${start}-${end}/${file.size}`, "Content-Type": file.type||"application/octet-stream" },
      body: chunk
    });
    if (res.status === 308){
      const m = (res.headers.get("Range")||"").match(/bytes=0-(\d+)/);
      start = m ? parseInt(m[1],10)+1 : end+1;
    } else if (res.ok){
      const j = await res.json(); onProgress(100); return j.id;
    } else { throw new Error("upload_failed: " + await res.text()); }
    const pct = Math.floor((start/file.size)*100); if (pct !== last){ onProgress(pct); last = pct; }
  }
}
async function driveMakePublic(id){
  await fetch(`https://www.googleapis.com/drive/v3/files/${id}/permissions`, {
    method:"POST", headers:{ ...authHeader(), "Content-Type":"application/json" },
    body: JSON.stringify({ role:"reader", type:"anyone" })
  });
}

// ==== Telegram ====
async function tgSendText(text){
  if (needTelegram()) throw new Error(dict[currentLang].urlNeed);
  const r = await fetch(`https://api.telegram.org/bot${encodeURIComponent(TG_TOKEN)}/sendMessage`, {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text })
  });
  if (!r.ok) throw new Error("telegram_failed: " + await r.text());
}

// ==== Submit flow ====
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if (!validate()){ setStatus(dict[currentLang].fillAll); return; }
  if (needTelegram()){ setStatus(dict[currentLang].urlNeed); return; }

  submitBtn.disabled = true;
  const file = $("video").files[0];
  const meta = {
    name: file.name || "trailer-video.mp4",
    size: file.size,
    mime: file.type || "video/mp4",
    truck: $("truck").value.trim(),
    trailer: $("trailer").value.trim(),
    pickup: $("pickup").value.trim(),
  };

  try{
    setStatus(dict[currentLang].statusPrep);
    const poster = await extractPoster(file);
    thumb.classList.remove("hidden");
    thumbImg.src = URL.createObjectURL(poster);

    const tokenClient = await initGapi();
    if (!gAccessToken) tokenClient.requestAccessToken({ prompt: "" });

    setStatus(dict[currentLang].statusStart);
    const sessionUrl = await driveCreateSession({
      name: meta.name, size: meta.size, mime: meta.mime,
      description: `TRUCK: ${meta.truck} | TRAILER: ${meta.trailer} | PICKUP_AT: ${meta.pickup}`
    });

    setStatus(dict[currentLang].statusUpload(0));
    const fileId = await driveUploadChunks(sessionUrl, file, (p)=> setStatus(dict[currentLang].statusUpload(p)));

    setStatus(dict[currentLang].statusPublish);
    await driveMakePublic(fileId);
    const link = `https://drive.google.com/file/d/${fileId}/view`;

    const msg = [
      `TRUCK: ${meta.truck}`,
      `TRAILER: ${meta.trailer}`,
      `PICKUP_AT: ${meta.pickup}`,
      `VIDEO: ${link}`,
      `ORDER: Front → Right → Rear → Left`,
      `SOURCE: XtraLease form`
    ].join("\n");
    await tgSendText(msg);

    // success state
    submitBtn.classList.remove("primary");
    submitBtn.classList.add("success");
    submitBtn.textContent = dict[currentLang].statusSent;
    setStatus(dict[currentLang].statusSent);
  }catch(err){
    console.error(err);
    setStatus("Ошибка / Error: " + err.message);
    submitBtn.disabled = false;
  }
});
