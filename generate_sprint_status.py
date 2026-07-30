import re
import os
from datetime import datetime

epics_path = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\planning-artifacts\epics.md"
status_path = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\implementation-artifacts\sprint-status.yaml"
stories_dir = r"g:\OrigoStudio\Repositories\Origo-Design\origo-design\_bmad-output\implementation-artifacts\stories"

# Ensure directories exist
os.makedirs(os.path.dirname(status_path), exist_ok=True)
os.makedirs(stories_dir, exist_ok=True)

with open(epics_path, 'r', encoding='utf-8') as f:
    content = f.read()

epics_blocks = re.findall(r"### Epic (\d+): (.*?)(?=### Epic \d+|\Z)", content, re.DOTALL)

yaml_entries = []
epic_count = 0
story_count = 0
in_progress_count = 0
done_count = 0

for epic_num, epic_content in epics_blocks:
    epic_count += 1
    yaml_entries.append(f"  epic-{epic_num}: backlog")
    
    stories = re.findall(r"#### Story (\d+\.\d+): (.*?)\n", epic_content)
    for story_id, story_title in stories:
        story_count += 1
        # Convert story ID from 1.1 to 1-1
        kebab_id = story_id.replace('.', '-')
        
        # Convert title to kebab case
        kebab_title = story_title.strip().lower()
        kebab_title = re.sub(r'[^a-z0-9\s-]', '', kebab_title)
        kebab_title = re.sub(r'[\s-]+', '-', kebab_title).strip('-')
        
        story_key = f"{kebab_id}-{kebab_title}"
        
        # Check if story file exists
        story_file = os.path.join(stories_dir, f"{story_key}.md")
        status = "backlog"
        if os.path.exists(story_file):
            status = "ready-for-dev"
            
        yaml_entries.append(f"  {story_key}: {status}")
        
    yaml_entries.append(f"  epic-{epic_num}-retrospective: optional")

# Check existing sprint-status.yaml to preserve states if needed
existing_action_items = []
if os.path.exists(status_path):
    with open(status_path, 'r', encoding='utf-8') as f:
        existing_lines = f.readlines()
        in_action_items = False
        for line in existing_lines:
            if line.strip() == "action_items:":
                in_action_items = True
            if in_action_items:
                existing_action_items.append(line)
        # Note: We aren't doing complex state preservation here since this is likely the first run

date_str = datetime.now().isoformat()

status_content = f"""# generated: {date_str}
# last_updated: {date_str}
# project: origo-design
# project_key: NOKEY
# tracking_system: file-system
# story_location: {{project-root}}/_bmad-output/implementation-artifacts/stories

# STATUS DEFINITIONS:
# ==================
# Epic Status:
#   - backlog: Epic not yet started
#   - in-progress: Epic actively being worked on
#   - done: All stories in epic completed
#
# Epic Status Transitions:
#   - backlog → in-progress: Automatically when first story is created (via create-story)
#   - in-progress → done: Manually when all stories reach 'done' status
#
# Story Status:
#   - backlog: Story only exists in epic file
#   - ready-for-dev: Story file created in stories folder
#   - in-progress: Developer actively working on implementation
#   - review: Ready for code review (via Dev's code-review workflow)
#   - done: Story completed
#
# Retrospective Status:
#   - optional: Can be completed but not required
#   - done: Retrospective has been completed
#
# Action Item Status:
#   - open: Committed during a retrospective, not yet addressed
#   - in-progress: Actively being worked on
#   - done: Completed
#
# WORKFLOW NOTES:
# ===============
# - Epic transitions to 'in-progress' automatically when first story is created
# - Stories can be worked in parallel if team capacity allows
# - Developer typically creates next story after previous one is 'done' to incorporate learnings
# - Dev moves story to 'review', then runs code-review (fresh context, different LLM recommended)
# - Retrospective appends its action items to action_items; sprint-status surfaces open ones

generated: {date_str}
last_updated: {date_str}
project: origo-design
project_key: NOKEY
tracking_system: file-system
story_location: {{project-root}}/_bmad-output/implementation-artifacts/stories

development_status:
"""
status_content += "\n".join(yaml_entries) + "\n"

if existing_action_items:
    status_content += "\n" + "".join(existing_action_items)

with open(status_path, 'w', encoding='utf-8') as f:
    f.write(status_content)

print(f"Total Epics: {epic_count}")
print(f"Total Stories: {story_count}")
print(f"Epics In Progress: {in_progress_count}")
print(f"Stories Completed: {done_count}")
