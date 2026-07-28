import re

prd_path = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\design-artifacts\B-Functional-Requirements\functional-requirements.md"
epics_path = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\planning-artifacts\epics.md"
report_path = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\planning-artifacts\implementation-readiness-report-2026-07-28.md"

prd_reqs = {}
with open(prd_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        # Handle formats like:
        # **FR-EXT-008 — Extension Manifest:** Every extension MUST...
        # **FR-C-001:** Each Capability MUST...
        if line.startswith("**FR-") or line.startswith("**NFR-"):
            match = re.match(r"\*\*(N?FR-[A-Z0-9\-]+)(?:\s*—[^:]*)?\*\*:\s*(.*)", line)
            if match:
                req_id = match.group(1).strip()
                req_text = match.group(2).strip()
                prd_reqs[req_id] = req_text
            else:
                # Try without colon if it's strangely formatted
                match = re.match(r"\*\*(N?FR-[A-Z0-9\-]+)\*\*(.*)", line)
                if match:
                    req_id = match.group(1).strip()
                    req_text = match.group(2).strip()
                    prd_reqs[req_id] = req_text

epic_coverage = {}
with open(epics_path, 'r', encoding='utf-8') as f:
    in_coverage_map = False
    for line in f:
        line = line.strip()
        if "FR Coverage Map" in line:
            in_coverage_map = True
        elif line.startswith("## Epic List"):
            in_coverage_map = False
        
        if in_coverage_map:
            match = re.match(r"^(N?FR-[A-Z0-9\-]+):\s*(.*)", line)
            if match:
                req_id = match.group(1).strip()
                coverage = match.group(2).strip()
                epic_coverage[req_id] = coverage

missing_reqs = []
for req_id, text in prd_reqs.items():
    if req_id not in epic_coverage:
        missing_reqs.append((req_id, text))

with open(report_path, 'a', encoding='utf-8') as f:
    f.write("\n## Epic Coverage Validation\n\n")
    
    f.write("### Coverage Matrix\n\n")
    f.write("| FR Number | PRD Requirement | Epic Coverage | Status |\n")
    f.write("| --------- | --------------- | ------------- | ------ |\n")
    for req_id, text in prd_reqs.items():
        short_text = text[:50] + ("..." if len(text) > 50 else "")
        if req_id in epic_coverage:
            f.write(f"| {req_id} | {short_text} | {epic_coverage[req_id]} | ✓ Covered |\n")
        else:
            f.write(f"| {req_id} | {short_text} | **NOT FOUND** | ❌ MISSING |\n")
    
    f.write("\n### Missing Requirements\n\n")
    if missing_reqs:
        f.write("#### Critical Missing FRs\n\n")
        for req_id, text in missing_reqs:
            f.write(f"{req_id}: {text}\n")
            f.write(f"- Impact: Missing implementation for {req_id}\n")
            f.write(f"- Recommendation: Needs to be added to an epic.\n\n")
    else:
        f.write("No missing requirements found.\n\n")
        
    f.write("### Coverage Statistics\n\n")
    f.write(f"- Total PRD FRs/NFRs: {len(prd_reqs)}\n")
    f.write(f"- FRs/NFRs covered in epics: {len(prd_reqs) - len(missing_reqs)}\n")
    if len(prd_reqs) > 0:
        f.write(f"- Coverage percentage: {round((len(prd_reqs) - len(missing_reqs)) / len(prd_reqs) * 100, 1)}%\n")
