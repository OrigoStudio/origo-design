import os

diff_path = 'diff_output.patch'
out_dir = r'g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\implementation-artifacts'
with open(diff_path, 'r', encoding='utf-8') as f:
    diff_output = f.read()

blind_hunter = f"""Invoke the `bmad-review-adversarial-general` skill on this diff:

```diff
{diff_output}
```
"""

edge_case = f"""Invoke the `bmad-review-edge-case-hunter` skill on this diff:

```diff
{diff_output}
```
"""

auditor = f"""You are an Acceptance Auditor. Review the provided diff against `_bmad-output/implementation-artifacts/9-3-navigation-shell-primitives-batch-3.md` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Diff:
```diff
{diff_output}
```
"""

with open(os.path.join(out_dir, 'prompt-blind-hunter.md'), 'w', encoding='utf-8') as f:
    f.write(blind_hunter)

with open(os.path.join(out_dir, 'prompt-edge-case-hunter.md'), 'w', encoding='utf-8') as f:
    f.write(edge_case)

with open(os.path.join(out_dir, 'prompt-acceptance-auditor.md'), 'w', encoding='utf-8') as f:
    f.write(auditor)

print("Prompts generated.")
