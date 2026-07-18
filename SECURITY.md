# Security Policy

## Supported versions

| Version                                  | Supported |
| ---------------------------------------- | :-------: |
| Latest released `1.x` minor              |    Yes    |
| Older releases and development snapshots |    No     |

Only the latest minor of the current major receives planned security fixes. Smith Match has no LTS
branches. Until `v1.0.0` is tagged, `main` is a development snapshot rather than a supported release.

## Report a vulnerability

Submit a [private GitHub Security Advisory](https://github.com/wmacomber/smithchart/security/advisories/new).
Do not open a public issue, discussion, or pull request containing exploit details.

Maintainers target acknowledgement within seven calendar days and an initial assessment within
fourteen. These are response targets, not remediation guarantees. Severity, fix timing, credit, and
public disclosure are coordinated with the reporter case by case. Maintainers may request a minimal
reproduction and affected version.

Use the public bug form for ordinary defects. Use GitHub's private platform-reporting route described
in the [Code of Conduct](CODE_OF_CONDUCT.md) for sensitive conduct incidents; security advisories are
not a conduct reporting channel.

## Security and privacy scope

Smith Match is a static browser application deployed through GitHub Pages. Relevant surfaces include:

- URL parsing and shareable calculation state
- Browser local storage for display preferences
- Service-worker registration, scope, updates, and application precache
- Standalone SVG export and print output
- JavaScript dependencies, build tooling, and GitHub Actions/Pages deployment

The application has no account system, authentication, backend, database, analytics, advertising, or
runtime API. It sends no calculation or preference data to project infrastructure. Calculation values
in shared URLs are intentionally public to recipients and may remain in browser history or external
logs when users share those URLs.

Exported SVG is active content when opened by a browser. Export sanitization removes scripts, event
handlers, external references, embedded HTML/media, links, animations, and source styles before adding
project-owned static CSS and escaped JSON metadata. Filename and MIME type are fixed. Metadata contains
calculation values and application version; treat exported calculations as user-visible data.

## Good-faith research

Good-faith testing is welcome against resources owned by this project when it avoids privacy impact,
data destruction, service disruption, social engineering, denial of service, automated traffic against
third parties, and access beyond what is needed to demonstrate a finding. Stop and report when sensitive
data or unintended access appears. This statement does not authorize testing of GitHub, dependency
publishers, or other third-party infrastructure and does not waive their policies or legal rights.

Maintainers will not initiate legal action for research that follows this policy. This is a project
statement, not formal security certification or legal advice.
