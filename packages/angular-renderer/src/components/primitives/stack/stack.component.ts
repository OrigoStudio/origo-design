import {
  Component,
  input,
  viewChild,
  ViewContainerRef,
  computed,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';

export interface StackProps {
  direction?: 'row' | 'column' | Record<string, 'row' | 'column'>;
  gap?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  wrap?: boolean | 'wrap' | 'nowrap';
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const contractSchema: Record<
  keyof StackProps,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  direction: 'string',
  gap: 'string', // wait, gap can be string or number. Let's omit gap.
  align: 'string',
  justify: 'string',
  wrap: 'string', // boolean | string
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
};

const finalSchema = { ...contractSchema };
delete (finalSchema as any).direction;
delete (finalSchema as any).gap;
delete (finalSchema as any).wrap;

@Component({
  selector: 'origo-stack',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './stack.component.html',
  styleUrl: './stack.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class StackComponent implements OrigoAdapter<StackProps>, IContainerComponent {
  static readonly contractSchema = contractSchema;

  contract = input.required<InteractionContract<StackProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  protected props = computed(() => {
    const p = coerceContractProps<StackProps>(this.contract().props, finalSchema);
    const original = this.contract().props || {};
    if ('direction' in original) p.direction = original.direction as any;
    if ('gap' in original) p.gap = original.gap as any;
    if ('wrap' in original) p.wrap = original.wrap as any;
    return p;
  });

  protected get gapValue(): string {
    const g = this.props().gap;
    if (typeof g === 'number' || /^\d+$/.test(String(g))) return `${g}px`;
    return (g as string) || '';
  }

  protected get wrapValue(): string {
    const w = this.props().wrap;
    if ((w as unknown) === 'true' || w === true) return 'wrap';
    if ((w as unknown) === 'false' || w === false) return 'nowrap';
    return (w as string) || 'nowrap';
  }

  protected get inlineStyles(): Record<string, string> {
    const p = this.props();
    const styles: Record<string, string> = {
      '--origo-stack-wrap': this.wrapValue,
    };
    if (typeof p.direction === 'object' && p.direction !== null) {
      for (const [key, val] of Object.entries(p.direction)) {
        styles[`--origo-stack-direction-${key}`] = val as string;
      }
    } else {
      styles['--origo-stack-direction'] = (p.direction as string) || 'column';
    }
    if (this.gapValue) styles['gap'] = this.gapValue;
    if (p.align) styles['align-items'] = p.align;
    if (p.justify) styles['justify-content'] = p.justify;
    return styles;
  }
}
