/* =========================================================
   api.js - CORS-safe client for Google Apps Script Web App
   Works on GitHub Pages using:
   - GET via JSONP (callback=...)
   - POST via hidden iframe + postMessage (responseMode="postMessage")
   ========================================================= */

const API_BASE = "https://script.google.com/macros/s/AKfycbw6Maa-4x2uZutK_g_mIZaFK00XLJF_YBanGshKUl4s8MmVccehRxRDX0zOoEIEWHoMtA/exec";
const API_TIMEOUT_MS = 25000;

function apiGet(params = {}, timeoutMs = API_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const cb = "__jsonp_cb_" + Math.random().toString(36).slice(2);
    let script = null;

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("API JSONP timeout"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      try { delete window[cb]; } catch (e) { window[cb] = undefined; }
      if (script && script.parentNode) script.parentNode.removeChild(script);
      script = null;
    }

    window[cb] = (data) => {
      cleanup();
      resolve(data);
    };

    const qs = new URLSearchParams({ ...params, callback: cb, _ts: String(Date.now()) }).toString();
    const url = API_BASE + "?" + qs;

    script = document.createElement("script");
    script.src = url;
    script.onerror = () => {
      cleanup();
      reject(new Error("API JSONP network error"));
    };
    document.head.appendChild(script);
  });
}

function apiPost(body = {}, timeoutMs = API_TIMEOUT_MS) {
  const requestId = "req_" + Date.now() + "_" + Math.random().toString(36).slice(2);

  const payloadObj = {
    ...body,
    responseMode: "postMessage",
    requestId: requestId
  };
  const payload = JSON.stringify(payloadObj);

  return new Promise((resolve, reject) => {
    const iframeName = "api_iframe_" + requestId;

    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = API_BASE;
    form.target = iframeName;
    form.style.display = "none";

    const inp = document.createElement("input");
    inp.type = "hidden";
    inp.name = "payload";
    inp.value = payload;

    form.appendChild(inp);
    document.body.appendChild(form);

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("API POST timeout"));
    }, timeoutMs);

    function onMessage(ev) {
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      if (!msg.__fromAppsScript) return;
      if (String(msg.requestId || "") !== requestId) return;

      cleanup();
      resolve(msg.response);
    }

    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      try { form.remove(); } catch (e) {}
      try { iframe.remove(); } catch (e) {}
    }

    window.addEventListener("message", onMessage);

    try {
      form.submit();
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

// expose globally (so inline onclick etc won't break)
window.apiGet = apiGet;
window.apiPost = apiPost;
