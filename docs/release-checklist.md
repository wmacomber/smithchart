# Release checklist

Record owner, commit/tag, exact command/result, reviewer, and deviations in
`docs/IMPLEMENTATION_CHECKLIST.md`. Never mark a gate complete while required evidence fails.

## 1. Source and tooling

- [ ] Release commit reviewed; tracked worktree clean after generated artifacts are committed.
- [ ] Bun `1.3.14`, Python 3, and required Playwright browsers available.
- [ ] `bun install --frozen-lockfile` succeeds from a clean dependency install.

## 2. Documentation, governance, and metadata

- [ ] `bun run verify:docs`, `bun run format:check`, and `git diff --check` pass.
- [ ] README live link/screenshots, architecture, math, conventions, testing, accessibility, and policies reviewed.
- [ ] Conduct policy states available reporting limits accurately; issue/PR templates render correctly.
- [ ] ADR index/status/verification, changelog, release notes, and versioning policy agree.
- [ ] Repository description, homepage, topics, visibility, Issues, and security reporting match policy.
- [ ] `main` requires pull requests, `validate`/`review` checks, and resolved conversations; admin
      enforcement is on and force-push/deletion are off.

## 3. Security and licensing

- [ ] `bun audit` reports no unresolved vulnerability.
- [ ] Dependency Review workflow passes; GitHub Actions remain commit-pinned and least privilege.
- [ ] `bun run licenses` matches lockfile; runtime notices ship in `public/` and `dist/`.
- [ ] Secret/config/runtime-network review reports no direct exposure.

## 4. Product, mathematics, and browser evidence

- [ ] `bun run ci` passes all deterministic gates.
- [ ] Twelve RF cases, both terminations, nine named equation assertions, edge cases, and residuals pass.
- [ ] Full desktop Chromium/Firefox/WebKit and mobile Chromium/WebKit matrix passes.
- [ ] Visual changes reviewed; accessibility automation, reflow, motion, forced colors, and text equivalents pass.
- [ ] Export sanitization, print worksheet, clipboard fallback, and performance budgets pass.

## 5. Distribution

- [ ] `bun run verify:reproducible-build` produces identical digests.
- [ ] `BASE_PATH=/smithchart/ bun run build`, offline artifact audit, and Pages-path browser test pass.
- [ ] Built `LICENSE.txt` and `THIRD_PARTY_NOTICES.txt` exist.
- [ ] No runtime API/remote asset exists; root and Pages-path offline reload pass.

## 6. Version and release

- [ ] Package, footer, export metadata, changelog, release note, tag, and release title use `1.0.0`.
- [ ] Changelog version uses actual release date; GitHub Release body derives from its entry.
- [ ] Annotated or signed `v1.0.0` tag created only after reviewer acceptance.
- [ ] Pages deploy succeeds; HTTPS, share URL, service-worker update, export, print, and live-demo smoke pass.
- [ ] First release rollback documents known-good commit redeployment. Later releases prove previous-tag redeployment.
- [ ] GitHub Release published only after live validation.

## Phase 8A exit

- [ ] Public docs, screenshots, notices, templates, ADRs, changelog, and repository settings contain no placeholders or contradictions.
- [ ] Deterministic docs/license checks, CI, audit, browser matrix, Pages path, reproducibility, and HTTPS smoke pass.
- [ ] Reviewer records Phase 8A acceptance.

Tagging and publishing the GitHub Release remain approval-controlled. Overall Phase 8 stays open until
those external gates complete.
