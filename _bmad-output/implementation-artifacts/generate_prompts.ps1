$diff = Get-Content -Raw -Path "_bmad-output\implementation-artifacts\current-diff.patch"

$blind_prompt = "Invoke the bmad-review-adversarial-general skill on this diff:`n`n```diff`n" + $diff + "`n```"
Set-Content -Path "_bmad-output\implementation-artifacts\prompt-blind-hunter.md" -Value $blind_prompt

$edge_prompt = "Invoke the bmad-review-edge-case-hunter skill on this diff:`n`n```diff`n" + $diff + "`n```"
Set-Content -Path "_bmad-output\implementation-artifacts\prompt-edge-case-hunter.md" -Value $edge_prompt

$auditor_prompt = "You are an Acceptance Auditor. Review the provided diff against _bmad-output/implementation-artifacts/1-6-file-input-and-rich-text-editor.md and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.`n`nDiff:`n`n```diff`n" + $diff + "`n```"
Set-Content -Path "_bmad-output\implementation-artifacts\prompt-acceptance-auditor.md" -Value $auditor_prompt
