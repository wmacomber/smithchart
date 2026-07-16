# Release Checklist

## Product and math

- [x] Required v1 workflows and nine presets complete.
- [x] Degenerate/active states accurate.
- [x] Nine named equation assertions, twelve solved reference cases, both stub terminations, and tagged edge cases pass through alternate-formulation verification.
- [x] Every returned solution meets residual bound.

## Access and platform

- [x] Mouse, touch, keyboard, textual workflows pass.
- [x] Chromium, Firefox, WebKit and axe pass.
- [x] Desktop, mobile, and reduced-motion automated checks pass; forced-colors CSS present.

## Distribution

- [x] Standalone SVG sanitization, embedded style, accessible prose, versioned metadata, and download checks pass.
- [x] Printable solved/stale/matched worksheet checks and monochrome visual baseline pass.
- [x] Root and Pages-path offline reload, complete precache, scoped registration, and URL-backed update preservation pass.
- [x] Runtime network audit clean.
- [x] Installable PWA remains explicitly deferred; worker provides offline reload only.
- [x] Frozen/reproducible build passes.
- [x] MIT and direct dependency licenses confirmed; `bun audit` clean.
- [ ] Pages deployment and prior-tag rollback tested.
