// ===== CONFIG =====
const BACKEND_BASE = "http://localhost/url_warn"; // or "http://127.0.0.1/url_warn"
const API_KEY = ""; // leave empty unless you enabled keys
// ==================

// POST to PHP backend
async function flagUrl(url, reason = "user reported", notes = "") {
  const endpoint = `${BACKEND_BASE}/api/flag.php`;
  console.log("POSTing to:", endpoint); // debug
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {})
    },
    body: JSON.stringify({
      url,
      reason: `${reason}${notes ? ` - ${notes}` : ""}`
    })
  });
  const txt = await res.text();
  console.log("Response:", res.status, txt); // debug
  if (!res.ok) throw new Error(`Flag failed ${res.status}: ${txt}`);
  return JSON.parse(txt);
}

(function () {
  // Elements
  const btn = document.getElementById("toggleFilter");
  const pill = document.getElementById("filterState");
  const flagBtn = document.getElementById("flagUrlBtn");
  const flagStatus = document.getElementById("flagStatus");
  const tabMeta = document.getElementById("tabMeta");
  const reasonSel = document.getElementById("flagReason");
  const notesEl = document.getElementById("flagNotes");

  // UI helpers
  function setOnStyles() {
    btn.classList.remove("btn-ghost");
    btn.classList.add("btn-primary");
    btn.textContent = "Turn Filter OFF";
    btn.setAttribute("aria-pressed", "true");
    pill.textContent = "ON";
    pill.style.background = "#e6f4ea";
    pill.style.borderColor = "#c7e6d0";
    pill.style.color = "#0f9d58";
  }
  function setOffStyles() {
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-ghost");
    btn.textContent = "Turn Filter ON";
    btn.setAttribute("aria-pressed", "false");
    pill.textContent = "OFF";
    pill.style.background = "#fff";
    pill.style.borderColor = "#e5e7eb";
    pill.style.color = "inherit";
  }
  function renderState(isOn) { isOn ? setOnStyles() : setOffStyles(); }

  // Load current filter state
  chrome.storage.sync.get({ filterEnabled: false }, (data) => {
    renderState(!!data.filterEnabled);
  });

  // Toggle filter
  btn.addEventListener("click", () => {
    chrome.storage.sync.get({ filterEnabled: false }, (data) => {
      const next = !data.filterEnabled;
      chrome.storage.sync.set({ filterEnabled: next }, () => {
        renderState(next);
        flagStatus.className = "status ok";
        flagStatus.textContent = next
          ? "Filter enabled. Reload page to apply."
          : "Filter disabled. Reload page to clear.";
        setTimeout(() => (flagStatus.textContent = ""), 2500);
      });
    });
  });

  // Show active tab host
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const t = tabs && tabs[0];
    if (t && t.url) {
      try { tabMeta.textContent = `Active tab: ${new URL(t.url).hostname}`; }
      catch { tabMeta.textContent = "Active tab: (unavailable)"; }
    } else {
      tabMeta.textContent = "Active tab: (unavailable)";
    }
  });

  // Wire Flag button
  flagBtn.addEventListener("click", async () => {
    flagStatus.className = "status";
    flagStatus.textContent = "Flagging…";
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) throw new Error("No active tab URL");
      console.log("DEBUG tab.url =", tab.url);

      const reason = reasonSel.value || "user reported";
      const notes = (notesEl.value || "").trim();

      const data = await flagUrl(tab.url, reason, notes);

      flagStatus.className = "status ok";
      flagStatus.textContent = `Flagged. Count: ${data?.flag?.count ?? "1"}`;
    } catch (e) {
      flagStatus.className = "status err";
      flagStatus.textContent = String(e?.message || e);
    }
  });
})();