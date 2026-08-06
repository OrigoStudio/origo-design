import os
import subprocess

diff = subprocess.check_output(['git', 'diff', '20b8f44fa7ed14fcdb9fc746428d49c53baf0ca5'], encoding='utf-8', errors='ignore')

with open('_bmad-output/implementation-artifacts/prompt-blind-hunter.md', 'w', encoding='utf-8') as f:
    f.write("Invoke the bmad-review-adversarial-general skill on this diff:\n\n" + diff)

with open('_bmad-output/implementation-artifacts/prompt-edge-case-hunter.md', 'w', encoding='utf-8') as f:
    f.write("Invoke the bmad-review-edge-case-hunter skill on this diff:\n\n" + diff)

with open('_bmad-output/implementation-artifacts/prompt-acceptance-auditor.md', 'w', encoding='utf-8') as f:
    f.write("You are an Acceptance Auditor. Review the provided diff against _bmad-output/implementation-artifacts/stories/2-1-design-token-schema-foundation.md and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.\n\nDiff:\n" + diff)
