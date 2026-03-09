// app.js
function notify(msg, ok=true){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.style.background = ok ? "#16a34a" : "#b91c1c";
  t.className = "toast show";
  clearTimeout(notify._h);
  notify._h = setTimeout(()=>{ t.className = "toast"; }, 2500);
}

function badgeClass(status){
  const s = String(status||"").toLowerCase();
  if(s.includes("draft")) return "draft";
  if(s.includes("pending")) return "pending";
  if(s.includes("convert")) return "converted";
  if(s.includes("cancel")) return "cancelled";
  if(s.includes("expire")) return "expired";
  if(s.includes("open")) return "open";
  if(s.includes("delay")) return "delayed";
  if(s.includes("ontime")) return "ontime";
  return "draft";
}

function fmt2(n){
  const x = Number(n||0);
  return x.toFixed(2);
}

function todayISO(){
  return new Date().toISOString().slice(0,10);
}
