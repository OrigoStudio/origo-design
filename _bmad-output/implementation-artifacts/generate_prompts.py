diff_path = '_bmad-output/implementation-artifacts/filtered-diff.patch'
with open(diff_path, 'r', encoding='utf-8') as f:
    diff_output = f.read()

blind_hunter = f"""Invoke the bmad-review-adversarial-general skill on this diff:

{diff_output}
"""
with open('_bmad-output/implementation-artifacts/bmad-review-blind-hunter.md', 'w', encoding='utf-8') as f:
    f.write(blind_hunter)

edge_case_hunter = f"""Invoke the bmad-review-edge-case-hunter skill on this diff:

{diff_output}
"""
with open('_bmad-output/implementation-artifacts/bmad-review-edge-case-hunter.md', 'w', encoding='utf-8') as f:
    f.write(edge_case_hunter)

acceptance_auditor = f"""You are an Acceptance Auditor. Review the provided diff against `_bmad-output/implementation-artifacts/stories/retro-9-playwright-component-testing.md` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Diff:
{diff_output}
"""
with open('_bmad-output/implementation-artifacts/bmad-review-acceptance-auditor.md', 'w', encoding='utf-8') as f:
    f.write(acceptance_auditor)
