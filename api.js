// api.js
// Paste your Apps Script Web App URL here (ends with /exec)
const API_BASE = "https://script.google.com/macros/s/AKfycbz7MZBswelTi1Wm5jeOVDnUbe3DzE5LcqBJ0qO478s3dwErNSWF2gGoYjcad9ttbmsupQ/exec";

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
