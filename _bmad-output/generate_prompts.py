import os

diff_path = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\diff_output.txt"
out_dir = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\implementation-artifacts"

# Handle UTF-16 if the shell generated it that way
try:
    with open(diff_path, "r", encoding="utf-16le") as f:
        diff_output = f.read()
except UnicodeError:
    with open(diff_path, "r", encoding="utf-8") as f:
        diff_output = f.read()

blind_hunter_prompt = f"""Invoke the `bmad-review-adversarial-general` skill on this diff:

{diff_output}
"""

edge_case_prompt = f"""Invoke the `bmad-review-edge-case-hunter` skill on this diff:

{diff_output}
"""

spec_file = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\implementation-artifacts\stories\3-5-3-defensive-ast-traversal.md"
acceptance_auditor_prompt = f"""You are an Acceptance Auditor. Review the provided diff against `{spec_file}` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Diff:
{diff_output}
"""

with open(os.path.join(out_dir, "prompt_blind_hunter.txt"), "w", encoding="utf-8") as f:
    f.write(blind_hunter_prompt)

with open(os.path.join(out_dir, "prompt_edge_case_hunter.txt"), "w", encoding="utf-8") as f:
    f.write(edge_case_prompt)

with open(os.path.join(out_dir, "prompt_acceptance_auditor.txt"), "w", encoding="utf-8") as f:
    f.write(acceptance_auditor_prompt)

print("Prompt files generated.")
