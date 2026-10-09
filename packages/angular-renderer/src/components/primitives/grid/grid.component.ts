import { Component, input, viewChild, ViewContainerRef, computed } from '@angular/core';
import { NgStyle } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';

export interface GridProps {
  columns?: number | string | Record<string, number>;
  gap?: number | string;
  align?: string;
  justify?: string;
  responsive?: Record<string, number>;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const contractSchema: Record<
  keyof GridProps,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  columns: 'object', // coerce to object if responsive, or string if literal. We'll type this broadly. Wait, coerceContractProps doesn't handle union coercions well natively. Let's use 'string' for string, or 'number', but wait, the schema doesn't support complex unions. We'll map to object for responsive and parse in computed. We can omit it from schema to avoid strict coercion dropping it, or handle it manually.
  gap: 'string', // wait, gap can be string or number. Let's omit from strict schema coercion to keep it intact.
  align: 'string',
  justify: 'string',
  responsive: 'object',
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
};
// We will modify the schema slightly to avoid dropping columns/gap
const finalSchema = { ...contractSchema };
delete (finalSchema as any).columns;
delete (finalSchema as any).gap;

@Component({
  selector: 'origo-grid',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
})
export class GridComponent implements OrigoAdapter<GridProps>, IContainerComponent {
  contract = input.required<InteractionContract<GridProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  protected props = computed(() => {
    const p = coerceContractProps<GridProps>(this.contract().props, finalSchema);
    const original = this.contract().props || {};
    if ('columns' in original) p.columns = original.columns as any;
    if ('gap' in original) p.gap = original.gap as any;
    return p;
  });

  protected get gridTemplateColumns(): string {
    const cols = this.props().columns;
    if (typeof cols === 'number') return `repeat(${cols}, minmax(0, 1fr))`;
    if (typeof cols === 'string') return cols;
    // Responsive records are harder to do inline. We'll use CSS custom properties via style bindings.
    // For now, default to 1 or 12.
    return 'repeat(12, minmax(0, 1fr))';
  }

  protected get gapValue(): string {
    const g = this.props().gap;
    if (typeof g === 'number') return `${g}px`;
    return (g as string) || '';
  }

  protected get inlineStyles(): Record<string, string> {
    const p = this.props();
    const styles: Record<string, string> = {
      '--origo-grid-columns': this.gridTemplateColumns,
    };
    if (this.gapValue) styles['gap'] = this.gapValue;
    if (p.align) styles['align-items'] = p.align;
    if (p.justify) styles['justify-content'] = p.justify;

    // Apply responsive columns via inline css variables if provided (e.g. { sm: 1, md: 2, lg: 4 })
    // The CSS would use these variables via media queries.
    if (p.responsive) {
      for (const [key, val] of Object.entries(p.responsive)) {
        styles[`--origo-grid-cols-${key}`] = `repeat(${val}, minmax(0, 1fr))`;
      }
    } else if (typeof p.columns === 'object' && p.columns !== null) {
      for (const [key, val] of Object.entries(p.columns)) {
        styles[`--origo-grid-cols-${key}`] = `repeat(${val}, minmax(0, 1fr))`;
      }
    }
    return styles;
  }
}
