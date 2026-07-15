# Contributing

Use Bun version compatible with committed lockfile. Create focused branches. Run `bun run ci` and relevant Playwright projects before pull request.

RF changes must preserve `src/rf` boundary, update equation docs/reference fixtures/Python verifier together, and show residual evidence. Architecture changes require accepted ADR. Never add runtime analytics, CDN assets, backend calls, D3, or Smith-chart packages without explicit scope and ADR approval.

Report conduct issues under `CODE_OF_CONDUCT.md`; security issues through `SECURITY.md`.
