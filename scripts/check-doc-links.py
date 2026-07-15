#!/usr/bin/env python3
from pathlib import Path
import re

failures = []
for document in Path("docs").rglob("*.md"):
    text = document.read_text()
    for target in re.findall(r"\[[^]]+\]\((?!https?://|#)([^)]+)\)", text):
        path = (document.parent / target.split("#", 1)[0]).resolve()
        if not path.exists(): failures.append(f"{document}: missing {target}")
if failures: raise SystemExit("\n".join(failures))
print("Documentation links clean")
