// content.js — frontend-only blur using compromise + regex + badWords.json

chrome.storage.sync.get("filterEnabled", (data) => {
  if (!data || !data.filterEnabled) return;

  fetch(chrome.runtime.getURL("badWords.json"))
    .then((r) => r.json())
    .then((j) => (Array.isArray(j.words) ? j.words : []))
    .then((allWords) => {
      // 1) Partition list
      const isPhrase = (w) => /\s/.test(w);
      const phrases = allWords.filter(isPhrase);
      const singles  = allWords.filter((w) => !isPhrase(w));

      const exact = [];
      const prefix = []; // terminal '*'
      for (const w of singles) {
        if (/\*$/.test(w)) {
          const base = w.slice(0, -1);
          if (base) prefix.push(base);
        } else {
          exact.push(w);
        }
      }

      // 2) Regexes (Unicode-aware)
      function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      const W = "[\\p{L}\\p{N}_]"; // Unicode word class (letters+numbers+underscore) [14]

      function chunk(arr, n) {
        const out = [];
        for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
        return out;
      }
      const CHUNK = 400;

      // Phrases anywhere
      const phraseRegexes = chunk(phrases.map(escapeRegExp), 250)
        .filter((c) => c.length)
        .map((c) => new RegExp("(" + c.join("|") + ")", "giu"));

      // Exact single tokens with Unicode boundaries
      const exactRegexes = chunk(exact.map(escapeRegExp), CHUNK)
        .filter((c) => c.length)
        .map((c) => new RegExp(`(?<!${W})(?:${c.join("|")})(?!${W})`, "giu")); // [15][18]

      // Prefix wildcards: foo* -> (?<!W)fooW*
      const prefixRegexes = chunk(prefix.map(escapeRegExp), CHUNK)
        .filter((c) => c.length)
        .map((c) => new RegExp(`(?<!${W})(?:${c.join("|")})${W}*`, "giu")); // [15][18]

      // 3) Blur dictionary/right-rail blocks as containers
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

      // 4) Walk content areas and blur
      const contentSelectors = ["#search", ".rc", ".g", "#content", "article", "main", "#rso"];

      function blurTextNode(node) {
        if (node.nodeType !== 3) return;
        const raw = node.nodeValue;
        if (!raw || !raw.trim()) return;

        // Optional POS gating via compromise on raw
        const doc = typeof nlp === "function" ? nlp(raw) : null;
        const allow = (m) =>
          doc ? doc.nouns().has(m) || doc.verbs().has(m) || (doc.adjectives && doc.adjectives().has(m)) : true;

        let html = raw;

        // Phrases first
        for (const re of phraseRegexes) {
          html = html.replace(re, (m) => `<span style="filter:blur(5px);" title="Content warning">${m}</span>`);
        }
        // Exact tokens
        for (const re of exactRegexes) {
          html = html.replace(re, (m) =>
            allow(m) ? `<span style="filter:blur(5px);" title="Content warning">${m}</span>` : m
          );
        }
        // Prefix wildcards
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

      runOnce(); // one pass at document_idle for performance [10]
    })
    .catch(() => {
      // Silently ignore if badWords.json can't load
    });
});
