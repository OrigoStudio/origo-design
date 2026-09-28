---
title: Accessibility & RTL Authoring Standard
description: Architectural Decision Record defining the standard for Accessibility and RTL support in Angular components.
---

# ADR 003: Accessibility & RTL Authoring Standard

- **Date:** 2026-09-27
- **Status:** Accepted
- **Author:** Origo Core Team

## Context

To ensure the `@origo/angular-renderer` components comply with our strict accessibility and internationalization rules, we must codify the patterns used by developers when authoring components. These patterns satisfy the requirements of `P1-AD-6` (Accessibility Enforcement in CI) and `NFR-I18N-001` (RTL Layout via CSS Logical Properties).

## Decision

We have established the following standards for ARIA and RTL support:

### ARIA Binding

**Binding.** Every `@origo/angular-renderer` component MUST have a Playwright component test running `axe-core` against its rendered output. An axe-core violation at WCAG 2.1 AA level MUST fail CI (`P1-AD-6`). ARIA attributes must be derived reactively using standard Angular `host` bindings or template bindings.

**Prevents.** Hardcoded ARIA labels or roles that cannot be dynamically updated via component contracts, resulting in inaccessible components and CI test failures.

**Rule.** Developers MUST bind ARIA attributes reactively (e.g., `[attr.aria-label]="computedAriaLabel()"`) from the component's contract properties. Never assign static values.

### RTL CSS Logical Properties

**Binding.** RTL layout direction is derived from the locale definition (`FR-L-003`). Components MUST use CSS Logical Properties (`NFR-I18N-001`).

**Prevents.** The use of physical CSS properties (e.g., `margin-left`, `right`, `padding-left`) that break the layout when `dir="rtl"` is applied, causing PR feedback cycles and manual mirroring logic.

**Rule.** Never use physical direction properties in CSS/SCSS. Developers MUST map all directional CSS to their logical equivalents (e.g., `margin-inline-start`, `padding-block-end`, `inset-inline-start`).
