# Contributing

Smith Match welcomes focused bug fixes, accessibility improvements, documentation, reference cases,
and features within the documented RF scope. Participation follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

Use Bun `1.3.14` and Python 3. Playwright work also needs installed browser binaries.

```bash
git clone https://github.com/wmacomber/smithchart.git
cd smithchart
bun install --frozen-lockfile
bunx playwright install --with-deps
bun run dev
```

Create a focused branch. Do not commit `dist/`, reports, caches, or unrelated formatting. Keep pull
requests reviewable and link the issue they address.

## Verification

Run `bun run ci` before every pull request. Add the smallest relevant browser checks:

| Change                                    | Additional evidence                                                |
| ----------------------------------------- | ------------------------------------------------------------------ |
| RF math or units                          | `bun run verify:references && bun run test:rf`                     |
| Chart geometry or interaction             | `bun run test:chart` plus relevant Playwright project              |
| Responsive/accessibility UI               | desktop and mobile Playwright projects; update intentional visuals |
| Export, print, offline, or service worker | focused export/offline suites and Pages-path test                  |
| Dependencies                              | `bun audit`, `bun run licenses`, dependency-review result          |
| Public documentation                      | `bun run verify:docs`                                              |

Full commands and scope appear in [testing documentation](docs/testing.md).

## RF change contract

`src/rf` stays immutable, dependency-free, and free of React, DOM, SVG, URL, storage, network, time,
and logging access. An equation or convention change must update together:

- [Equation register and derivation](docs/mathematics.md)
- [Authoritative conventions](docs/conventions.md)
- Independent Python assertion and checked fixtures
- Deterministic and property tests
- Residual and edge-case evidence

Production and independent verification must not share the same analytical intersection or inverse
implementation. Project-authored fixtures are not external authority.

## Architecture and public behavior

Open an ADR before changing durable architecture, ownership boundaries, state persistence, URL or
export schema, solver semantics, rendering ownership, deployment, offline policy, or security trust
boundaries. Add it to the [ADR index](docs/adr/README.md). Small implementation choices need no ADR.

Preserve keyboard and textual parity with pointer workflows. Check names, focus, errors, announcements,
target size, reduced motion, forced colors, reflow, and mobile order. Manual screen-reader testing is
valuable evidence but not a mandatory gate.

Never add analytics, CDN assets, backend calls, runtime APIs, D3, or a Smith-chart package without an
approved scope and ADR. Screenshot changes must be intentional: update regression snapshots only for
reviewed visual changes; regenerate public images with `bun run capture:docs` when public UI changes.

## Releases and dependencies

User-visible changes update `CHANGELOG.md` under `Unreleased`. Follow [SemVer policy](docs/versioning.md).
Do not change the package version, release notes, or tag in an ordinary feature PR.

Lockfile changes must come from Bun. Confirm exact licenses and notices with `bun run licenses`; unknown,
missing, or changed license identifiers fail verification. Never hand-edit generated license tables.

## Reports and pull requests

- Use issue forms for reproducible bugs and feature proposals.
- Report vulnerabilities only through [private GitHub Security Advisories](SECURITY.md).
- Report sensitive GitHub conduct through the private platform route in the
  [Code of Conduct](CODE_OF_CONDUCT.md); no dedicated maintainer mailbox exists.
- Complete every applicable pull-request checklist item; mark non-applicable items with a reason.
