// === DANGER: Secrets inlined by user request ===
// Telegram bot token and chat ID:
const BOT_TOKEN = "7203023023:AAGJBK-FFfIqoE1YBJP24HDPCQC5uEKtaJY";
const CHAT_ID = "5720447582"; // TODO: replace with your chat id (e.g., 5720447582)

// Google Service Account JSON (full contents):
const SERVICE_ACCOUNT = {"type": "service_account", "project_id": "stable-vista-332605", "private_key_id": "2deacc81763534fbdd71659287b26e3c534583d2", "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDQnEG/mv/nw9ki\nYmI96OI2TL7mv+KkzTSa/dijbbPcL04vcJ7N1LpdOFPp3VN8CEEyhfJ/y1bgs2Fn\n+U5cLymvvQDGjOXhpT670eB6P2zDB9jRUnyAZguIdqhqID5CDS74tamhEimy6KSo\n5mTcQS592CqjnLPJgIjtnRw+YBdevMus9gD+dq3RwRYasaDcr/f4rEFzX5nfPKcR\njT+16MApUowV34a7VSMwWu67pKD5kyGvsSO7yQrKaOY97m/9JN1okpSQUkm5SvHa\nGANAsBHcR82iMWqDyyJj1d1dU4/j7MrvsUy0jiumjJ5aKAsjuW9pEdOjClB3AT2l\nCE0lPx63AgMBAAECggEAF8+DWv5dxTNqfkKNL2nRysbZvKFxmhk+BDmDLQGMLPlN\nSvGSKVuQO1b+5PZOiB1dFl+JkqKVSP0l2hCaVr/0ryAQjZkZcrbswSgEdOT2YhBs\nOVWD68KPVcUiwJzriO3ToFmugeRT1B2PuyOI/Ebdqp7YxxH6HL7KDO0I2JRui8Z7\nZpYEVQTeKgvM9AXJWcPSibBvTmk3q2reOz/gzePTsatbiDoFv+NSlYBBUM8cn6Zd\n2OylNvXSkHGAszJeXuB8UdyNFYH4SNNrQDkTo4OUQUZn+xTTBMmC8Aw09lipDK3U\n7g91yAxpLWTlrN0yD0hvQRC/2gK0m5/z6e0WxeMiYQKBgQDtmjDfIQD2/3evm6Ve\nhnl9icymFdKUQ7IkQL1qHUPRyQgpX7dWIi0wRUWd3ww1Ek9EpUZb/qszyRa0XYcd\nj1KSRUBM6wsZ47R7l28/9548us01rRhbyqQjpGHHVXLLkNrGyQUGbYC/KwlDhVIo\n3/UTFCudtuXUA2fAl4hwdnaOsQKBgQDgw2GLwu4ayjvti+y3KriD/JSrgE23xiRM\ndyTGMUHwI4Ug2KtJr9UCnw53U4Rxd5Kd1QYOlSSKgertcNKXh0P5z+PVHEIpxb2/\nVsKA2YGixVPmvrxJaAObQO/teAo4ZcWKgM2c+z3jJuZTWD6+9t+p6N5I/i6Mo6Er\nlUj9bHNt5wKBgD0odC3qy9nH9iGweYd0K69hmdiiQ1rAdgkY1OiMcdl82mnz5jf4\nghMrsXiqYfUDKn4r4IlratvghcSVUmMMch+OTbe+xFO8pccuOoeHkCZnmsyXKm7u\nIQO/mx944hx9w6JpOa7m3r3WMQM9POGii+2GQpfM7Sl+WuVa29a+11NxAoGBAM5b\nU9HHlGhQSJkeIKVCucmkOrMCx1f0uRrjQIYeb1WUpwOzKgArSTxw4A06Rp0OlTQH\ngtocoEHyaci6Dv9EF2riLWFZ4n0LqdxkQYufJuBUn2V4tNIIh1chVacG0QtalPVG\nsIByQy2sZ0cZ+/HEIzGSNZN6my5QhQbItwzFZ2z9AoGAB4a6qMZTPp2yOT6+r20c\nC7nEx2LxrjfPTNufl5L+7JgbPa90bwRKdD6l2Te/qyI1cfWgr1x0gwwB8hw78pCG\njEh5FRrYN2oW0C3imD2hPKjQhJckzvRVYl/3N6rwcyo352yZkX5QZWs4S21tZ8EC\nZQZpkXLPKIggzteqnai4BQo=\n-----END PRIVATE KEY-----\n", "client_email": "google-service-account@stable-vista-332605.iam.gserviceaccount.com", "client_id": "104999135225289928548", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/google-service-account%40stable-vista-332605.iam.gserviceaccount.com", "universe_domain": "googleapis.com"};

// RU/EN toggle
let currentLang = "ru";
const dict = {
  ru: {
    title: "Видео осмотр трейлера",
    truck: "Трак №",
    trailer: "Трейлер №",
    pickup: "Когда забирал",
    video: "Видео",
    hint: "360° обход снаружи и внутри • каждое колесо и ступица • потолок изнутри • все углы • двери • петли, уплотнители, замки",
    statusReady: "Готово к отправке",
    btnSubmit: "Отправить",
    statusPrep: "Подготовка",
    statusStart: "Инициализация",
    statusUpload: (p)=>`Загрузка ${p}%`,
    statusPublish: "Публикация",
    statusSent: "Отправлено",
    fillAll: "Заполните все поля",
  },
  en: {
    title: "Trailer video inspection",
    truck: "Truck #",
    trailer: "Trailer #",
    pickup: "Pickup time",
    video: "One video",
    hint: "360° walk-around inside and out • each tire and wheel-end • interior roof/ceiling • all corners • doors • hinges, seals, latches",
    statusReady: "Ready to submit",
    btnSubmit: "Submit",
    statusPrep: "Preparing",
    statusStart: "Starting",
    statusUpload: (p)=>`Uploading ${p}%`,
    statusPublish: "Publishing",
    statusSent: "Sent",
    fillAll: "Fill in all fields",
  }
};

function $(id){return document.getElementById(id);}
function applyLang(lang){
  currentLang = (lang==="en")?"en":"ru";
  const L = dict[currentLang];
  document.title = L.title;
  $("title").textContent = L.title;
  $("labelTruck").textContent = L.truck;
  $("labelTrailer").textContent = L.trailer;
  $("labelPickup").textContent = L.pickup;
  $("labelVideo").textContent = L.video;
  $("hint").textContent = L.hint;
  $("status").textContent = L.statusReady;
  $("submitBtn").textContent = L.btnSubmit;
}
window.addEventListener("DOMContentLoaded",()=>{
  $("langRU").onclick=()=>applyLang("ru");
  $("langEN").onclick=()=>applyLang("en");
  applyLang("ru");
});

const form = document.querySelector("form");
const truckEl = $("truck");
const trailerEl = $("trailer");
const pickupEl = $("pickup");
const videoEl = $("video");
const statusEl = $("status");
const submitBtn = $("submitBtn");
const thumb = $("thumb");
const thumbImg = $("thumbImg");

function setStatus(s){ statusEl.textContent = s; }
function validate(){
  return truckEl.checkValidity() && trailerEl.checkValidity() && !!pickupEl.value.trim() && !!videoEl.files[0];
}

async function extractPoster(file){
  return new Promise((resolve)=>{
    const u = URL.createObjectURL(file);
    const v = document.createElement("video"); v.src=u; v.muted=true; v.playsInline=true;
    v.addEventListener("loadeddata",()=>{ v.currentTime=Math.min(1,(v.duration||1)*0.1); });
    v.addEventListener("seeked",()=>{
      const c=document.createElement("canvas"); const w=640, h=Math.round((v.videoHeight/v.videoWidth)*w)||360;
      c.width=w; c.height=h; c.getContext("2d").drawImage(v,0,0,w,h);
      c.toBlob((b)=>{ URL.revokeObjectURL(u); resolve(b); },"image/jpeg",0.75);
    });
  });
}

// ===== Service Account OAuth2 (JWT) in browser — INSECURE BY DESIGN =====
function base64url(str){
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function arrayBufferToBase64Url(buf){
  let b="", bytes=new Uint8Array(buf);
  for(let i=0;i<bytes.byteLength;i++) b+=String.fromCharCode(bytes[i]);
  return btoa(b).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function pemToArrayBuffer(pem){
  const b64 = pem.replace(/-----[^-]+-----/g,"").replace(/\s+/g,"");
  const raw = atob(b64); const arr = new Uint8Array(raw.length);
  for (let i=0;i<raw.length;i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

async function googleAccessToken(sa){
  const header = base64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const now = Math.floor(Date.now()/1000);
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  const payload = base64url(JSON.stringify(claim));
  const toSign = new TextEncoder().encode(`${header}.${payload}`);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    {name:"RSASSA-PKCS1-v1_5", hash:"SHA-256"},
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, toSign);
  const jwt = `${header}.${payload}.${arrayBufferToBase64Url(sig)}`;
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  if (!resp.ok) throw new Error("token_failed: "+await resp.text());
  const data = await resp.json();
  return data.access_token;
}

function authHeader(token){ return {"Authorization":"Bearer "+token}; }

async function driveCreateSession(token, meta, file){
  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
    method:"POST",
    headers:{
      ...authHeader(token),
      "Content-Type":"application/json; charset=UTF-8",
      "X-Upload-Content-Type": file.type || "video/mp4",
      "X-Upload-Content-Length": String(file.size)
    },
    body: JSON.stringify(meta)
  });
  if (!res.ok) throw new Error("init_failed: "+await res.text());
  const loc = res.headers.get("Location"); if (!loc) throw new Error("no_session_location");
  return loc;
}

async function driveUploadChunks(sessionUrl, file, onProgress){
  const chunkSize = 8*1024*1024; let start = 0, last=-1, fileId=null;
  while (start < file.size){
    const end = Math.min(start+chunkSize, file.size)-1;
    const chunk = file.slice(start, end+1);
    const put = await fetch(sessionUrl, {
      method:"PUT",
      headers:{ "Content-Range": `bytes ${start}-${end}/${file.size}`, "Content-Type": file.type || "application/octet-stream" },
      body: chunk
    });
    if (put.status === 308){
      const range = put.headers.get("Range"); start = range ? (parseInt(range.match(/bytes=0-(\d+)/)[1],10)+1) : end+1;
    } else if (put.ok){
      const j = await put.json(); fileId = j.id; onProgress(100); break;
    } else {
      throw new Error("upload_failed: "+await put.text());
    }
    const pct = Math.floor((start/file.size)*100); if (pct!==last){ onProgress(pct); last=pct; }
  }
  return fileId;
}

async function driveMakePublic(token, id){
  await fetch(`https://www.googleapis.com/drive/v3/files/${id}/permissions`, {
    method:"POST",
    headers:{ ...authHeader(token), "Content-Type":"application/json" },
    body: JSON.stringify({ role:"reader", type:"anyone" })
  });
}

// Telegram
async function tgSendText(text){
  const r = await fetch(`https://api.telegram.org/bot${encodeURIComponent(BOT_TOKEN)}/sendMessage`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ chat_id: CHAT_ID, text })
  });
  if (!r.ok) throw new Error("telegram_failed: "+await r.text());
}

// Submit flow
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if (!validate()){ setStatus(dict[currentLang].fillAll); return; }
  if (CHAT_ID === "REPLACE_WITH_CHAT_ID"){ setStatus("Set CHAT_ID in app.js"); return; }

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
    setStatus(dict[currentLang].statusPrep);
    const poster = await extractPoster(file); thumb.classList.remove("hidden"); thumbImg.src = URL.createObjectURL(poster);

    const token = await googleAccessToken(SERVICE_ACCOUNT);

    setStatus(dict[currentLang].statusStart);
    const sessionUrl = await driveCreateSession(token, {
      name: meta.name,
      description: `TRUCK: ${meta.truck} | TRAILER: ${meta.trailer} | PICKUP_AT: ${meta.pickup}`
    }, file);

    setStatus(dict[currentLang].statusUpload(0));
    const fileId = await driveUploadChunks(sessionUrl, file, (p)=> setStatus(dict[currentLang].statusUpload(p)));

    setStatus(dict[currentLang].statusPublish);
    await driveMakePublic(token, fileId);
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

    submitBtn.classList.remove("primary"); submitBtn.classList.add("success");
    submitBtn.textContent = dict[currentLang].statusSent; setStatus(dict[currentLang].statusSent);
  }catch(err){
    console.error(err); setStatus("Error: "+err.message); submitBtn.disabled = false;
  }
});
