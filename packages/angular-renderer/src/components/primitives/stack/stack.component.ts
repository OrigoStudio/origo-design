import { Component, input, viewChild, ViewContainerRef, computed } from '@angular/core';
import { NgStyle } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';

export interface StackProps {
  direction?: 'row' | 'column';
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
delete (finalSchema as any).gap;
delete (finalSchema as any).wrap;

@Component({
  selector: 'origo-stack',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './stack.component.html',
  styleUrl: './stack.component.scss',
})
export class StackComponent implements OrigoAdapter<StackProps>, IContainerComponent {
  contract = input.required<InteractionContract<StackProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  protected props = computed(() => {
    const p = coerceContractProps<StackProps>(this.contract().props, finalSchema);
    const original = this.contract().props || {};
    if ('gap' in original) p.gap = original.gap as any;
    if ('wrap' in original) p.wrap = original.wrap as any;
    return p;
  });

  protected get gapValue(): string {
    const g = this.props().gap;
    if (typeof g === 'number') return `${g}px`;
    return (g as string) || '';
  }

  protected get wrapValue(): string {
    const w = this.props().wrap;
    if (typeof w === 'boolean') return w ? 'wrap' : 'nowrap';
    return (w as string) || 'nowrap';
  }

  protected get inlineStyles(): Record<string, string> {
    const p = this.props();
    const styles: Record<string, string> = {
      '--origo-stack-direction': p.direction || 'column',
      '--origo-stack-wrap': this.wrapValue,
    };
    if (this.gapValue) styles['gap'] = this.gapValue;
    if (p.align) styles['align-items'] = p.align;
    if (p.justify) styles['justify-content'] = p.justify;
    return styles;
  }
}
