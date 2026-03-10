// api.js (FULL REPLACE)
// Paste your Apps Script Web App URL here (ends with /exec)
const API_BASE = "https://script.google.com/macros/s/AKfycbz7MZBswelTi1Wm5jeOVDnUbe3DzE5LcqBJ0qO478s3dwErNSWF2gGoYjcad9ttbmsupQ/exec";

// ---------- JSONP GET (CORS safe) ----------
function apiGet(params) {
  return new Promise((resolve, reject) => {
    try {
      const cb = "cb_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
      params = params || {};
      params.callback = cb;

      const url = API_BASE + "?" + new URLSearchParams(params).toString();

      window[cb] = (data) => {
        try {
          delete window[cb];
          script.remove();
        } catch (e) {}
        resolve(data);
      };

      const script = document.createElement("script");
      script.src = url;
      script.onerror = () => {
        try { delete window[cb]; } catch (e) {}
        reject(new Error("API GET failed"));
      };
      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });
}

// ---------- POST via hidden iframe + postMessage (CORS safe) ----------
function apiPost(data) {
  return new Promise((resolve, reject) => {
    try {
      // Create iframe once
      let iframe = document.getElementById("api_iframe");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "api_iframe";
        iframe.name = "api_iframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
      }

      // Create form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = API_BASE;
      form.target = "api_iframe";
      form.style.display = "none";

      // Put request JSON in one field
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "payload";
      const req = Object.assign({}, data || {});
      req.responseMode = "postMessage";
      input.value = JSON.stringify(req);
      form.appendChild(input);

      document.body.appendChild(form);

      // Listen for reply
      const timer = setTimeout(() => {
        window.removeEventListener("message", onMsg);
        try { form.remove(); } catch (e) {}
        reject(new Error("API POST timeout"));
      }, 20000);

      function onMsg(ev) {
        // Apps Script will post message with {ok:true/false,...}
        if (!ev || !ev.data || typeof ev.data !== "object") return;
        if (ev.data.__fromAppsScript !== true) return;

        clearTimeout(timer);
        window.removeEventListener("message", onMsg);
        try { form.remove(); } catch (e) {}
        resolve(ev.data.response);
      }

      window.addEventListener("message", onMsg);

      form.submit();
    } catch (err) {
      reject(err);
    }
  });
}
