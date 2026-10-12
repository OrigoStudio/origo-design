# Modular SCSS & Design Token Guide

**Owner:** Charlie (Senior Developer)  
**Status:** Active Canonical Guide  
**Applies To:** `@origo/angular-renderer`, `@origo/design-tokens`, all UI primitive components  
**Related Architecture Decisions:** `AD-6` (Design Tokens Single Source of Truth), `NFR-I18N-001` (RTL via CSS Logical Properties), `P1-AD-6` (Accessibility & Quality Enforcement)

---

## 1. Executive Overview & Purpose

During Epic 1 development and code reviews, numerous pull requests encountered avoidable feedback loops due to styling non-compliances:

- Hardcoded hex color codes (`#0066FF`, `#1A1A1A`) and pixel literals (`4px`, `8px`, `16px`).
- Inconsistent usage of design token names and missing CSS custom property fallbacks.
- Physical CSS layout properties (`padding-left`, `margin-right`, `left`, `right`) that break Right-to-Left (RTL) internationalization.
- Leaky styling and missing Shadow DOM encapsulation boundaries.

This guide serves as the binding developer reference for authoring SCSS and consuming design tokens in Origo Design. All component stylesheets must strictly adhere to the patterns outlined below. Non-compliant stylesheets will be rejected during CI and code review.

---

## 2. Architectural Bindings

### AD-6 — Design Tokens Are the Only Source of Visual Primitives

- **Binding Rule:** `@origo/design-tokens` is the single source of truth for every color, spacing, radius, typography, and elevation value.
- **Build-Time Resolution:** Tokens are compiled at build time into CSS custom properties (`--origo-*`).
- **Zero Literal Rule:** No renderer stylesheet (`.scss`) or template (`.html`) may contain a hardcoded hex color, absolute pixel spacing, or border-radius literal.
- **Theme Overrides:** White-labeling and theme switching are performed exclusively via token overrides at the root or container level. Component stylesheets must never be forked or duplicate color/spacing logic.

### NFR-I18N-001 — RTL Layout via CSS Logical Properties

- **Binding Rule:** Layout direction is derived from the locale definition (`FR-L-003`). When an ancestor element sets `dir="rtl"`, the layout must mirror automatically without JavaScript intervention or custom conditional classes.
- **Zero Physical Property Rule:** Physical directional properties (`left`, `right`, `margin-left`, `margin-right`, `padding-left`, `padding-right`, `border-left`, `border-right`, `float: left`, `text-align: left`) are strictly prohibited in component styles. CSS Logical Properties must always be used instead.

---

## 3. Modular SCSS & Shadow DOM Principles

All UI primitives in `@origo/angular-renderer` use `ViewEncapsulation.ShadowDom`. This architecture imposes specific styling rules:

### 3.1 `:host` Encapsulation

Every component stylesheet must define the `:host` rule to establish its display type, box-sizing, and layout boundaries:

```scss
:host {
  display: inline-block; // or block, flex, grid depending on component semantics
  box-sizing: border-box;

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
}

// Hidden state handling
:host([hidden]) {
  display: none !important;
}

// Disabled state reflection
:host([disabled]) {
  cursor: not-allowed;
  pointer-events: none;
}
```

### 3.2 BEM-Like Class Naming

Within the component Shadow DOM, organize styles using BEM notation prefixed with `origo-`:

- **Block:** `.origo-button`, `.origo-card`, `.origo-text-input`
- **Element:** `.origo-button__icon`, `.origo-card__header`, `.origo-text-input__affix`
- **Modifier:** `.origo-button--primary`, `.origo-button--disabled`, `.origo-card--elevated`

### 3.3 CSS Custom Property Consumption Syntax

Always read design tokens via `var()` with an optional documented semantic fallback:

```scss
// Standard consumption
background-color: var(--origo-color-surface-primary);
color: var(--origo-color-text-inverse);

// With safe fallback
border-radius: var(--origo-radius-sm, 4px);
box-shadow: var(--origo-shadow-sm, none);
```

---

## 4. Design Token Taxonomy & Catalog

Tokens are organized into three tiers:

1. **Base Tokens:** Foundational raw design values (raw color scales, base spacing units). Statically compiled.
2. **Semantic Tokens:** Purpose-driven aliases referencing base tokens (surfaces, text, states). These are white-labelable and runtime-overridable.
3. **Component Tokens:** Scoped to specific UI components (buttons, inputs, cards).

All CSS custom properties are prefixed with `--origo-`.

### 4.1 Color Tokens

#### Surface Colors

| CSS Custom Property                    | Default Reference                | Semantic Purpose                              |
| -------------------------------------- | -------------------------------- | --------------------------------------------- |
| `--origo-color-surface-primary`        | `--origo-color-base-blue-500`    | Primary brand surface, default action buttons |
| `--origo-color-surface-primary-hover`  | Blue 600 / darker                | Hover state for primary interactive elements  |
| `--origo-color-surface-primary-active` | Blue 700                         | Active/pressed state for primary elements     |
| `--origo-color-surface-background`     | `--origo-color-base-neutral-100` | Standard page/container background            |
| `--origo-color-surface-subtle`         | Neutral 100/200                  | Muted containers, secondary backgrounds       |
| `--origo-color-surface-disabled`       | Neutral 200                      | Background for disabled controls              |
| `--origo-color-surface-readonly`       | Neutral 100                      | Background for read-only form controls        |
| `--origo-color-surface-default`        | White (`#FFFFFF`)                | Cards, panels, popover surfaces               |

#### Text & Content Colors

| CSS Custom Property           | Default Reference                | Semantic Purpose                          |
| ----------------------------- | -------------------------------- | ----------------------------------------- |
| `--origo-color-text-primary`  | `--origo-color-base-neutral-900` | Default high-contrast body & header text  |
| `--origo-color-text-inverse`  | `--origo-color-base-neutral-100` | Text rendered on dark/primary surfaces    |
| `--origo-color-text-muted`    | Neutral 500/600                  | Secondary labels, captions, helper text   |
| `--origo-color-text-disabled` | Neutral 400                      | Text in disabled inputs and buttons       |
| `--origo-color-text-danger`   | Red 600                          | Error messages, destructive action labels |

#### Borders & Focus Rings

| CSS Custom Property            | Default Reference    | Semantic Purpose                      |
| ------------------------------ | -------------------- | ------------------------------------- |
| `--origo-color-border-default` | Neutral 300          | Standard resting borders              |
| `--origo-color-border-hover`   | Neutral 400          | Border color when hovered             |
| `--origo-color-border-active`  | Blue 500             | Border color when focused or active   |
| `--origo-color-focus`          | `#005FCC` / Blue 500 | High-visibility accessible focus ring |

### 4.2 Spacing Tokens

Use spacing tokens for padding, margins, flex/grid gaps, and positioning offsets.

| CSS Custom Property                 | Base Value | Typical Application                        |
| ----------------------------------- | ---------- | ------------------------------------------ |
| `--origo-spacing-base-1`            | `4px`      | Fine adjustments, borders, micro-offsets   |
| `--origo-spacing-base-2`            | `8px`      | Compact gaps, icon-to-text spacing         |
| `--origo-spacing-base-4`            | `16px`     | Standard component padding, grid gutters   |
| `--origo-spacing-xs`                | `4px`      | Micro-spacing, inline badges               |
| `--origo-spacing-sm`                | `8px`      | Inner button padding, list item gap        |
| `--origo-spacing-md`                | `16px`     | Container padding, standard form gap       |
| `--origo-spacing-lg`                | `24px`     | Section padding, modal dialog inset        |
| `--origo-spacing-xl`                | `32px`     | Page gutters, hero component padding       |
| `--origo-spacing-container-padding` | `16px`     | Standard wrapper padding across primitives |

### 4.3 Border Radius Tokens

| CSS Custom Property   | Default Value | Typical Application                       |
| --------------------- | ------------- | ----------------------------------------- |
| `--origo-radius-sm`   | `4px`         | Buttons, text inputs, badges, checkboxes  |
| `--origo-radius-md`   | `8px`         | Cards, popovers, dropdown menus, modals   |
| `--origo-radius-lg`   | `12px`        | Large feature panels, dialog containers   |
| `--origo-radius-full` | `9999px`      | Circular badges, pills, avatar containers |

### 4.4 Typography Tokens

| CSS Custom Property                     | Property Type | Typical Application                              |
| --------------------------------------- | ------------- | ------------------------------------------------ |
| `--origo-typography-button-font-family` | Font Family   | Action buttons, button groups                    |
| `--origo-typography-button-font-size`   | Font Size     | Action buttons (typically `0.875rem` / `14px`)   |
| `--origo-typography-button-font-weight` | Font Weight   | Action buttons (`500` or `600`)                  |
| `--origo-typography-button-line-height` | Line Height   | Action buttons (`1.25` / `20px`)                 |
| `--origo-typography-input-font-family`  | Font Family   | Text inputs, textareas, selects                  |
| `--origo-typography-input-font-size`    | Font Size     | Input text (`1rem` / `16px` or `0.875rem`)       |
| `--origo-typography-input-font-weight`  | Font Weight   | Standard regular weight (`400`)                  |
| `--origo-typography-input-line-height`  | Line Height   | Standard input line height (`1.5`)               |
| `--origo-typography-caption-font-size`  | Font Size     | Helper text, error messages (`0.75rem` / `12px`) |
| `--origo-typography-body-font-family`   | Font Family   | General component labels and text                |

### 4.5 Elevation, Motion & Opacity Tokens

| CSS Custom Property        | Default Value                      | Typical Application                |
| -------------------------- | ---------------------------------- | ---------------------------------- |
| `--origo-shadow-sm`        | `0 1px 2px rgba(0,0,0,0.05)`       | Buttons, inputs, subtle elevation  |
| `--origo-shadow-md`        | `0 4px 6px -1px rgba(0,0,0,0.1)`   | Dropdown menus, cards, popovers    |
| `--origo-shadow-lg`        | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modal dialogs, floating overlays   |
| `--origo-duration-fast`    | `150ms`                            | Hover states, color shifts         |
| `--origo-duration-normal`  | `200ms`                            | Expansion panels, dropdown toggles |
| `--origo-opacity-disabled` | `0.5`                              | Disabled buttons, inputs, labels   |

---

## 5. CSS Logical Properties Complete Mapping Table

Under `NFR-I18N-001`, all layout styling must be bidirectional. Developers must replace physical coordinates with logical equivalents:

### 5.1 Margins & Padding

| Physical Property (❌ Forbidden) | Logical Property (✅ Required)                                                     | Meaning                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `margin-left`                    | `margin-inline-start`                                                              | Margin before inline content starts (Left in LTR, Right in RTL) |
| `margin-right`                   | `margin-inline-end`                                                                | Margin after inline content ends (Right in LTR, Left in RTL)    |
| `margin-top`                     | `margin-block-start`                                                               | Top margin in horizontal writing mode                           |
| `margin-bottom`                  | `margin-block-end`                                                                 | Bottom margin in horizontal writing mode                        |
| `margin: 0 auto;`                | `margin-inline: auto;`                                                             | Center horizontally in block context                            |
| `padding-left`                   | `padding-inline-start`                                                             | Padding before inline content starts                            |
| `padding-right`                  | `padding-inline-end`                                                               | Padding after inline content ends                               |
| `padding-top`                    | `padding-block-start`                                                              | Top padding in horizontal writing mode                          |
| `padding-bottom`                 | `padding-block-end`                                                                | Bottom padding in horizontal writing mode                       |
| `padding: 8px 16px;`             | `padding-block: var(--origo-spacing-sm); padding-inline: var(--origo-spacing-md);` | Symmetrical padding block and inline                            |

### 5.2 Borders & Dividers

| Physical Property (❌ Forbidden) | Logical Property (✅ Required) | Meaning                        |
| -------------------------------- | ------------------------------ | ------------------------------ |
| `border-left`                    | `border-inline-start`          | Border at leading inline edge  |
| `border-right`                   | `border-inline-end`            | Border at trailing inline edge |
| `border-top`                     | `border-block-start`           | Top border                     |
| `border-bottom`                  | `border-block-end`             | Bottom border                  |
| `border-left-width`              | `border-inline-start-width`    | Leading border width           |
| `border-right-color`             | `border-inline-end-color`      | Trailing border color          |

### 5.3 Corner Radius

| Physical Property (❌ Forbidden) | Logical Property (✅ Required) | Meaning                          |
| -------------------------------- | ------------------------------ | -------------------------------- |
| `border-top-left-radius`         | `border-start-start-radius`    | Block-start, inline-start corner |
| `border-top-right-radius`        | `border-start-end-radius`      | Block-start, inline-end corner   |
| `border-bottom-left-radius`      | `border-end-start-radius`      | Block-end, inline-start corner   |
| `border-bottom-right-radius`     | `border-end-end-radius`        | Block-end, inline-end corner     |

### 5.4 Positioning & Insets

| Physical Property (❌ Forbidden)        | Logical Property (✅ Required) | Meaning                            |
| --------------------------------------- | ------------------------------ | ---------------------------------- |
| `left`                                  | `inset-inline-start`           | Position offset from leading edge  |
| `right`                                 | `inset-inline-end`             | Position offset from trailing edge |
| `top`                                   | `inset-block-start`            | Position offset from top edge      |
| `bottom`                                | `inset-block-end`              | Position offset from bottom edge   |
| `top: 0; left: 0; right: 0; bottom: 0;` | `inset: 0;`                    | Full coverage shorthand            |

### 5.5 Sizing & Alignment

| Physical Property (❌ Forbidden)        | Logical Property (✅ Required)        | Meaning                                     |
| --------------------------------------- | ------------------------------------- | ------------------------------------------- |
| `width` (when referring to inline flow) | `inline-size`                         | Component width in horizontal writing mode  |
| `height` (when referring to block flow) | `block-size`                          | Component height in horizontal writing mode |
| `min-width` / `max-width`               | `min-inline-size` / `max-inline-size` | Inline boundary constraints                 |
| `min-height` / `max-height`             | `min-block-size` / `max-block-size`   | Block boundary constraints                  |
| `text-align: left`                      | `text-align: start`                   | Align with reading start direction          |
| `text-align: right`                     | `text-align: end`                     | Align with reading end direction            |
| `float: left`                           | `float: inline-start`                 | Float toward reading start                  |
| `float: right`                          | `float: inline-end`                   | Float toward reading end                    |

---

## 6. Anti-Patterns vs. Compliant Standards

### 6.1 Interactive Button with Icon

❌ **Anti-Pattern (Hardcoded values, physical coordinates):**

```scss
// BAD: Fails AD-6 (hardcoded colors, px) and NFR-I18N-001 (physical margin-right)
.origo-button {
  background-color: #0066ff;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;

  .origo-button__icon {
    margin-right: 8px; // ❌ Breaks in RTL (icon touches text, gap appears on wrong side)
  }

  &:hover {
    background-color: #0052cc;
  }
}
```

✅ **Compliant Standard (Tokens + Logical Properties):**

```scss
// GOOD: Fully compliant with AD-6 and NFR-I18N-001
:host {
  display: inline-block;
}

.origo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-block: var(--origo-spacing-sm, 8px);
  padding-inline: var(--origo-spacing-md, 16px);
  background-color: var(--origo-color-surface-primary);
  color: var(--origo-color-text-inverse);
  border: none;
  border-radius: var(--origo-radius-sm, 4px);
  box-shadow: var(--origo-shadow-sm, none);
  font-family: var(--origo-typography-button-font-family, inherit);
  font-size: var(--origo-typography-button-font-size, inherit);
  font-weight: var(--origo-typography-button-font-weight, inherit);
  line-height: var(--origo-typography-button-line-height, inherit);
  transition: background-color var(--origo-duration-fast, 150ms) ease-in-out;
  cursor: pointer;

  .origo-button__icon {
    margin-inline-end: var(--origo-spacing-sm, 8px); // ✅ Automatically mirrors in RTL
  }

  &:hover:not(:disabled) {
    background-color: var(--origo-color-surface-primary-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--origo-color-focus, #005fcc);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: var(--origo-opacity-disabled, 0.5);
    cursor: not-allowed;
  }
}
```

---

### 6.2 Layout Container / Card Primitive

❌ **Anti-Pattern (Physical margins, borders, and colors):**

```scss
// BAD: Physical borders and hardcoded shadow/padding
.origo-card {
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  border-left: 4px solid #0066ff; // ❌ Physical border indicator
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

✅ **Compliant Standard (Logical layout & tokens):**

```scss
:host {
  display: block;
}

.origo-card {
  inline-size: 100%;
  margin-inline: auto; // ✅ Centers horizontally in any direction
  padding-block: var(--origo-spacing-md, 16px);
  padding-inline: var(--origo-spacing-md, 16px);
  border-inline-start: var(--origo-spacing-base-1, 4px) solid var(--origo-color-surface-primary); // ✅ Mirrors to right side in RTL
  border-radius: var(--origo-radius-md, 8px);
  background-color: var(--origo-color-surface-default, #ffffff);
  box-shadow: var(--origo-shadow-md, none);
  color: var(--origo-color-text-primary);
}
```

---

### 6.3 Form Field with Helper Text & Floating Overlay

❌ **Anti-Pattern (Physical positioning, top/left, margin-top):**

```scss
// BAD: Physical positioning on dropdown menu and top margin on helper text
.origo-form-field__helper {
  margin-top: 4px; // ❌ Physical margin
  color: #666666; // ❌ Hardcoded color
  font-size: 12px; // ❌ Hardcoded size
}

.origo-dropdown__menu {
  position: absolute;
  top: 100%; // ❌ Physical coordinate
  left: 0; // ❌ Physical coordinate (misaligned in RTL!)
  border-radius: 0 0 8px 8px; // ❌ Physical corners
}
```

✅ **Compliant Standard (Logical insets, typography tokens):**

```scss
.origo-form-field__helper {
  margin-block-start: var(--origo-spacing-xs, 4px); // ✅ Logical block margin
  color: var(--origo-color-text-muted);
  font-size: var(--origo-typography-caption-font-size, 0.75rem);
}

.origo-dropdown__menu {
  position: absolute;
  inset-block-start: 100%; // ✅ Logical block start
  inset-inline-start: 0; // ✅ Automatically aligns with leading edge in RTL
  border-end-start-radius: var(--origo-radius-md, 8px); // ✅ Logical bottom-leading corner
  border-end-end-radius: var(--origo-radius-md, 8px); // ✅ Logical bottom-trailing corner
  background-color: var(--origo-color-surface-default);
  box-shadow: var(--origo-shadow-md);
}
```

---

## 7. Developer PR Review Checklist

Before opening or approving any pull request containing styles, verify every item on this checklist:

- [ ] **No Hardcoded Colors:** Does the file contain any hex codes (`#...`), `rgb()`, `rgba()`, or named colors? If yes, replace with `--origo-color-*`.
- [ ] **No Hardcoded Dimensions:** Are padding, margins, gaps, or radii defined in raw `px` or `rem`? If yes, replace with `--origo-spacing-*` or `--origo-radius-*`.
- [ ] **Zero Physical Coordinates:** Did you use `left`, `right`, `margin-left/right`, `padding-left/right`, or `border-left/right`? If yes, replace with `inset-inline-*`, `margin-inline-*`, `padding-inline-*`, or `border-inline-*`.
- [ ] **Symmetrical Spacing Properties:** Did you use physical shorthands like `padding: 10px 20px`? Use `padding-block` and `padding-inline` with design tokens.
- [ ] **Shadow DOM Boundary:** Is the component configured with `ViewEncapsulation.ShadowDom` and does `:host` define display and box-sizing rules?
- [ ] **Accessible Focus Ring:** Does the interactive element define `:focus-visible` with `var(--origo-color-focus)` and an offset?
- [ ] **RTL Visual Verification:** If testing locally, does toggling `dir="rtl"` mirror the component cleanly without visual clipping or inverted margins?

---

_Authored by Charlie (Senior Dev) as part of Epic 1 Retrospective Action Item 1. Review and amendments must be coordinated with the Origo Design core architecture team._
