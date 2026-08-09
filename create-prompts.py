import os

diff_content = """diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index 0aadbba..e612af0 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-07-29T21:46:02.464968
-last_updated: 2026-08-09T18:05:00.000000
+last_updated: 2026-08-09T21:03:52+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -65,7 +65,7 @@ development_status:
   2-5-2-design-tokens-use-case-documentation: done
   2-5-3-theme-provider-composite-token-tech-debt: done
   epic-3: in-progress
-  3-1-target-page-json-fixture: ready-for-dev
+  3-1-target-page-json-fixture: review
   3-2-domain-entity-schema-parser: backlog
   3-3-canonical-ast-serialization: backlog
   3-4-ast-validation-engine: backlog
diff --git a/_bmad-output/implementation-artifacts/stories/3-1-target-page-json-fixture.md b/_bmad-output/implementation-artifacts/stories/3-1-target-page-json-fixture.md
index be87807..192008a 100644
--- a/_bmad-output/implementation-artifacts/stories/3-1-target-page-json-fixture.md
+++ b/_bmad-output/implementation-artifacts/stories/3-1-target-page-json-fixture.md
@@ -1,10 +1,11 @@
 ---
-status: ready-for-dev
+baseline_commit: db07bc81f13559140a9b3781dfaa61e6db47599a
+status: review
 ---
 
 # Story 3.1: Target Page JSON Fixture
 
-Status: ready-for-dev
+Status: review
 
 <!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
 
@@ -23,26 +24,29 @@ so that I have a tangible target for the BADL schema to compile against.
 
 ## Tasks / Subtasks
 
-- [ ] Task 1: Create Target Page JSON Fixture (AC: 1)
-  - [ ] Scaffold a JSON file within `@origo/core/src/schemas/__fixtures__` (or equivalent test fixtures folder) that represents a complete JSON AST.
-  - [ ] Ensure the fixture represents a full CRUD screen, including multiple nested entities and relationships.
-  - [ ] Include core capabilities (e.g. CRUD+L) to represent what an actual page would look like.
-  - [ ] Add `metadata_path` values using the dot notation format (`EntityName.FieldName`).
-  - [ ] Ensure the fixture strictly conforms to canonical JSON formatting rules.
+- [x] Task 1: Create Target Page JSON Fixture (AC: 1)
+  - [x] Scaffold the fixture file exactly at `packages/core/src/schemas/__fixtures__/target-page.json`.
+  - [x] Model a concrete **User Management** domain, including `User`, `Role`, and `Department` entities to ensure realistic complexity.
+  - [x] Include core capabilities (CRUD+L: `CreateUser`, `ReadUser`, `UpdateUser`, `DeleteUser`, `ListUsers`).
+  - [x] For every Entity field, include mandatory properties: `type`, `label`, `validation[]`, and `metadata_path` (FR-E-002).
+  - [x] Add `metadata_path` values using the strict dot notation format (`EntityName.FieldName`).
+  - [x] Ensure array ordering is semantically insignificant and IDs are stable across entities (FR-M-006).
+  - [x] Ensure the fixture strictly conforms to canonical JSON formatting rules (FR-M-008) — no trailing commas, no comments.
+- [x] Task 2: Syntactic Validation
+  - [x] Run a JSON parser or quick node script (e.g., `node -e "require('./packages/core/src/schemas/__fixtures__/target-page.json')"`) to guarantee the file is valid JSON before completing the story.
 
 ## Dev Notes
 
 - **Architectural Constraints:**
   - P1-AD-3: The format will eventually be validated against JSON Schema Draft 2020-12 (to be built in 3.2). The fixture needs to be realistic and accurate.
-  - P1-AD-4: `@origo/core` has strict internal module structure. The fixture should be placed appropriately for tests to consume, e.g., `packages/core/src/schemas/__fixtures__/target-page.json` or `packages/core/tests/fixtures/target-page.json`.
-  - AD-7: Must be JSON.
-  - AD-12: Test Selectors Use BADL `metadata_path` Values (`metadata_path: "EntityName.FieldName"`).
+  - P1-AD-4: `@origo/core` has strict internal module structure. The fixture must be placed at `packages/core/src/schemas/__fixtures__/target-page.json` for validation tests to consume.
+  - AD-7 / AD-12: Test Selectors Use BADL `metadata_path` Values (`metadata_path: "EntityName.FieldName"`). Must be strict JSON.
 - **Testing Standards:**
   - This fixture serves as the primary dataset for unit and integration testing of the parser and validation engine in subsequent stories (3.2, 3.3, 3.4).
 
 ### Project Structure Notes
 
-- Alignment with unified project structure: Needs to be within `packages/core`.
+- Alignment with unified project structure: Needs to be within `packages/core/src/schemas/__fixtures__`.
 
 ### References
 
@@ -54,9 +58,14 @@ so that I have a tangible target for the BADL schema to compile against.
 ## Dev Agent Record
 
 ### Agent Model Used
+Gemini 3.1 Pro
 
 ### Debug Log References
+- JSON syntactic validation succeeded via node module loader.
 
 ### Completion Notes List
+- Created valid JSON fixture at `packages/core/src/schemas/__fixtures__/target-page.json` modeling User Management domain.
+- Strictly followed FR-E-002, FR-M-006, and FR-M-008 constraints.
 
 ### File List
+- `packages/core/src/schemas/__fixtures__/target-page.json` (NEW)
diff --git a/packages/core/src/schemas/__fixtures__/target-page.json b/packages/core/src/schemas/__fixtures__/target-page.json
new file mode 100644
index 0000000..70945fb
--- /dev/null
+++ b/packages/core/src/schemas/__fixtures__/target-page.json
@@ -0,0 +1,158 @@
+{
+  "version": "1.0.0",
+  "domain": "User Management",
+  "entities": [
+    {
+      "id": "entity-user",
+      "name": "User",
+      "fields": [
+        {
+          "id": "field-user-id",
+          "name": "id",
+          "type": "string",
+          "label": "User ID",
+          "validation": [
+            "required",
+            "uuid"
+          ],
+          "metadata_path": "User.id"
+        },
+        {
+          "id": "field-user-username",
+          "name": "username",
+          "type": "string",
+          "label": "Username",
+          "validation": [
+            "required",
+            "minLength:3",
+            "maxLength:50"
+          ],
+          "metadata_path": "User.username"
+        },
+        {
+          "id": "field-user-email",
+          "name": "email",
+          "type": "string",
+          "label": "Email Address",
+          "validation": [
+            "required",
+            "email"
+          ],
+          "metadata_path": "User.email"
+        },
+        {
+          "id": "field-user-roleId",
+          "name": "roleId",
+          "type": "string",
+          "label": "Role ID",
+          "validation": [
+            "required"
+          ],
+          "metadata_path": "User.roleId"
+        },
+        {
+          "id": "field-user-departmentId",
+          "name": "departmentId",
+          "type": "string",
+          "label": "Department ID",
+          "validation": [],
+          "metadata_path": "User.departmentId"
+        }
+      ]
+    },
+    {
+      "id": "entity-role",
+      "name": "Role",
+      "fields": [
+        {
+          "id": "field-role-id",
+          "name": "id",
+          "type": "string",
+          "label": "Role ID",
+          "validation": [
+            "required",
+            "uuid"
+          ],
+          "metadata_path": "Role.id"
+        },
+        {
+          "id": "field-role-name",
+          "name": "name",
+          "type": "string",
+          "label": "Role Name",
+          "validation": [
+            "required"
+          ],
+          "metadata_path": "Role.name"
+        },
+        {
+          "id": "field-role-permissions",
+          "name": "permissions",
+          "type": "array",
+          "label": "Permissions",
+          "validation": [],
+          "metadata_path": "Role.permissions"
+        }
+      ]
+    },
+    {
+      "id": "entity-department",
+      "name": "Department",
+      "fields": [
+        {
+          "id": "field-department-id",
+          "name": "id",
+          "type": "string",
+          "label": "Department ID",
+          "validation": [
+            "required",
+            "uuid"
+          ],
+          "metadata_path": "Department.id"
+        },
+        {
+          "id": "field-department-name",
+          "name": "name",
+          "type": "string",
+          "label": "Department Name",
+          "validation": [
+            "required"
+          ],
+          "metadata_path": "Department.name"
+        }
+      ]
+    }
+  ],
+  "capabilities": [
+    {
+      "id": "cap-user-create",
+      "name": "CreateUser",
+      "type": "create",
+      "entityId": "entity-user"
+    },
+    {
+      "id": "cap-user-read",
+      "name": "ReadUser",
+      "type": "read",
+      "entityId": "entity-user"
+    },
+    {
+      "id": "cap-user-update",
+      "name": "UpdateUser",
+      "type": "update",
+      "entityId": "entity-user"
+    },
+    {
+      "id": "cap-user-delete",
+      "name": "DeleteUser",
+      "type": "delete",
+      "entityId": "entity-user"
+    },
+    {
+      "id": "cap-user-list",
+      "name": "ListUsers",
+      "type": "list",
+      "entityId": "entity-user"
+    }
+  ]
+}"""
blind_hunter_prompt = f"Invoke the `bmad-review-adversarial-general` skill on this diff:\n\n```diff\n{diff_content}\n```\n"
edge_case_hunter_prompt = f"Invoke the `bmad-review-edge-case-hunter` skill on this diff:\n\n```diff\n{diff_content}\n```\n"
acceptance_auditor_prompt = f"You are an Acceptance Auditor. Review the provided diff against `_bmad-output/implementation-artifacts/stories/3-1-target-page-json-fixture.md` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.\n\nDiff:\n```diff\n{diff_content}\n```\n"

out_dir = "_bmad-output/implementation-artifacts"
with open(os.path.join(out_dir, "prompt-blind-hunter.md"), "w") as f:
    f.write(blind_hunter_prompt)
with open(os.path.join(out_dir, "prompt-edge-case-hunter.md"), "w") as f:
    f.write(edge_case_hunter_prompt)
with open(os.path.join(out_dir, "prompt-acceptance-auditor.md"), "w") as f:
    f.write(acceptance_auditor_prompt)
