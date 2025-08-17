# Content Warning Chrome Extension

This is my MSc Dissertation project; a "Content Warning Chrome Extension" to automatically detect, highlight, and contextually filter sensitive or offensive words on web pages in real time. Uses both regex and NLP context analysis for smart detection and offers a user-friendly toggle via the popup interface.

------

## How It Works

- Detection : Scans page content for offensive/sensitive words/phrases from a comprehensive list using regex (regular expressions).
- Context Awareness : Uses the compromise.js NLP library to analyze text. Context—only words used as nouns or verbs (in offensive context) are filtered/blurred.
- Visual Filtering : Highlights or visually alters flagged content in key content areas.
- Toggle Control : Easily turn the filter on/off using the popup; change takes effect immediately after page reload.

------

## How to Install & Run

1. "Download or clone" this repo to your computer.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the project folder.
5. You’ll see the warning icon in your browser toolbar.
6. Click the icon for a popup UI to toggle filtering ON/OFF.
7. Once enabled, browse any site and flagged words/phrases will be blurred and filtered based on their context.

------

## Project Files
                                                                            

manifest.json` - Chrome extension manifest, links scripts, sets permissions, declares the popup window. 
content.js`    - Main detection/filtering logic. Contains the full wordlist, uses regex + NLP for blurring/filter. 
compromise.js` - NLP library used for real context analysis.    
popup.html`    - Handles content/design for the popup interface (toggle button).                                        
popup.js`      - Controls popup functionality - toggles filtering, syncs state with Chrome storage.       
icon.jpg`      - Extension icon shown in the toolbar and popup.                                         
.gitattributes - Git config for text files.                                                             
                                                               

------

## File Interactions

- "manifest.json" connects and activates the extension code :
    - Loads `compromise.js` and `content.js` as content scripts for each webpage.
    - Shows the popup (`popup.html` and `popup.js`) when the icon is clicked.
- "content.js" :
    - Contains a large, curated word list for detection.
    - Splits words and phrases, builds regexes, and uses compromise.js for context checking.
    - Applies DOM changes to blur flagged content.
- "compromise.js" :
    - Provides NLP functions for context-aware detection.
- "popup.html + popup.js" :
    - Simple user interface for filter state toggle, updates Chrome storage.
- "icon.jpg" :
    - Visual icon for easy access in Chrome.

------

## Features

- Highlights and flags sensitive/offensive words and phrases.
- Context-aware filtering—NLP ensures only relevant usages are flagged.
- Toggle button with instant results via popup UI.
- Fast regex and NLP-powered detection.
- No external data sent; all processing is local.
- Modular and extensible for future upgrades.

------

## Roadmap

- Current: Regex + real NLP context filtering, visual highlights, toggle popup UI.
- Next: Modular wordlists, UI refinements, multi-language support, advanced filter logic.

------


