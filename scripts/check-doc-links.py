#!/usr/bin/env python3
from pathlib import Path
import re
import subprocess


def slug(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value).strip().lower()
    value = re.sub(r"[^\w\- ]", "", value)
    return re.sub(r"[\s\-]+", "-", value).strip("-")


tracked = subprocess.run(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard", "--", "*.md"],
    check=True,
    text=True,
    capture_output=True,
).stdout.splitlines()
documents = [Path(name) for name in tracked]
failures = []
anchors = {}

for document in documents:
    text = document.read_text(encoding="utf-8")
    seen = {}
    document_anchors = set()
    for heading in re.findall(r"^#{1,6}\s+(.+?)\s*$", text, re.MULTILINE):
        base = slug(heading)
        count = seen.get(base, 0)
        seen[base] = count + 1
        document_anchors.add(base if count == 0 else f"{base}-{count}")
    anchors[document.resolve()] = document_anchors

for document in documents:
    text = document.read_text(encoding="utf-8")
    targets = re.findall(r"\[[^]]*\]\((?!https?://|mailto:)([^)]+)\)", text)
    targets += re.findall(r'<img\s+[^>]*src="(?!https?://)([^"]+)"', text)
    for raw_target in targets:
        target = raw_target.strip().strip("<>")
        file_part, separator, fragment = target.partition("#")
        path = (document.parent / (file_part or document.name)).resolve()
        if not path.exists():
            failures.append(f"{document}: missing {target}")
            continue
        if fragment and path.suffix.lower() == ".md" and fragment not in anchors.get(path, set()):
            failures.append(f"{document}: missing fragment #{fragment} in {file_part or document.name}")
        if file_part:
            current = document.parent.resolve()
            for part in Path(file_part).parts:
                if part == "..":
                    current = current.parent
                    continue
                if part == ".":
                    continue
                names = {entry.name for entry in current.iterdir()}
                if part not in names:
                    failures.append(f"{document}: path case mismatch in {target}")
                    break
                current /= part

if failures:
    raise SystemExit("\n".join(sorted(set(failures))))
print(f"Documentation links clean across {len(documents)} tracked Markdown files")
