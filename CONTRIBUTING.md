# Contributing

Use Bun 1.3.14. Create focused branches and pull requests. Install from committed lockfile:

```bash
bun --version
bun install --frozen-lockfile
bun run ci
```

Run relevant Playwright projects for browser changes. Never hand-edit `bun.lock`. Dependency changes require a focused PR, regenerated lockfile, passing CI, dependency review, and documented architectural need.

Keep `src/rf` independent from React, DOM, SVG, storage, URLs, and third-party packages. Architecture changes require an accepted ADR. Do not add runtime analytics, CDN assets, backend calls, UI frameworks, D3-owned chart mathematics, or Smith-chart packages without explicit scope approval.

Report conduct issues under `CODE_OF_CONDUCT.md`; report security issues through `SECURITY.md`.
