---
title: Accessibility & RTL Authoring Guide
description: Binding ARIA semantics and CSS Logical Properties standards for @origo/angular-renderer components.
---

This guide outlines the mandatory authoring patterns for Accessibility (ARIA) and Right-to-Left (RTL) support within `@origo/angular-renderer`. These rules prevent recurring Pull Request feedback and ensure components meet both `P1-AD-6` (Accessibility Enforcement in CI) and `NFR-I18N-001` requirements. Any violations will fail CI.

## ARIA Binding Patterns

According to `P1-AD-6` (Accessibility Enforcement in CI), every `@origo/angular-renderer` component MUST have a Playwright component test running `axe-core` against its rendered output. An axe-core violation at WCAG 2.1 AA level MUST fail CI. ARIA attributes must be properly bound to enable these tests to pass.

When building Angular components, ARIA attributes should be derived reactively from the component's contract properties. Never assign static ARIA roles or labels that cannot be overridden by the contract, and always use standard Angular bindings.

### Host Component Binding (e.g., DataGrid)

When ARIA attributes apply directly to the custom element's host, use Angular's `host` bindings alongside signals or `computed()` properties.

❌ **Incorrect**

```typescript
@Component({
  selector: 'origo-data-grid',
  host: {
    // Fails to reflect dynamic changes or validate emptiness correctly
    '[attr.aria-label]': 'contract().props["aria-label"]',
  },
})
export class DataGridComponent {}
```

✅ **Correct**

```typescript
// From packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts
@Component({
  selector: 'origo-data-grid',
  host: {
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
  },
})
export class DataGridComponent {
  contract = input.required<InteractionContract<DataGridProps>>();

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });
}
```

### Template Binding (e.g., Button)

When standard HTML elements are the core functional element inside the template, bind ARIA attributes directly in the template.

❌ **Incorrect**

```html
<!-- Fails if the string is empty or undefined, leaving an empty attribute -->
<button aria-label="{{ contract().props['aria-label'] }}">{{ computedLabel() }}</button>
```

✅ **Correct**

```html
<!-- From packages/angular-renderer/src/components/primitives/button/button.component.html -->
<button
  [type]="computedType()"
  [disabled]="computedDisabled()"
  [attr.aria-label]="computedAriaLabel()"
  [attr.aria-describedby]="computedAriaDescribedBy()"
  (click)="onClick()"
>
  {{ computedLabel() }}
</button>
```

### Role Binding (e.g., DataGrid Headers)

❌ **Incorrect**

```html
<th role="button">{{ col.label }}</th>
```

✅ **Correct**

```html
<!-- From packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html -->
<th [attr.role]="col.sortable ? 'button' : null">{{ col.label }}</th>
```

## CSS Logical Properties for RTL Support

According to `NFR-I18N-001`, RTL layout direction is derived from the locale definition (`FR-L-003`). Components MUST use CSS Logical Properties so that `dir="rtl"` on an ancestor element automatically mirrors the layout without any component code change.

### The Mapping Table

Never use physical direction properties. Use their logical equivalents:

| Physical (❌ Forbidden)          | Logical (✅ Required)                         |
| -------------------------------- | --------------------------------------------- |
| `margin-left` / `margin-right`   | `margin-inline-start` / `margin-inline-end`   |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` |
| `padding-top` / `padding-bottom` | `padding-block-start` / `padding-block-end`   |
| `left` / `right` (positioning)   | `inset-inline-start` / `inset-inline-end`     |
| `border-left` / `border-right`   | `border-inline-start` / `border-inline-end`   |
| `text-align: left` / `right`     | `text-align: start` / `end`                   |
| `float: left` / `right`          | `float: inline-start` / `inline-end`          |

### Authoring Examples

❌ **Incorrect**

```scss
.origo-button-icon {
  margin-right: 8px;
  padding-left: 12px;
  left: 0;
  text-align: left;
}
```

✅ **Correct**

```scss
.origo-button-icon {
  margin-inline-end: 8px;
  padding-inline-start: 12px;
  inset-inline-start: 0;
  text-align: start;
}
```
