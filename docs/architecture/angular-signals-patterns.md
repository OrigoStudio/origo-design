# Angular Signals Patterns for Origo Renderer

This guide outlines the patterns and best practices for bridging the immutable Canonical AST (from Epic 3) into reactive Angular UI components using Angular Signals, preparing the team for Epic 5.

## Core Concepts

In Origo, the Canonical AST is the source of truth for the UI structure. However, the AST itself is immutable and disconnected from the Angular change detection cycle. To create a highly performant and reactive renderer, we map AST properties to Angular Signals.

### 1. The `signal` for Mutable State

While the AST structure is immutable, the _values_ mapped to component inputs or internal interactive state (like hover, focus, open/close) should be stored in `signal`s.

```typescript
import { Component, signal } from '@angular/core';

@Component({ ... })
export class PrimitiveComponent {
  // Reactive state
  isHovered = signal(false);
}
```

### 2. `input.required` vs `input` (Angular 17+)

Starting in Angular 17.1, we use signal-based inputs instead of `@Input()` decorators. This guarantees that any changes from the parent (the renderer orchestrator) instantly propagate as reactive signals.

```typescript
import { Component, input } from '@angular/core';
import { ASTNode } from '@origo/core';

@Component({ ... })
export class BoxPrimitive {
  // Signal input representing the immutable AST node
  node = input.required<ASTNode>();

  // Optional style overrides
  className = input<string>('');
}
```

### 3. The `computed` for Derived State

When we need to transform the AST data (e.g., resolving design tokens from Epic 2, or computing final styles), we must use `computed`. `computed` values are lazily evaluated and memoized, running only when their dependencies change.

```typescript
import { Component, computed, input, inject } from '@angular/core';
import { TokenResolverService } from '../services/token-resolver.service';

@Component({ ... })
export class TextPrimitive {
  node = input.required<ASTNode>();
  private tokenResolver = inject(TokenResolverService);

  // Derived state: re-evaluates ONLY when node() changes or if tokenResolver signals change
  resolvedColor = computed(() => {
    const rawColor = this.node().properties?.color;
    return this.tokenResolver.resolve(rawColor);
  });
}
```

### 4. Binding to the Template

Because everything is a signal, template binding requires calling the signal like a function `()`.

```html
<!-- Box Primitive Template -->
<div
  [class]="className()"
  [style.background-color]="resolvedColor()"
  (mouseenter)="isHovered.set(true)"
  (mouseleave)="isHovered.set(false)"
>
  <ng-content></ng-content>
</div>
```

## Bridging the Gap: Epic 3 AST to Epic 5 Primitives

The core responsibility of the renderer is to traverse the Epic 3 AST and dynamically instantiate the Epic 5 Angular components.

### 1. Dynamic Component Instantiation

Instead of static templates, the renderer uses `ViewContainerRef` and `ComponentRef` to dynamically build the tree.

### 2. Passing AST Data via `setInput`

When dynamically creating components, we use `componentRef.setInput()` to pass data into the Signal inputs.

```typescript
// Inside the Renderer Orchestrator
const componentRef = this.viewContainerRef.createComponent(BoxPrimitive);

// This automatically updates the signal inputs in the component
componentRef.setInput('node', currentASTNode);
componentRef.setInput('className', 'origo-dynamic-box');
```

## Performance Rules of Thumb

> [!IMPORTANT]
>
> 1. **Never mutate AST objects.** Always treat `input()` values as immutable. If a property needs to change interactively, copy it into a local `signal`.
> 2. **Avoid `effect` for state derivation.** Do not use `effect` to update a `signal` based on another `signal`. Always use `computed`. `effect` should ONLY be used for side-effects (e.g., interacting with the DOM directly, logging, or syncing with third-party non-Angular libraries).
> 3. **Bind directly to signals.** The template automatically registers dependencies. You do not need the `async` pipe for signals.

By strictly adhering to these patterns, our renderer will achieve granular reactivity—updating only the exact DOM nodes that change without triggering full component tree change detection checks.
