import os

diff_path = r"_bmad-output/implementation-artifacts/current-diff.patch"
with open(diff_path, "r", encoding="utf-8") as f:
    diff_content = f.read()

blind_prompt = f"""Invoke the bmad-review-adversarial-general skill on this diff:

```diff
{diff_content}
```"""
with open(r"_bmad-output/implementation-artifacts/prompt-blind-hunter.md", "w", encoding="utf-8") as f:
    f.write(blind_prompt)

edge_prompt = f"""Invoke the bmad-review-edge-case-hunter skill on this diff:

```diff
{diff_content}
```"""
with open(r"_bmad-output/implementation-artifacts/prompt-edge-case-hunter.md", "w", encoding="utf-8") as f:
    f.write(edge_prompt)

auditor_prompt = f"""You are an Acceptance Auditor. Review the provided diff against _bmad-output/implementation-artifacts/1-6-file-input-and-rich-text-editor.md and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Diff:
```diff
{diff_content}
```"""
with open(r"_bmad-output/implementation-artifacts/prompt-acceptance-auditor.md", "w", encoding="utf-8") as f:
    f.write(auditor_prompt)
