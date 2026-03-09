// api.js
// Paste your Apps Script Web App URL here (ends with /exec)
const API_BASE = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

async function apiGet(params) {
  const url = API_BASE + "?" + new URLSearchParams(params).toString();
  const res = await fetch(url, { method: "GET" });
  return res.json();
}

async function apiPost(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data)
  });
  return res.json();
}
