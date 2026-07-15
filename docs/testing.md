# Testing

Vitest owns deterministic unit and integration tests. Tests normally sit beside their module as `*.test.ts` or `*.test.tsx`; grouped fixtures may use `__tests__`. Cross-module unit fixtures live under `tests/unit/fixtures`.

fast-check owns meaningful RF invariants beginning in Phase 2. Placeholder properties are prohibited.

Playwright owns browser workflows under `tests/e2e/*.spec.ts`. Phase 1 config defines Chromium, Firefox, and WebKit; CI gates Chromium smoke only. Later hardening gates the full matrix.

Run:

```bash
bun run test
bun run build
bun run test:e2e -- --project=chromium
bun run ci
```

RF fixtures will live under `tests/reference-cases` and must come from an independent method rather than copied production equations.
