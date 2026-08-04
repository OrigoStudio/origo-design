[
  {
    "location": "_bmad-output/implementation-artifacts/sprint-status.yaml:55",
    "trigger_condition": "Status set to in-progress while story markdown specifies completed.",
    "guard_snippet": "1-4-documentation-site-starlight: done",
    "potential_consequence": "Tooling and tracking reports will show out-of-sync status."
  },
  {
    "location": "_bmad-output/implementation-artifacts/stories/1-4-documentation-site-starlight.md:5",
    "trigger_condition": "completion_commit uses placeholder string '~1.4' instead of actual git commit SHA.",
    "guard_snippet": "completion_commit: 4322b0a2f4691f17ca60dc3cda183b8b3400cc7b",
    "potential_consequence": "Parsing tools will fail to locate or verify the completion commit."
  },
  {
    "location": "apps/docs:1",
    "trigger_condition": "Git subproject/submodule commit added without matching .gitmodules entry.",
    "guard_snippet": "[submodule \"apps/docs\"]\\n\\tpath = apps/docs\\n\\turl = <repo-url>",
    "potential_consequence": "Fresh repository clones will fail to fetch docs application code."
  },
  {
    "location": "diff_1_4_untracked.txt:1",
    "trigger_condition": "Temporary diagnostic files are committed to the repository root directory.",
    "guard_snippet": "Add diff_*.txt to .gitignore configuration file.",
    "potential_consequence": "Repository root folder gets cluttered with untracked local diff output."
  },
  {
    "location": "apps/docs/package.json:1",
    "trigger_condition": "Astro commands defined in scripts but dependencies only declared in root package.json.",
    "guard_snippet": "\"devDependencies\": { \"astro\": \"^4.13.2\", \"@astrojs/starlight\": \"^0.25.0\" }",
    "potential_consequence": "Running npm install and astro commands inside apps/docs directory will fail."
  }
]
