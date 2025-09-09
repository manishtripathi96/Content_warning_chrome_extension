Content Warning Chrome Extension

Blur offensive words on web pages. Warn before opening risky URLs.
No build step. Manifest V3.

✨ Features

Toggle content filtering on any page

Blur offensive words and phrases from badWords.json

Optional URL warning flow with a pre-click interstitial

Report current page to a backend (optional)

Simple popup to enable filter and flag URLs

📂 Folder Structure
Content Warning Chrome Extension/
├─ manifest.json
├─ icon.png
├─ badWords.json
├─ compromise.js             # NLP lib used by content script
├─ content.js                # Blurs text in the page
├─ initiate.js               # Background service worker (MV3)
├─ popup.html
├─ popup.js
├─ warning.html              # Interstitial page
├─ warning.js
└─ welcome.html

🔑 Permissions

storage → for the filter toggle

tabs and webNavigation → for warning flow

host_permissions: <all_urls> → to run on any site

⚙️ How It Works

The popup writes filterEnabled in chrome.storage.sync.

content.js loads badWords.json, builds regexes, and blurs matches inside common content areas.

initiate.js checks a backend for URL risk and can open warning.html first. User can allow once and proceed.

popup.js can send a URL report to a backend.

🚀 Quick Start (Chrome / Edge / Brave)

Download or clone this repo.

Open the browser and go to chrome://extensions.

Turn on Developer mode.

Click Load unpacked and select the extension folder.

Pin the extension.

Click the extension icon.

Turn on Enable filtering.

Visit any page and review the blur effect.

Use “Report this URL” only if you configured a backend.

🖥️ Backend Setup (Optional)

The extension supports reporting URLs and showing warnings before visiting risky sites.
You’ll need a simple PHP + MySQL backend.

Steps:

Install XAMPP → https://www.apachefriends.org/

Start services → Apache + MySQL must be running.

Place the backend files

Extract url_warn and database folders from this project.

Move url_warn into your xampp/htdocs directory.

Example path: C:/xampp/htdocs/url_warn

Import the database

Open https://localhost/phpmyadmin.

Create a new database (e.g. url_warn_db).

Import the .sql file inside the database/ folder.

Verify backend

Visit: http://localhost/url_warn/api/check.php?url=test.com.

You should get a JSON response.

Update constants

In initiate.js and popup.js, confirm:

const BACKEND_BASE = "http://localhost/url_warn";

🛠️ Customising the Dictionary

Edit badWords.json and add words or phrases.

Phrases must include a space to be treated as phrases.

The content script blurs exact matches and prefixes, with allowlists for short tokens.

🌍 Browser Support

Works on Chromium-based browsers with Manifest V3.

Firefox MV3 support is evolving → load as temporary add-on via about:debugging.

✅ Run Checks

Turn on the filter and browse to see blurring.

Use the popup to submit a test URL report (if backend configured).

Visit a flagged URL and confirm interstitial appears.

🔒 Privacy

Filtering runs locally.

Backend calls occur only if you configure and enable reporting.

No analytics.

🐞 Troubleshooting

Nothing blurs

Ensure “Enable filtering” is on.

Reload the page.

Check chrome://extensions → Errors.

Backend errors

Open DevTools → Network in popup.

Check calls to flag.php and check.php.

Confirm CORS/TLS if not on localhost.

Interstitial missing

Ensure check.php returns {"warn": true} for the test URL.

Confirm webNavigation permission is active.

👨‍💻 Development

No build tooling.

Edit files → reload extension in chrome://extensions.

Keep regex changes conservative to avoid over-blurring.

🔐 Security Notes

Treat dictionary as user-generated content.

Validate + sanitise all backend inputs.

Add rate-limits on report endpoints.

🗺️ Roadmap Ideas

Per-site allow/deny lists

User-managed custom dictionary

Export/import settings

Dark mode

📌 Version

1.0
