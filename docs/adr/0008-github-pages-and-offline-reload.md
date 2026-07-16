# ADR 0008: Pages and offline reload

Status: Accepted

## Decision

Deploy `dist` to Pages. Workbox-generated service worker precaches HTML plus same-origin hashed
scripts, styles, fonts, images, and favicon. Navigation falls back to cached `index.html`. Updates
prompt before activation and remove outdated caches. No runtime cache routes or installable manifest.

`BASE_PATH` must start and end with `/`; `/smithchart/` is release deployment value. Calculation
state remains in query string, so offline reload and worker update preserve current calculation.

## Consequences

Previously visited app reloads offline after worker activates. First-ever offline load is unsupported.
PWA installation, manifest, install UI, background sync, and push remain future work.

## Rejected

Loaded-session-only offline behavior.

## Verification

Artifact audit proves complete same-origin precache, navigation fallback, and worker URL/scope alignment.
Playwright disables network and reloads query-backed calculations under root in Chromium, Firefox,
and WebKit. WebKit schedules reload in-page because Playwright's direct offline navigation API throws
an internal WebKit error; resulting document and every static asset must still load from worker cache.
A supplemental Chromium run exercises `/smithchart/`; browser-independent artifact checks prove base,
worker URL, worker scope, fallback, and precache alignment.
