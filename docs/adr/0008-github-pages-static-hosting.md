# ADR 0008: GitHub Pages static hosting

Status: Accepted

## Context

Project requires public static hosting under repository subpath without production server.

## Decision

GitHub Actions builds and deploys `dist` to GitHub Pages. `BASE_PATH` controls Vite base URL; project-site deployment uses `/<repository>/`, while root or custom-domain hosting uses `/`.

## Consequences

All source and public asset references must honor Vite base path. Deployment workflow owns Pages permissions and artifact publication.

Service-worker and offline-reload policy remain deferred to Phase 7; Phase 1 adds no PWA dependency or worker.

## Rejected

Backend hosting and hardcoded root asset URLs: violate scope or break project-site paths.

## Verification

Root build, `/smithchart/` build, Chromium asset smoke, and successful Pages deployment.
