# Architecture decision records

Accepted ADRs define durable boundaries. Implementation changes that contradict one require a new ADR
that explicitly supersedes it. Verification commands remain executable release evidence.

| ADR                                                   | Decision                             | Primary implementation   | Verification                     |
| ----------------------------------------------------- | ------------------------------------ | ------------------------ | -------------------------------- |
| [0001](0001-bun-vite-static-spa.md)                   | Bun, Vite, static SPA                | Build and Pages workflow | Frozen install and build         |
| [0002](0002-rf-core-boundary-and-unit-types.md)       | Pure RF core and branded units       | `src/rf`                 | `bun run check:rf-boundary`      |
| [0003](0003-rf-conventions-and-analytical-solver.md)  | Signs and analytical two-root solver | RF solver                | References and RF tests          |
| [0004](0004-custom-svg-renderer.md)                   | Project-owned native SVG             | `src/chart`              | Geometry and export tests        |
| [0005](0005-reducer-url-and-preference-state.md)      | Reducer, URL, preference ownership   | App and persistence      | URL/history/storage tests        |
| [0006](0006-testing-and-independent-rf-references.md) | Independent RF evidence model        | Tests and verifier       | `bun run ci` plus browser matrix |
| [0007](0007-plain-css-react-aria-and-no-d3.md)        | Plain CSS and native semantics       | Components and styles    | Dependency/accessibility review  |
| [0008](0008-github-pages-and-offline-reload.md)       | Pages and offline reload             | Vite PWA configuration   | Offline and Pages-path tests     |
| [0009](0009-degenerate-and-active-load-policy.md)     | Degenerate/active-load result policy | RF solver and results    | Unit and browser tests           |
| [0010](0010-sanitized-standalone-svg-export.md)       | Sanitized standalone SVG export      | Export serializer        | Sanitizer and download tests     |

Current records are Accepted. None is superseded.
