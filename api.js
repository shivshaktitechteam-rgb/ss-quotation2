// api.js (JSONP for BOTH GET + "POST" actions)
// GitHub Pages safe: NO postMessage, NO CORS fetch

const API_BASE = "https://script.google.com/macros/s/AKfycbza-YJ3gzUcYu0untIx9yLfQEBcyLDGWcUKG_ohMNUF6L5D_CSF19arXTCfVCF1-N75Sw/exec";

// ---- JSONP helper ----
function _jsonp(params) {
  return new Promise((resolve, reject) => {
    const cb = "cb_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);

    const timer = setTimeout(() => {
      try { delete window[cb]; } catch (e) {}
      reject(new Error("API JSONP timeout"));
    }, 20000);

    window[cb] = (resp) => {
      clearTimeout(timer);
      try { delete window[cb]; } catch (e) {}
      resolve(resp);
    };

    const qs = new URLSearchParams();
    Object.keys(params || {}).forEach((k) => {
      const v = params[k];
      if (v === undefined || v === null) return;
      if (typeof v === "object") qs.set(k, JSON.stringify(v));
      else qs.set(k, String(v));
    });

    qs.set("callback", cb);
    qs.set("_ts", String(Date.now())); // cache bust

    const s = document.createElement("script");
    s.src = API_BASE + "?" + qs.toString();
    s.onerror = () => {
      clearTimeout(timer);
      try { delete window[cb]; } catch (e) {}
      reject(new Error("API JSONP network error"));
    };

    document.body.appendChild(s);

    // cleanup
    s.onload = () => {
      setTimeout(() => {
        if (s && s.parentNode) s.parentNode.removeChild(s);
      }, 1500);
    };
  });
}

// Public helpers (keep same names used in your HTML)
async function apiGet(params) {
  return await _jsonp(params);
}

async function apiPost(params) {
  // Still JSONP internally (GET), but your UI can call it as "post"
  return await _jsonp(params);
}
