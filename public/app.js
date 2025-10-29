// public/app.js
// GitHub Pages only. Client-side Google OAuth + Drive upload + Telegram send.
// WARNING: Telegram bot token in URL is visible to anyone with the link.

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

const settingsBtn = $("settingsBtn");
const settingsDlg = $("settingsDlg");
const gClientIdEl = $("gClientId");
const tgTokenEl = $("tgToken");
const tgChatIdEl = $("tgChatId");
const gSignInBtn = $("gSignIn");
const authState = $("authState");

const url = new URL(location.href);
let TG_TOKEN = url.searchParams.get("t") || "";
let TG_CHAT_ID = url.searchParams.get("c") || "";
let G_CLIENT_ID = localStorage.getItem("gClientId") || "";

if (TG_TOKEN) tgTokenEl.value = TG_TOKEN;
if (TG_CHAT_ID) tgChatIdEl.value = TG_CHAT_ID;
if (G_CLIENT_ID) gClientIdEl.value = G_CLIENT_ID;

settingsBtn.addEventListener("click", ()=> settingsDlg.showModal());
$("closeSettings").addEventListener("click", ()=> settingsDlg.close());
$("saveSettings").addEventListener("click", ()=> {
  G_CLIENT_ID = gClientIdEl.value.trim();
  TG_TOKEN = tgTokenEl.value.trim() || TG_TOKEN;
  TG_CHAT_ID = tgChatIdEl.value.trim() || TG_CHAT_ID;
  localStorage.setItem("gClientId", G_CLIENT_ID);
});

function setStatus(s){ statusEl.textContent = s; }

function validate(){
  let ok = true;
  if (!truckEl.checkValidity()) { truckEl.classList.add("error"); ok=false; }
  if (!trailerEl.checkValidity()) { trailerEl.classList.add("error"); ok=false; }
  if (!pickupEl.value.trim()) { pickupEl.classList.add("error"); ok=false; }
  if (!videoEl.files[0]) { ok=false; }
  setTimeout(()=>[truckEl,trailerEl,pickupEl].forEach(e=>e.classList.remove("error")), 250);
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
      const ctx = c.getContext("2d");
      ctx.drawImage(v, 0, 0, w, h);
      c.toBlob((blob)=>{ URL.revokeObjectURL(url); resolve(blob); }, "image/jpeg", 0.75);
    });
  });
}

// ---- Google OAuth
let gAccessToken = "";
function gapiLoad() {
  return new Promise((resolve) => gapi.load("client", resolve));
}
async function initGapi(){
  if (!G_CLIENT_ID){ setStatus("Укажите Google OAuth Client ID в Настройках"); return; }
  await gapiLoad();
  await gapi.client.init({
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  });
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: G_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (t) => { gAccessToken = t.access_token; authState.textContent = "Авторизовано / Signed in"; }
  });
  return tokenClient;
}

let tokenClient = null;
gSignInBtn.addEventListener("click", async (e)=>{
  e.preventDefault();
  tokenClient = tokenClient || await initGapi();
  tokenClient.requestAccessToken({ prompt: "" });
});

function authHeader(){
  if (!gAccessToken) throw new Error("Нет токена Google. Нажмите 'Войти в Google'.");
  return { "Authorization": "Bearer " + gAccessToken };
}

// ---- Drive Resumable Upload
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
  let start = 0;
  let lastPct = -1;
  while (start < file.size){
    const end = Math.min(start+chunkSize, file.size)-1;
    const chunk = file.slice(start, end+1);
    const range = `bytes ${start}-${end}/${file.size}`;
    const res = await fetch(sessionUrl, {
      method:"PUT",
      headers:{
        "Content-Range": range,
        "Content-Type": file.type || "application/octet-stream"
      },
      body: chunk
    });
    if (res.status === 308){
      const rng = res.headers.get("Range");
      if (rng){
        const m = rng.match(/bytes=0-(\d+)/);
        start = m ? parseInt(m[1],10)+1 : end+1;
      }else{
        start = end+1;
      }
    } else if (res.ok){
      const j = await res.json();
      onProgress(100);
      return j.id;
    } else {
      throw new Error("upload_failed: " + await res.text());
    }
    const pct = Math.floor((start/file.size)*100);
    if (pct !== lastPct){ onProgress(pct); lastPct = pct; }
  }
}
async function driveMakePublic(fileId){
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method:"POST",
    headers:{ ...authHeader(), "Content-Type":"application/json" },
    body: JSON.stringify({ role:"reader", type:"anyone" })
  });
  if (!res.ok) console.warn("perm_failed", await res.text());
}

// ---- Telegram
async function tgSendText(text){
  if (!TG_TOKEN || !TG_CHAT_ID) throw new Error("Нет Telegram токена/чата. Откройте Настройки или добавьте ?t=&c= в URL.");
  const r = await fetch(`https://api.telegram.org/bot${encodeURIComponent(TG_TOKEN)}/sendMessage`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text })
  });
  if (!r.ok) throw new Error("telegram_failed: " + await r.text());
}

// ---- Form flow
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if (!validate()) { setStatus("Заполните все поля / Fill in all fields"); return; }
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
    // Poster
    setStatus("Подготовка превью / Preparing preview");
    const poster = await extractPoster(file);
    thumb.classList.remove("hidden");
    thumbImg.src = URL.createObjectURL(poster);

    // Ensure Google auth
    tokenClient = tokenClient || await initGapi();
    if (!gAccessToken) tokenClient.requestAccessToken({ prompt: "" });

    // Create session and upload
    setStatus("Инициализация загрузки / Starting upload");
    const sessionUrl = await driveCreateSession({
      name: meta.name,
      size: meta.size,
      mime: meta.mime,
      description: `TRUCK: ${meta.truck} | TRAILER: ${meta.trailer} | PICKUP_AT: ${meta.pickup}`
    });

    setStatus("Загрузка / Uploading 0%");
    const fileId = await driveUploadChunks(sessionUrl, file, (p)=> setStatus(`Загрузка / Uploading ${p}%`));

    // Make public
    setStatus("Публикация ссылки / Making public");
    await driveMakePublic(fileId);
    const link = `https://drive.google.com/file/d/${fileId}/view`;

    // Telegram message RU+EN
    const ru = [
      `TRUCK: ${meta.truck}`,
      `TRAILER: ${meta.trailer}`,
      `PICKUP_AT: ${meta.pickup}`,
      `VIDEO: ${link}`,
      `ORDER: Front → Right → Rear → Left`,
      `SOURCE: XtraLease form`
    ].join("\\n");
    const en = ru; // same fields, English labels identical per requirement
    await tgSendText(ru + "\\n\\n" + en);

    setStatus("Отправлено / Sent");
  }catch(err){
    console.error(err);
    setStatus("Ошибка / Error: " + err.message);
  }finally{
    submitBtn.disabled = false;
  }
});
