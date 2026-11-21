DreamyDiaries — first prototype

HOW TO OPEN
1. Extract the DreamyDiaries folder from the ZIP.
2. Open the folder.
3. Double-click index.html. It should open in your browser.

FEATURES
- Monthly calendar and date selection
- Daily diary title and writing area
- Daily mood selection
- Daily to-do list with completion tracking
- Task progress indicator
- Search diary entries
- Light/dark theme
- Export and import backup

IMPORTANT PRIVACY NOTE
This prototype stores diary data in the browser's local storage on this device.
It does not upload entries to a server. Clearing browser data, using a different
browser/device, or opening the app in a different browser profile may make the
entries unavailable. Use Export my data regularly to save a backup.

This is a first prototype, not yet a secure cloud-synced app or published mobile app.


PWA / MOBILE INSTALL VERSION
This folder now includes a web app manifest, app icons, and a service worker.
When hosted on an HTTPS website, Android browsers that support installation can
offer an Install app / Add to Home screen option. The service worker caches the
app shell for offline opening after the first successful visit.

Diary entries still remain in each user's browser storage on that device.
They are not sent to Dreamyland Translations or to a central database.

IMPORTANT
Opening index.html directly as a file is still useful for desktop testing, but
PWA installation and offline app-shell caching require HTTPS hosting (or
localhost). This is a PWA preparation build, not yet a Google Play or Apple
App Store submission package.
