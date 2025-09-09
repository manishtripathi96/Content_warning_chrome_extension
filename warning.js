(function () {
  const log = (...a) => { try { console.log("[warning.js]", ...a); } catch {} };
  const setDbg = (t) => { const x = document.getElementById("dbg"); if (x) x.textContent = t; };

  function init() {
    log("init start");
    const params   = new URLSearchParams(location.search);
    const encoded  = params.get("target") || "";
    const target   = encoded ? decodeURIComponent(encoded) : "";

    const elTarget = document.getElementById("target");
    const btnCont  = document.getElementById("continue");

    if (!elTarget || !btnCont) {
      log("elements missing", { elTarget: !!elTarget, btnCont: !!btnCont});
      setDbg("Error: elements missing");
      return;
    }

    elTarget.textContent = target;
    setDbg("Ready");

    btnCont.addEventListener("click", () => {
      log("Continue clicked →", target);
      setDbg("Continuing…");

      // Ask SW to allow once + navigate
      chrome.runtime.sendMessage({ type: "PROCEED_TO_TARGET", target }, (res) => {
        const err = chrome.runtime.lastError;
        if (err) {
          log("sendMessage error:", err.message);
          // Fallback: hard navigate
          location.href = target;
          return;
        }
        if (!res || res.ok !== true) {
          log("SW returned not-ok, fallback nav", res);
          location.href = target;
          return;
        }
        // SW will update the tab; do nothing.
        log("SW accepted navigation");
      });
    });

    btnBack.addEventListener("click", () => {
      log("Back clicked");
      if (history.length > 1) history.back();
      else setDbg("No page to go back to. Close the tab.");
    });

    log("init bound");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();