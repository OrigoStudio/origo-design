I reviewed the updated **v0.2** document. The architecture is now significantly more consistent than v0.1. The resolved questions reinforce the core philosophy that **BADL is the platform, everything else is an adapter or authoring surface**. The only remaining architectural decision is **OQ-10**, which is referenced in the Extensibility, Phase 3, and Open Questions sections.    

I think OQ-10 is actually more important than it appears. If Origo intends to become a platform rather than just a renderer, then a formal extension model is not optional—it is foundational.

---

# OQ-10 — Plugin & Extension Contract

## Recommendation

**Yes. BADL MUST define a formal extension contract with semantic versioning, capability negotiation, dependency declarations, lifecycle hooks, and sandboxed execution boundaries.**

This should become a core architectural principle.

---

# Why?

Everything else you've designed is already becoming pluggable:

* Renderers
* Experience Adapters
* Validators
* Rule Engines
* Data Providers
* CLI Importers
* AI Adapters
* Future Marketplace

Without a formal extension contract every extension will invent its own API.

That becomes impossible to maintain.

---

# What should the contract define?

Instead of simply saying

> Plugins are supported.

define a real contract.

Example

```text
Extension
    id
    name
    version
    author

    extension_type

    grammar_version

    capabilities

    dependencies

    lifecycle

    permissions
```

---

# Supported Extension Types

BADL should understand the type of extension.

```
Renderer

Experience Adapter

Component Registry

Validator

Rule Engine

Governance Provider

Data Provider

Importer

Exporter

Theme Provider

Telemetry Provider

AI Provider

CLI Command

Studio Extension

DevTools Extension
```

That prevents random plugins pretending to be anything.

---

# Capability Negotiation

This is the piece almost every framework misses.

Instead of

```
Plugin Loaded
```

do

```
Plugin

supports

Renderer API 2.1

Grammar

>=3

<5

Capabilities

Grid

Workflow

Theme

Offline
```

When Origo starts

```
Core

↓

asks plugin

↓

What do you support?

↓

Plugin replies

↓

Core enables features
```

Now plugins survive future versions.

---

# Semantic Versioning

Every extension should declare

```
minimum grammar

maximum grammar

minimum renderer API

maximum renderer API
```

Example

```
supports

Grammar

3.x

Renderer

2.x
```

instead of

```
works with latest
```

---

# Dependency Resolution

Plugins will eventually depend on other plugins.

Example

```
SAP Adapter

↓

depends on

REST Provider

↓

OAuth Provider

↓

Telemetry Provider
```

The loader should resolve dependency graphs automatically.

---

# Lifecycle Hooks

Every extension should expose lifecycle events.

```
Initialize

Configure

Validate

Activate

Deactivate

Dispose
```

No plugin should execute arbitrary startup logic.

---

# Sandboxed Execution

This is important if a marketplace exists.

Extensions should never access core internals directly.

Everything goes through public APIs.

```
Core

↓

Extension API

↓

Plugin
```

never

```
Plugin

↓

Internal Core Objects
```

---

# Feature Flags

Extensions should expose optional capabilities.

Example

```
supports

AI

Offline

Streaming

Virtual Grid

Localization

Accessibility AAA
```

Core can adapt dynamically.

---

# Security

Every plugin should declare permissions.

Example

```
Filesystem

Network

Process

Clipboard

Environment

Telemetry
```

Studio can warn users before installation.

---

# Marketplace Readiness

Your Phase 4 roadmap already mentions a marketplace. 

A marketplace is nearly impossible without:

* version compatibility
* dependency resolution
* capability negotiation
* security boundaries
* lifecycle management

Those are exactly what OQ-10 should establish.

---

# Suggested Resolution

> **[RESOLVED — OQ-10]** **Yes — BADL MUST define a formal plugin and extension contract.** Every extension MUST declare its extension type, semantic version, supported grammar versions, capability set, dependency graph, lifecycle hooks, and required permissions. `@origo/core` MUST negotiate capabilities and validate compatibility before activation. Extensions communicate exclusively through public extension APIs and MUST NOT depend on internal implementation details. This contract enables a stable third-party ecosystem, safe upgrades, and the Phase 4 marketplace.

---

# Suggested Functional Requirements

### FR-EXT-008 — Extension Manifest

Every extension MUST provide a manifest containing:

* `id`
* `name`
* `version`
* `extension_type`
* `author`
* `grammar_version_range`
* `renderer_api_range`
* `capabilities[]`
* `dependencies[]`
* `permissions[]`

---

### FR-EXT-009 — Capability Negotiation

`@origo/core` MUST negotiate supported capabilities with every extension before activation. Extensions MUST gracefully degrade when optional capabilities are unavailable.

---

### FR-EXT-010 — Lifecycle

Every extension MUST support the lifecycle:

* Initialize
* Configure
* Validate
* Activate
* Deactivate
* Dispose

---

### FR-EXT-011 — Compatibility Validation

An extension MUST fail fast with a human-readable compatibility report when its declared grammar or API version requirements cannot be satisfied.

---

### FR-EXT-012 — Public Extension API

Extensions MUST communicate only through stable, documented extension APIs. Access to internal `@origo/core` implementation details is prohibited.

---

### FR-EXT-013 — Dependency Resolution

The extension loader MUST resolve dependency graphs, detect cyclic dependencies, and report missing or incompatible dependencies before activation.

---

### FR-EXT-014 — Security & Sandboxing

Extensions MUST explicitly declare required permissions (filesystem, network, process execution, telemetry, etc.). Hosts MAY deny permissions or execute extensions within sandboxed environments.

---

I would also make one architectural adjustment: **move the extension contract from "Extensibility" to the core architecture layer**. Today it appears as an implementation detail in §18, but in reality it defines how the entire Origo ecosystem evolves. Treating it as a first-class platform contract rather than an extensibility feature will make future renderers, adapters, AI integrations, and the marketplace much easier to evolve consistently.
