$diff = Get-Content diff_mod.patch -Raw

$bh = "Invoke the `bmad-review-adversarial-general` skill on this diff:`n`n$diff"
Set-Content -Path _bmad-output\implementation-artifacts\bmad-review-blind-hunter.md -Value $bh

$ech = "Invoke the `bmad-review-edge-case-hunter` skill on this diff:`n`n$diff"
Set-Content -Path _bmad-output\implementation-artifacts\bmad-review-edge-case-hunter.md -Value $ech

$aa = "You are an Acceptance Auditor. Review the provided diff against `_bmad-output/implementation-artifacts/stories/retro-9-a11y-rtl-knowledge-transfer.md` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.`n`nDiff:`n$diff"
Set-Content -Path _bmad-output\implementation-artifacts\bmad-review-acceptance-auditor.md -Value $aa
