const BACKEND_BASE = "http://localhost/url_warn";            
const BACKEND_FLAG_URL = `${BACKEND_BASE}/api/flag.php`;     
const BACKEND_CHECK_URL = `${BACKEND_BASE}/api/check.php`;



const ALLOW_ONCE = new Map();
function allowOnce(tabId, url) {
  if (!ALLOW_ONCE.has(tabId)) ALLOW_ONCE.set(tabId, new Set());
  ALLOW_ONCE.get(tabId).add(url);
  setTimeout(() => {
    const s = ALLOW_ONCE.get(tabId);
    if (!s) return;
    s.delete(url);
    if (s.size === 0) ALLOW_ONCE.delete(tabId);
  }, 60000);
}


chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
  }
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "flag-url") return;

  const { url, reason, notes } = msg.payload || {};
  const payload = {
    url,
    reason: `${reason || "user reported"}${notes ? ` - ${notes}` : ""}`
  };

  console.log("ServiceWorker: Posting flag →", BACKEND_FLAG_URL, payload);

  fetch(BACKEND_FLAG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (r) => {
      const txt = await r.text().catch(() => "");
      console.log("ServiceWorker: Flag response:", r.status, txt);
      if (!r.ok) {
        sendResponse({ ok: false, error: `HTTP ${r.status}: ${txt}` });
        return;
      }
      try {
        sendResponse({ ok: true, data: JSON.parse(txt) });
      } catch {
        sendResponse({ ok: true });
      }
    })
    .catch((e) => {
      console.error("ServiceWorker: Flag fetch failed:", e);
      sendResponse({ ok: false, error: String(e) });
    });

  return true;
});


async function checkFlag(url) {
  const u = new URL(BACKEND_CHECK_URL);
  u.searchParams.set("url", url);
  const res = await fetch(u.toString());
  if (!res.ok) return { warn: false };
  return res.json();
}


chrome.webNavigation.onBeforeNavigate.addListener(async ({ tabId, url, frameId }) => {
  if (frameId !== 0) return;                  
  if (!/^https?:/i.test(url)) return;         
  if (ALLOW_ONCE.get(tabId)?.has(url)) return; 

  try {
    const result = await checkFlag(url);
    console.log("ServiceWorker: Check result →", url, result);
    if (result.warn === true) {
      const warnUrl = chrome.runtime.getURL("warning.html") + "?target=" + encodeURIComponent(url);
      chrome.tabs.update(tabId, { url: warnUrl });
    }
  } catch (e) {
    console.warn("ServiceWorker: check failed, allowing navigation:", e);
  }
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "PROCEED_TO_TARGET" && sender.tab?.id != null) {
    let target = msg.target || "";
    try { target = decodeURIComponent(target); } catch {}
    if (!/^https?:/i.test(target)) {
      sendResponse({ ok: false, error: "bad target" });
      return;
    }

    
    allowOnce(sender.tab.id, target);

    chrome.tabs.update(sender.tab.id, { url: target }, () => {
      sendResponse({ ok: true });
    });
    return true; 
  }
});