---
title: BADL Schemas Reference
description: Complete reference for BADL schemas including Domain, Entity, Capability, Contract, Extension, and Permission.
---

This guide outlines all BADL primitive schemas, their properties, and effective usage patterns as defined by the Playground Schemas approach.

## Domain

The Domain schema defines the highest level of organization within BADL, grouping entities, capabilities, contracts, and extensions under a unified versioned namespace.

### `id`

Unique identifier for the domain instance.

- **When to use?** Always. It serves as the primary key for the domain registry.
- **How to use?** Use a unique string, often a UUID or a domain-specific slug.

```json
"id": "dom-auth-v1"
```

### `name`

Human-readable name of the domain.

- **When to use?** To provide a descriptive title for the domain in UIs and logs.
- **How to use?** Use clear, concise names without technical jargon.

```json
"name": "Authentication Domain"
```

### `version`

The version of the domain implementation.

- **When to use?** To track API or schema evolution.
- **How to use?** Follow semantic versioning (`MAJOR.MINOR.PATCH`).

```json
"version": "1.0.0"
```

### `domain`

The logical domain boundary or namespace identifier.

- **When to use?** To associate this domain with a broader bounded context.
- **How to use?** Use a reverse-DNS style or hierarchical namespace (e.g., `com.origo.auth`).

```json
"domain": "com.origo.auth"
```

### `entities`

Array of Entities associated with this domain.

- **When to use?** To define the core data models and business objects for this domain.
- **How to use?** Pass an array of valid BADL Entity objects.

```json
"entities": [ { "id": "ent-user", "name": "User", "fields": [] } ]
```

### `capabilities`

Array of Capabilities provided by this domain.

- **When to use?** To expose actions and behaviors that this domain can perform.
- **How to use?** Pass an array of valid BADL Capability objects.

```json
"capabilities": [
  {
    "id": "cap-login",
    "name": "Create",
    "description": "Log a user in",
    "type": "Command",
    "entityId": "ent-user",
    "outcome_ref": [],
    "preconditions": [],
    "postconditions": [],
    "permissions": [],
    "risk_level": "low",
    "async": false
  }
]
```

### `contracts`

Array of Contracts defining required behaviors and data structures.

- **When to use?** To enforce specific integration or interface requirements on implementations.
- **How to use?** Pass an array of valid BADL Contract objects.

```json
"contracts": []
```

### `extensions`

Array of Extensions modifying or augmenting this domain.

- **When to use?** When integrating third-party plugins or extending domain behavior without modifying the core.
- **How to use?** Pass an array of valid BADL Extension objects.

```json
"extensions": []
```

## Entity

The Entity schema represents a data model or business object, its fields, and the contracts it implements.

### `id`

Unique identifier for the entity.

- **When to use?** Always. Used by capabilities and cross-references.
- **How to use?** Use a unique string, often prefixed (e.g., `ent-user`).

```json
"id": "ent-user"
```

### `name`

Human-readable name for the entity.

- **When to use?** For display in generic administrative UIs or generators.
- **How to use?** Use title case (e.g., "User Profile").

```json
"name": "User Profile"
```

### `implements`

Array of contract IDs that this entity fulfills.

- **When to use?** When the entity must guarantee specific fields or capabilities exist as dictated by a Contract.
- **How to use?** List the string IDs of the target Contracts.

```json
"implements": ["contract-auditable"]
```

### `fields`

Array of Field definitions defining the shape of the entity.

- **When to use?** To specify the exact properties, data types, and validation rules of the entity.
- **How to use?** Provide a list of BADL Field objects.

```json
"fields": [
  { "id": "email", "name": "email", "type": "string", "label": "Email", "validation": ["required", "email"], "metadata_path": "user.email" }
]
```

#### Field Properties

- **`id`**:
  - **When to use?** To uniquely identify the field programmatically.
  - **How to use?** Use a strict camelCase string (e.g., `emailAddress`).
- **`name`**:
  - **When to use?** To name the field.
  - **How to use?** Use camelCase or snake_case matching the underlying data store.
- **`type`**:
  - **When to use?** To define the primitive data type (`string`, `boolean`, `date`, `number`, `array`, `object`).
  - **How to use?** Choose exactly one of the allowed enums.
- **`itemType`**:
  - **When to use?** When `type` is `array`.
  - **How to use?** Specify the primitive type of the array items.
- **`label`**:
  - **When to use?** To define how the field is labeled in generated UIs.
  - **How to use?** Use a short, descriptive human-readable label.
- **`references`**:
  - **When to use?** When the field is a foreign key pointing to another Entity.
  - **How to use?** Provide the exact `id` of the referenced Entity.
- **`validation`**:
  - **When to use?** To enforce business rules on the data.
  - **How to use?** Provide an array of validation rule strings (e.g., `["required", "email"]`).
- **`metadata_path`**:
  - **When to use?** When the field maps to a specific JSONPath or graph path in external storage.
  - **How to use?** Provide a valid path string.
- **`fields`**:
  - **When to use?** When the field `type` is `object` and contains nested properties.
  - **How to use?** Provide a nested array of Field objects.

### `capabilities`

Array of Capability definitions associated with this entity.

- **When to use?** To define domain-specific actions that operate on this entity.
- **How to use?** Provide an array of valid BADL Capability objects.

```json
"capabilities": [
  {
    "id": "cap-user-create",
    "name": "Create",
    "description": "Creates a new user",
    "type": "Command",
    "entityId": "ent-user",
    "outcome_ref": [],
    "preconditions": [],
    "postconditions": [],
    "permissions": [],
    "risk_level": "low",
    "async": false
  }
]
```

## Capability

The Capability schema defines a discrete action, operation, or behavior associated with an entity.

### `id`

Unique identifier for the capability.

- **When to use?** Always. Used for logging, auditing, and triggering the capability.
- **How to use?** Use a unique string (e.g., `cap-user-create`).

```json
"id": "cap-user-create"
```

### `name`

The core verb of the capability (`Create`, `Read`, `Update`, `Delete`, `List`).

- **When to use?** To map the capability to standard CRUDL operations.
- **How to use?** Choose exactly one of the strictly enforced verbs.

```json
"name": "Create"
```

### `description`

A summary of what the capability does.

- **When to use?** Always, to document the behavior for other developers.
- **How to use?** Write a clear, concise sentence.

```json
"description": "Creates a new user profile."
```

### `type`

The CQRS operational classification (`Command` or `Query`).

- **When to use?** Always required to enforce read/write segregation.
- **How to use?** Must strictly align with `name`: use `Command` for `Create`/`Update`/`Delete` and `Query` for `Read`/`List`.

```json
"type": "Command"
```

### `entityId`

The target entity this capability operates on.

- **When to use?** To bind the behavior to a specific data model.
- **How to use?** Provide the exact `id` of an existing Entity.

```json
"entityId": "ent-user"
```

### `outcome_ref`

Array of references describing the outputs.

- **When to use?** To document or link to schemas detailing what this capability returns.
- **How to use?** Provide string references to outcome types or event schemas.

```json
"outcome_ref": ["evt-user-created"]
```

### `preconditions`

Rules that must be true before the capability executes.

- **When to use?** To enforce business logic gates.
- **How to use?** Provide an array of rule strings.

```json
"preconditions": ["is-unverified-email"]
```

### `postconditions`

Rules that are guaranteed true after execution.

- **When to use?** To document side-effects or state changes.
- **How to use?** Provide an array of state assertion strings.

```json
"postconditions": ["user-state-active"]
```

### `permissions`

Array of required role-based permissions to execute this capability.

- **When to use?** To enforce authorization on the action.
- **How to use?** Provide an array of BADL Permission objects.

```json
"permissions": [ { "role": "admin", "access": "grant" } ]
```

### `risk_level`

Classification of the capability's operational risk (`low`, `medium`, `high`, `critical`).

- **When to use?** To trigger appropriate approval flows, auditing, or alert thresholds.
- **How to use?** Select the enum that matches the impact of the action.

```json
"risk_level": "medium"
```

### `interaction_contract_ref`

Reference to an Interaction Contract defining detailed UX/UI or API flow.

- **When to use?** When the capability integrates into a complex orchestrator.
- **How to use?** Provide the string ID of the interaction contract.

```json
"interaction_contract_ref": "ic-user-onboarding"
```

### `async`

Whether the capability is processed asynchronously.

- **When to use?** For long-running or background tasks.
- **How to use?** Use a boolean (`true` or `false`).

```json
"async": false
```

## Contract

The Contract schema defines required fields and capabilities that an entity must implement to satisfy a specific interface or behavior standard (like a protocol or interface in OOP).

### `id`

Unique identifier for the contract.

- **When to use?** Always. Used by entities in the `implements` array.
- **How to use?** Use a unique string (e.g., `contract-auditable`).

```json
"id": "contract-auditable"
```

### `name`

Human-readable name of the contract.

- **When to use?** For display in development tooling.
- **How to use?** Use title case.

```json
"name": "Auditable Entity"
```

### `requiredFields`

Array of field definitions that an implementing entity MUST possess.

- **When to use?** To ensure structural compliance across multiple entities.
- **How to use?** Provide an array of objects specifying `name` and `type`.

```json
"requiredFields": [ { "name": "createdAt", "type": "date" } ]
```

### `requiredCapabilities`

Array of capability requirements that an implementing entity MUST possess.

- **When to use?** To ensure behavioral compliance.
- **How to use?** Provide an array of objects specifying `name` (the CRUDL verb) and `type` (Command/Query).

```json
"requiredCapabilities": [ { "name": "Read", "type": "Query" } ]
```

## Extension

The Extension schema represents a third-party or optional module that augments BADL with new features.

### `id`

Unique identifier for the extension.

- **When to use?** Always. Used by the domain to mount the extension.
- **How to use?** Must match the regex `^[a-zA-Z0-9_-]+$`.

```json
"id": "ext-audit-logger"
```

### `name`

Human-readable name of the extension.

- **When to use?** For display in extension marketplaces or admin UIs.
- **How to use?** Use a descriptive title.

```json
"name": "Audit Logger"
```

### `version`

The version of this specific extension configuration.

- **When to use?** To track updates to how the extension is utilized.
- **How to use?** Use semantic versioning.

```json
"version": "1.0.0"
```

### `extension_type`

The category or architectural hook point of the extension.

- **When to use?** To tell the BADL parser how to wire the extension into the runtime.
- **How to use?** Provide a string identifier corresponding to known extension slots (e.g., `middleware`, `ui-plugin`).

```json
"extension_type": "middleware"
```

### `implements`

Array of interfaces or contracts this extension fulfills.

- **When to use?** To guarantee the extension provides required APIs.
- **How to use?** Provide at least one string interface identifier.

```json
"implements": ["IEventLogger"]
```

### `plugin_version_range`

The acceptable semantic version range of the underlying plugin engine.

- **When to use?** To prevent running extensions on incompatible core versions.
- **How to use?** Use npm-style semver ranges (e.g., `^1.2.0`).

```json
"plugin_version_range": "^2.0.0"
```

## Permission

The Permission schema defines a role-based access control rule, usually embedded inside a Capability.

### `role`

The specific user role this rule applies to.

- **When to use?** Always. To bind an action to an actor category.
- **How to use?** Provide a non-empty string representing the role (e.g., `admin`, `user`, `anonymous`).

```json
"role": "admin"
```

### `access`

Whether the specified role is granted or denied execution rights.

- **When to use?** To explicitly allow or explicitly block access.
- **How to use?** Use exactly `grant` or `deny`. Defaults to `grant`.

```json
"access": "grant"
```
