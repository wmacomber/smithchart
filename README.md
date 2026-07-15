# Smith Match

Browser-only RF instrument for calculating and explaining lossless single shunt-stub impedance matches. Phase 1 provides static React, TypeScript, testing, and deployment foundations; RF and chart behavior arrive in later phases.

## Requirements

- Bun 1.3.14
- Playwright Chromium for browser smoke tests

## Develop

```bash
bun --version
bun install --frozen-lockfile
bun run dev
```

Run project checks:

```bash
bun run ci
bun run build
bun run test:e2e -- --project=chromium
```

Vite builds static files into `dist/`. `BASE_PATH=/smithchart/ bun run build` produces a GitHub Pages project-site build. Deployed files require no Bun, Node, backend, or runtime API.

See [architecture](docs/architecture.md), [mathematics](docs/mathematics.md), [testing](docs/testing.md), [accessibility](docs/accessibility.md), and [contributing](CONTRIBUTING.md).

MIT licensed.
