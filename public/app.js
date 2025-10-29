// Константа: подставь свой OAuth Client ID (Web) из Google Cloud
const G_CLIENT_ID = "xxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"; // ← заменить

// Телеграм-данные только из URL ?t=<BOT_TOKEN>&c=<CHAT_ID>
const url = new URL(location.href);
const TG_TOKEN = url.searchParams.get("t") || "";
const TG_CHAT_ID = url.searchParams.get("c") || "";

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
  let ok = true;
  if (!truckEl.checkValidity()) { ok=false; }
  if (!trailerEl.checkValidity()) { ok=false; }
  if (!pickupEl.value.trim()) { ok=false; }
  if (!videoEl.files[0]) { ok=false; }
  return ok;
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
  if (!G_CLIENT_ID){ throw new Error("Нет Google OAuth Client ID"); }
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
  if (!gAccessToken) throw new Error("Нет токена Google");
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
  if (needTelegram()) throw new Error("Добавьте ?t=&c= в URL");
  const r = await fetch(`https://api.telegram.org/bot${encodeURIComponent(TG_TOKEN)}/sendMessage`, {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text })
  });
  if (!r.ok) throw new Error("telegram_failed: " + await r.text());
}

// Flow
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if (!validate()) { setStatus("Заполните поля / Fill in all fields"); return; }
  if (needTelegram()) { setStatus("Добавьте ?t=<bot_token>&c=<chat_id> в URL"); return; }

  submitBtn.disabled = true;
  const file = videoEl.files[0];
  const meta = {
    name: file.name || "trailer-video.mp4",
    size: file.size,
    mime: file.type || "video/mp4",
    truck: truckEl.value.trim(),
    trailer: trailerEl.value.trim(),
    pickup: pickupEl.value.trim(),
  };

  try{
    setStatus("Подготовка / Preparing");
    const poster = await extractPoster(file);
    thumb.classList.remove("hidden");
    thumbImg.src = URL.createObjectURL(poster);

    // OAuth on-demand
    const tokenClient = await initGapi();
    if (!gAccessToken) tokenClient.requestAccessToken({ prompt: "" });

    setStatus("Инициализация / Starting");
    const sessionUrl = await driveCreateSession({
      name: meta.name, size: meta.size, mime: meta.mime,
      description: `TRUCK: ${meta.truck} | TRAILER: ${meta.trailer} | PICKUP_AT: ${meta.pickup}`
    });

    setStatus("Загрузка / Uploading 0%");
    const fileId = await driveUploadChunks(sessionUrl, file, (p)=> setStatus(`Загрузка / Uploading ${p}%`));

    setStatus("Публикация / Publishing");
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
    const en = ru;
    await tgSendText(ru + "\n\n" + en);

    setStatus("Отправлено / Sent");
  }catch(err){
    console.error(err);
    setStatus("Ошибка / Error: " + err.message);
  }finally{
    submitBtn.disabled = false;
  }
});
