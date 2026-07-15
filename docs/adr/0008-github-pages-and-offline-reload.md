# ADR 0008: Pages and offline reload

Status: Accepted

## Decision

Deploy `dist` to Pages. Workbox-generated service worker precaches same-origin assets, prompts before update, no installable manifest.

## Consequences

Previously visited app reloads offline. PWA installation remains future.

## Rejected

Loaded-session-only offline behavior.

## Verification

Pages-path and offline Playwright tests.
