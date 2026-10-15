from pathlib import Path

diff_text = Path('_bmad-output/diff.patch').read_text(encoding='utf-8')
spec_file_path = '_bmad-output/implementation-artifacts/stories/2-3-messaging-and-notification-components.md'

blind_hunter = f"Invoke the `bmad-review-adversarial-general` skill on this diff:\n\n{diff_text}\n"
Path('_bmad-output/implementation-artifacts/review-prompt-blind-hunter.md').write_text(blind_hunter, encoding='utf-8')

edge_hunter = f"Invoke the `bmad-review-edge-case-hunter` skill on this diff:\n\n{diff_text}\n"
Path('_bmad-output/implementation-artifacts/review-prompt-edge-case-hunter.md').write_text(edge_hunter, encoding='utf-8')

acceptance_auditor = f"""You are an Acceptance Auditor. Review the provided diff against `{spec_file_path}` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Diff:
{diff_text}
"""
Path('_bmad-output/implementation-artifacts/review-prompt-acceptance-auditor.md').write_text(acceptance_auditor, encoding='utf-8')
print("Done writing prompts.")
