# Security Policy

Report vulnerabilities privately through GitHub Security Advisories. Do not open public exploit issues. Maintainers assess supported `1.x` releases and coordinate fixes/disclosure.

Application stores no account or server data. Shared URLs contain only RF calculation values. Preferences remain in local browser storage.

Exported SVG is active content when opened in a browser. Export sanitization removes scripts, event handlers, external references, embedded HTML/media, and source styles before adding project-owned static CSS and escaped JSON metadata. Download filename and MIME type are fixed; exported metadata contains calculation values and application version only.
