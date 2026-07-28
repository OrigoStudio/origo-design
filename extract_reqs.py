import re

prd_path = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\design-artifacts\B-Functional-Requirements\functional-requirements.md"
report_path = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\planning-artifacts\implementation-readiness-report-2026-07-28.md"

frs = []
nfrs = []

with open(prd_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith("**FR-"):
            # Check if it's an NFR
            if any(x in line for x in ["FR-PERF-", "FR-OBS-", "FR-TEST-", "FR-ADOPT-"]):
                nfrs.append(line)
            else:
                frs.append(line)

with open(report_path, 'a', encoding='utf-8') as f:
    f.write("\n## PRD Analysis\n\n")
    f.write("### Functional Requirements\n\n")
    for fr in frs:
        f.write(f"{fr}\n")
    f.write(f"\nTotal FRs: {len(frs)}\n\n")
    
    f.write("### Non-Functional Requirements\n\n")
    for nfr in nfrs:
        f.write(f"{nfr}\n")
    f.write(f"\nTotal NFRs: {len(nfrs)}\n\n")
    
    f.write("### Additional Requirements\n\n")
    f.write("- **Git-Friendliness**: The canonical on-disk BADL format is JSON (YAML as import/export only).\n")
    f.write("- **Architecture**: Six layers (Business Outcomes, Capabilities, Business Rules, Interaction Contracts, Experience Adapters, Renderers).\n")
    f.write("- **Constraints**: Origo is a developer-first platform. Self-service no-code authoring is explicitly deferred to Phase 4.\n\n")
    
    f.write("### PRD Completeness Assessment\n\n")
    f.write("The PRD is highly detailed, well-structured, and explicitly resolves all open questions (10/10). ")
    f.write("Requirements use clear MUST/MUST NOT language and cover all necessary layers of the metadata platform, rendering ecosystem, and DX tooling. ")
    f.write("Overall Completeness Assessment: EXCELLENT.\n")
