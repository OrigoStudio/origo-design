import os

diff_path = "diff.patch"
out_dir = "implementation-artifacts"

with open(diff_path, "r", encoding="utf-8") as f:
    diff_text = f.read()

blind_hunter = f"Invoke the `bmad-review-adversarial-general` skill on this diff:\n\n{diff_text}"
edge_case_hunter = f"Invoke the `bmad-review-edge-case-hunter` skill on this diff:\n\n{diff_text}"

spec_path = "implementation-artifacts/1-1-core-buttons-and-actions.md"
acceptance_auditor = f"You are an Acceptance Auditor. Review the provided diff against `{spec_path}` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.\n\nDiff:\n{diff_text}"

with open(os.path.join(out_dir, "review-prompt-blind-hunter.md"), "w", encoding="utf-8") as f:
    f.write(blind_hunter)
with open(os.path.join(out_dir, "review-prompt-edge-case-hunter.md"), "w", encoding="utf-8") as f:
    f.write(edge_case_hunter)
with open(os.path.join(out_dir, "review-prompt-acceptance-auditor.md"), "w", encoding="utf-8") as f:
    f.write(acceptance_auditor)

print("Prompt files generated.")
