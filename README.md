Content Warning Extension

Blur offensive words on web pages. Warn before opening risky URLs.
No build step. Manifest V3.

Features

Toggle content filtering on any page

Blur offensive words and phrases from badWords.json

Optional URL warning flow with a pre-click interstitial

Report current page to a backend (optional)

Simple popup to enable filter and flag URLs

Folder structure
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

Permissions

storage for the filter toggle

tabs and webNavigation for warning flow

host_permissions: <all_urls> to run on any site

How it works

The popup writes filterEnabled in chrome.storage.sync.

content.js loads badWords.json, builds regexes, then blurs matches inside common content areas.

initiate.js checks a backend for URL risk and can open warning.html first. You can allow once and proceed.

popup.js can send a URL report to a backend.

Quick start (Chrome / Edge / Brave)

Download or clone this repo.

Open the browser and go to chrome://extensions.

Turn on Developer mode.

Click “Load unpacked” and select the Content Warning Chrome Extension folder.

Pin the extension.

Click the extension icon.

Turn on “Enable filtering.”

Visit any page and review the blur effect.

Use “Report this URL” only if you configured a backend.

Backend setup (optional, for URL warnings and reporting)

The extension supports reporting URLs and showing warnings before visiting risky sites.
To enable this, you need a simple PHP + MySQL backend.

Steps

Download and install XAMPP
Get it here: https://www.apachefriends.org/

Start services
Open the XAMPP Control Panel and ensure:

Apache is Running

MySQL is Running

Place the backend files

Extract the url_warn and database folders from this project.

Move the url_warn folder into your xampp/htdocs directory.

Example path: C:/xampp/htdocs/url_warn

Import the database

Open https://localhost/phpmyadmin
 in your browser.

Create a new database (e.g. url_warn_db).

Go to the Import tab.

Choose the .sql file inside the database folder.

Import it to populate the required tables.

Verify backend is live

Open http://localhost/url_warn/api/check.php?url=test.com

You should get a JSON response.

Update extension constants if needed

In initiate.js and popup.js, confirm BACKEND_BASE is set to:

const BACKEND_BASE = "http://localhost/url_warn";

Customising the dictionary

Edit badWords.json and add words or phrases.

Phrases must include a space to be treated as phrases.

The content script will blur exact matches and prefixes, with simple allowlists for short tokens.

Browser support

Works on Chromium-based browsers with Manifest V3.

Firefox MV3 support is still evolving. Load as a temporary add-on in about:debugging and test.

Run checks

Turn on the filter and browse to see blurring.

Use the popup to submit a test URL report (if backend is configured).

Visit a flagged URL and confirm the interstitial appears.

Privacy

Filtering runs locally in the page.

Backend calls occur only if you configure a backend and use reporting or URL checks.

No analytics.

Troubleshooting

Nothing blurs

Ensure “Enable filtering” is on.

Reload the page.

Check chrome://extensions → this extension → “Errors”.

Backend errors

Open DevTools → Network in the popup and check calls to flag.php and check.php.

Confirm CORS/TLS if not on localhost.

Interstitial missing

Ensure BACKEND_CHECK_URL returns {"warn": true} for the test URL.

Confirm the webNavigation permission is active.

Development

No build tooling.

Edit files and click “Reload” on the extensions page.

Keep regex changes conservative to avoid over-blurring.

Security notes

Treat the dictionary as user-generated content.

Validate and sanitise all backend inputs.

Add rate-limits on report endpoints.

Roadmap ideas

Per-site allow/deny lists

User-managed custom dictionary

Export/import settings

Dark mode

Version 1.0