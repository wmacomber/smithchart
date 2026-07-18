# Versioning and changelog policy

Smith Match uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Tags use annotated or signed
`vMAJOR.MINOR.PATCH` form. `CHANGELOG.md` keeps an `Unreleased` section and becomes the source for each
GitHub Release; detailed version notes remain under `docs/release-notes/`.

## Compatibility boundaries

- **Major:** incompatible URL-state schema, exported metadata contract, solver-result semantics, or
  removal of documented behavior.
- **Minor:** backward-compatible feature, matching capability, or additive state/metadata form.
- **Patch:** compatible correctness, documentation, accessibility, dependency, or security fix.

Package version, app footer, exported SVG metadata, changelog, release note, tag, and GitHub Release
must match. URL parsers must retain documented backward compatibility or increment their schema and
major version deliberately.

Only the latest minor of the current major receives planned fixes. No LTS branch is promised. Feature
pull requests add user-visible changes under `Unreleased`; release preparation moves those entries to
the version and actual release date.
