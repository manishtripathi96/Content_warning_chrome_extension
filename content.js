

chrome.storage.sync.get("filterEnabled", (data) => {
  if (!data || !data.filterEnabled) return;

  fetch(chrome.runtime.getURL("badWords.json"))
    .then((r) => r.json())
    .then((j) => (Array.isArray(j.words) ? j.words : []))
    .then((allWords) => {
      
      const isPhrase = (w) => /\s/.test(w);
      const phrases = allWords.filter(isPhrase);
      const singles  = allWords.filter((w) => !isPhrase(w));

      const exact = [];
      const prefix = [];
      for (const w of singles) {
        if (/\*$/.test(w)) {
          const base = w.slice(0, -1);
          if (base) prefix.push(base);
        } else {
          exact.push(w);
        }
      }

    
      function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      const W = "[\\p{L}\\p{N}_]";

      function chunk(arr, n) {
        const out = [];
        for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
        return out;
      }
      const CHUNK = 400;

    
      const phraseRegexes = chunk(phrases.map(escapeRegExp), 250)
        .filter((c) => c.length)
        .map((c) => new RegExp("(" + c.join("|") + ")", "giu"));

      
      const exactRegexes = chunk(exact.map(escapeRegExp), CHUNK)
        .filter((c) => c.length)
        .map((c) => new RegExp(`(?<!${W})(?:${c.join("|")})(?!${W})`, "giu"));

      
      const prefixRegexes = chunk(prefix.map(escapeRegExp), CHUNK)
        .filter((c) => c.length)
        .map((c) => new RegExp(`(?<!${W})(?:${c.join("|")})${W}*`, "giu"));

      
      const dictSelectors = [
        "#rhs",
        "[data-dobid='hdw']",
        "[data-dobid='dfn']",
        ".lr_dct_sf_sen",
        ".lr_dct_ent"
      ];
      function blurDictionaryBlocks(root = document) {
        root.querySelectorAll(dictSelectors.join(",")).forEach((el) => {
          if (!el.dataset.cwBlurred) {
            el.style.filter = "blur(5px)";
            el.title = "Content warning";
            el.dataset.cwBlurred = "1";
          }
        });
      }

      
      const contentSelectors = ["#search", ".rc", ".g", "#content", "article", "main", "#rso"];

      function blurTextNode(node) {
        if (node.nodeType !== 3) return;
        const raw = node.nodeValue;
        if (!raw || !raw.trim()) return;

      
        const doc = typeof nlp === "function" ? nlp(raw) : null;
        const allow = (m) =>
          doc ? doc.nouns().has(m) || doc.verbs().has(m) || (doc.adjectives && doc.adjectives().has(m)) : true;

        let html = raw;

      
        for (const re of phraseRegexes) {
          html = html.replace(re, (m) => `<span style="filter:blur(5px);" title="Content warning">${m}</span>`);
        }
      
        for (const re of exactRegexes) {
          html = html.replace(re, (m) =>
            allow(m) ? `<span style="filter:blur(5px);" title="Content warning">${m}</span>` : m
          );
        }
      
        for (const re of prefixRegexes) {
          html = html.replace(re, (m) =>
            allow(m) ? `<span style="filter:blur(5px);" title="Content warning">${m}</span>` : m
          );
        }

        if (html !== raw) {
          const span = document.createElement("span");
          span.innerHTML = html;
          if (node.parentNode) node.parentNode.replaceChild(span, node);
        }
      }

      function walk(node) {
        if (node.nodeType === 3) {
          blurTextNode(node);
        } else {
          const tag = node.tagName;
          if (tag && /^(SCRIPT|STYLE|NOSCRIPT|IFRAME|CANVAS|SVG|MATH|CODE|PRE|KBD|SAMP)$/.test(tag)) return;
          if (node.isContentEditable) return;
          for (const child of Array.from(node.childNodes)) walk(child);
        }
      }

      function runOnce(root = document) {
        blurDictionaryBlocks(root);
        const areas = root.querySelectorAll(contentSelectors.join(","));
        if (areas.length) areas.forEach((a) => walk(a));
        else walk(document.body);
      }

      runOnce();
    })
    .catch(() => {
  
    });
});
