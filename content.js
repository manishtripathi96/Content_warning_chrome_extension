chrome.storage.sync.get("filterEnabled", (data) => {
  if (!data.filterEnabled) return;

  const badWords = ["hate", "kill", "stupid"];

  const walkAndHighlight = (node) => {
    if (node.nodeType === 3) {
      const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");
      const original = node.nodeValue;
      const filtered = original.replace(
        regex,
        '<span style="background-color: yellow; color: red;">$1</span>'
      );

      if (original !== filtered) {
        const span = document.createElement("span");
        span.innerHTML = filtered;
        node.parentNode.replaceChild(span, node);
      }
    } else {
      for (let child of Array.from(node.childNodes)) {
        walkAndHighlight(child);
      }
    }
  };

  walkAndHighlight(document.body);
});
