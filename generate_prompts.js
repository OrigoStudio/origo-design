const fs = require('fs');
const diff = fs.readFileSync('_bmad-output/implementation-artifacts/diff.txt', 'utf8');
const specPath =
  '_bmad-output/implementation-artifacts/stories/4-4-extensibility-and-plugin-schema.md';

const blindHunterPrompt = `Invoke the \`bmad-review-adversarial-general\` skill on this diff:\n\n${diff}`;
const edgeCaseHunterPrompt = `Invoke the \`bmad-review-edge-case-hunter\` skill on this diff:\n\n${diff}`;
const acceptanceAuditorPrompt = `You are an Acceptance Auditor. Review the provided diff against \`${specPath}\` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.\n\nDiff:\n${diff}`;

fs.writeFileSync('_bmad-output/implementation-artifacts/prompt-blind-hunter.md', blindHunterPrompt);
fs.writeFileSync(
  '_bmad-output/implementation-artifacts/prompt-edge-case-hunter.md',
  edgeCaseHunterPrompt
);
fs.writeFileSync(
  '_bmad-output/implementation-artifacts/prompt-acceptance-auditor.md',
  acceptanceAuditorPrompt
);
console.log('Prompts generated successfully.');
