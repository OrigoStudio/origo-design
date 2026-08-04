I went through the document and the overall direction is strong: you've correctly elevated \*\*Business Outcomes, Capabilities, Business Rules, and Interaction Contracts\*\* above UI. Most of the remaining open questions are really about \*\*where extensibility boundaries should exist\*\*. My recommendations below aim to maximize long-term platform adoption while keeping Phase 1 achievable. The document is a draft functional requirements specification for Origo Design with nine indexed open questions.

\---

\# OQ-01 — Self-service no-code persona

\*\*Section:\*\* 1.3 Target Consumers

\### Recommendation

\*\*Developer-first exclusively for v1–v3.\*\*

The visual/no-code experience should be treated as an authoring layer built on BADL, not as the foundation.

Reasoning:

\* BADL must mature before abstracting it.

\* Every successful no-code platform (PowerApps, Mendix, Outsystems) first stabilizes its underlying model.

\* Supporting non-developers too early forces compromises in the grammar.

Recommended answer:

> Phase 1–3 targets developers, architects, and AI agents. Self-service no-code authoring is explicitly deferred to Phase 4 after BADL grammar stability.

\---

\# OQ-02 — Explicit CQRS support?

\*\*Section:\*\* Capability Contracts

\### Recommendation

\*\*Yes.\*\*

This is probably the most important missing capability.

Capabilities naturally split into:

```

Command

&#x20;   changes business state



Query

&#x20;   retrieves business state

```

Instead of

```

Capability

```

use

```

Capability

&#x20;   type:

&#x20;       Command

&#x20;       Query

```

Why?

Because Commands have

\* permissions

\* business rules

\* workflows

\* governance

\* completion signals

Queries typically have

\* filters

\* projections

\* caching

\* pagination

without

\* approvals

\* workflows

\* confirmations

Trying to merge them later becomes painful.

Recommendation:

```

CapabilityType

&#x20;   Command

&#x20;   Query

```

\---

\# OQ-03 — Inline rules vs external rule engines

\*\*Section:\*\* Business Rules

\### Recommendation

Support \*\*both\*\*.

Inline should be mandatory.

External should be optional.

BADL should own the business intent.

External engines execute specialized logic.

Example

```

Rule



type:

&#x20;   Inline



expression:

&#x20;   Invoice.Total > 0

```

or

```

type:

&#x20;   External



provider:

&#x20;   Drools



rule:

&#x20;   InvoiceApproval

```

This avoids vendor lock-in while allowing enterprise integrations.

\---

\# OQ-04 — Governance chain

\*\*Section:\*\* Governance \& Audit

\### Recommendation

Exactly the same philosophy.

Support both.

Default should be inline.

Allow external references.

```

governance



mode:

&#x20;   inline



or



mode:

&#x20;   external

```

Why?

SMEs will use inline.

Banks may already have enterprise governance engines.

Don't force either.

\---

\# OQ-05 — YAML support?

\*\*Section:\*\* Metadata Management

\### Recommendation

No.

JSON should be canonical.

Support YAML only as an import/export format.

Reasons

JSON gives

\* deterministic parsing

\* fewer parser inconsistencies

\* JSON Schema

\* IDE support

\* AI generation

\* easier diff tooling

YAML causes

\* indentation issues

\* anchors

\* parser incompatibilities

\* merge conflicts

Recommendation

```

Canonical:

&#x20;   JSON



Optional:

&#x20;   YAML

&#x20;       converted into JSON

```

Never store YAML internally.

\---

\# OQ-06 — Import OpenAPI / Prisma / ERD?

\*\*Section:\*\* Domain Model

\### Recommendation

Absolutely yes.

This is one of the biggest adoption accelerators.

Support imports from

\* OpenAPI

\* JSON Schema

\* Prisma

\* Entity Framework

\* SQL Server

\* PostgreSQL

\* MySQL

\* ER diagrams

Generated output should always be BADL.

Importers become CLI plugins.

```

origo import openapi



origo import prisma



origo import sqlserver



origo import efcore

```

Huge productivity gain.

\---

\# OQ-07 — Long-running workflows?

\*\*Section:\*\* Workflows

\### Recommendation

Do \*\*not\*\* fully implement in Phase 1–3.

Design for them.

Support them in Phase 4.

Reason

Long-running workflows require

\* persistence

\* resumability

\* timers

\* distributed execution

\* compensations

\* saga patterns

These are effectively workflow engines.

Trying to build them too early will delay everything.

Recommendation

Phase 2

```

Workflow schema supports persistence

```

Phase 4

```

Workflow runtime executes persisted workflows

```

\---

\# OQ-08 — Code-to-BADL migration

\*\*Section:\*\* Adoption \& Migration

\### Recommendation

Yes.

Very high value.

But clearly mark it as

```

Approximate

```

not

```

Lossless

```

The tool should generate

\* entities

\* forms

\* grids

\* permissions

\* validations

Developers refine afterward.

Brownfield adoption becomes dramatically easier.

\---

\# OQ-09 — Visual builder vs metadata-first

\*\*Section:\*\* AI Integration

\### Recommendation

Metadata-first.

Always.

Visual builder should simply be another BADL editor.

The architecture should look like this:

```

&#x20;           CLI



&#x20;            │



&#x20;     VS Code Extension



&#x20;            │



&#x20;     AI Page Generator



&#x20;            │



&#x20;     Visual Builder



&#x20;            │



&#x20;     Import Wizards



&#x20;            │



&#x20;       BADL Files

&#x20;            │

&#x20;            ▼

&#x20;     @origo/core

&#x20;            │

&#x20;     Experience Adapter

&#x20;            │

&#x20;        Renderer

```

Everything writes BADL.

Nothing bypasses BADL.

This keeps every authoring experience consistent.

\---

\# Overall Assessment

There is one additional architectural gap that is not currently listed as an open question but will likely become important:

\*\*Versioned Extension Points\*\*

You've already defined extension points for components, validators, adapters, and data providers.

I would add a future OQ:

> \*\*OQ-10:\*\* Should BADL define a formal plugin/extension contract (with semantic versioning and capability negotiation) so third-party providers can safely extend the language without modifying `@origo/core`?

A stable extension model would strengthen Origo's ecosystem as renderers, adapters, and tooling expand.

\### Summary of recommendations

| Open Question | Recommendation |

| ------------- | -------------------------------------------------------------------------------------------------- |

| OQ-01 | Developer-first only for Phase 1–3; no-code deferred to Phase 4 |

| OQ-02 | Add explicit `CapabilityType` (`Command` / `Query`) |

| OQ-03 | Support inline rules and optional external rule engines |

| OQ-04 | Support inline governance and optional external governance providers |

| OQ-05 | JSON as canonical format; YAML only for import/export |

| OQ-06 | Support importing from OpenAPI, JSON Schema, Prisma, EF Core, and database schemas |

| OQ-07 | Design for long-running workflows early, implement runtime support in Phase 4 |

| OQ-08 | Ship a code-to-BADL migration tool, explicitly documented as approximate |

| OQ-09 | Keep BADL metadata as the single source of truth; visual builder is another BADL authoring surface |
