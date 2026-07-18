#!/usr/bin/env python3
from pathlib import Path
import json
import re
import struct
import subprocess


failures = []
root = Path.cwd()
package = json.loads((root / "package.json").read_text())
version = package["version"]
if package.get("packageManager") != "bun@1.3.14":
    failures.append("package.json: packageManager must pin bun@1.3.14")

subprocess.run(["python3", "scripts/check-doc-links.py"], check=True)

readme = (root / "README.md").read_text()
required_readme = [
    "https://wmacomber.github.io/smithchart/",
    "bun install --frozen-lockfile",
    "bun run dev",
    "docs/assets/smith-match-desktop.png",
    "docs/assets/smith-match-mobile.png",
]
for value in required_readme:
    if value not in readme:
        failures.append(f"README.md: missing {value}")

documented_scripts = set(re.findall(r"`bun run ([a-zA-Z0-9:_-]+)(?:\s[^`]*)?`", readme))
unknown_scripts = documented_scripts - set(package["scripts"])
if unknown_scripts:
    failures.append(f"README.md: unknown scripts {sorted(unknown_scripts)}")
missing_scripts = set(package["scripts"]) - documented_scripts
if missing_scripts:
    failures.append(f"README.md: undocumented scripts {sorted(missing_scripts)}")

for name, expected in {
    "docs/assets/smith-match-desktop.png": (1440, 900),
    "docs/assets/smith-match-mobile.png": (390, 844),
}.items():
    path = root / name
    if not path.exists():
        failures.append(f"{name}: missing curated screenshot")
        continue
    with path.open("rb") as image:
        header = image.read(24)
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        failures.append(f"{name}: not PNG")
    else:
        dimensions = struct.unpack(">II", header[16:24])
        if dimensions != expected:
            failures.append(f"{name}: dimensions {dimensions} != {expected}")
    if path.stat().st_size > 700 * 1024:
        failures.append(f"{name}: exceeds 700 KiB documentation budget")

for release_file in [root / f"docs/release-notes/v{version}.md", root / "CHANGELOG.md"]:
    if not release_file.exists() or version not in release_file.read_text():
        failures.append(f"{release_file.relative_to(root)}: missing version {version}")
if version not in readme:
    failures.append(f"README.md: missing version {version}")
if "Latest released `1.x` minor" not in (root / "SECURITY.md").read_text():
    failures.append("SECURITY.md: supported 1.x policy missing")

adr_files = sorted((root / "docs/adr").glob("[0-9][0-9][0-9][0-9]-*.md"))
numbers = [int(path.name[:4]) for path in adr_files]
if numbers != list(range(1, len(numbers) + 1)):
    failures.append(f"docs/adr: non-contiguous numbering {numbers}")
index = (root / "docs/adr/README.md").read_text()
for adr in adr_files:
    text = adr.read_text()
    if "Status: Accepted" not in text:
        failures.append(f"{adr.relative_to(root)}: status is not Accepted")
    if adr.name not in index:
        failures.append(f"docs/adr/README.md: missing {adr.name}")

public_documents = [
    root / "README.md",
    root / "CONTRIBUTING.md",
    root / "SECURITY.md",
    root / "CODE_OF_CONDUCT.md",
    root / "CHANGELOG.md",
]
placeholder = re.compile(r"\b(?:TODO|TBD|FIXME)\b|\[INSERT|example\.com", re.IGNORECASE)
for document in public_documents:
    if placeholder.search(document.read_text()):
        failures.append(f"{document.name}: placeholder text remains")

for document in [root / "docs/mathematics.md", root / "docs/conventions.md"]:
    text = document.read_text()
    if "\\[" in text or "\\]" in text:
        failures.append(f"{document.relative_to(root)}: use GitHub $/$$ math delimiters")

conduct = (root / "CODE_OF_CONDUCT.md").read_text()
if "https://support.github.com/contact/report-abuse" not in conduct:
    failures.append("CODE_OF_CONDUCT.md: private GitHub conduct-report route missing")
if "no dedicated private maintainer mailbox" not in conduct.lower():
    failures.append("CODE_OF_CONDUCT.md: reporting limitation is not explicit")

license_check = subprocess.run(
    ["node", "scripts/dependency-license-report.mjs"], text=True, capture_output=True
)
if license_check.returncode:
    failures.extend(line for line in license_check.stderr.splitlines() if line)

for required in ["public/LICENSE.txt", "public/THIRD_PARTY_NOTICES.txt"]:
    if not (root / required).exists():
        failures.append(f"{required}: missing distribution notice")

if failures:
    raise SystemExit("\n".join(sorted(set(failures))))
print(f"Public documentation verified for v{version}")
