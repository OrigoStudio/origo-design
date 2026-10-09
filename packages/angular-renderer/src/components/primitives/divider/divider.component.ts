import {
  Component,
  input,
  computed,
  HostBinding,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: string | number;
  content?: string;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const contractSchema: Record<
  keyof DividerProps,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  orientation: 'string',
  variant: 'string',
  thickness: 'string',
  content: 'string',
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
};

const finalSchema = { ...contractSchema };
delete (finalSchema as any).thickness;

@Component({
  selector: 'origo-divider',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'computedOrientation()',
    '[attr.aria-label]': "props()['aria-label'] || null",
    '[attr.aria-describedby]': "props()['aria-describedby'] || null",
    '[class.origo-divider--horizontal]': "computedOrientation() === 'horizontal'",
    '[class.origo-divider--vertical]': "computedOrientation() === 'vertical'",
  },
})
export class DividerComponent implements OrigoAdapter<DividerProps> {
  static readonly contractSchema = contractSchema;

  contract = input.required<InteractionContract<DividerProps>>();

  protected props = computed(() => {
    const p = coerceContractProps<DividerProps>(this.contract().props, finalSchema);
    const original = this.contract().props || {};
    if ('thickness' in original) p.thickness = original.thickness as any;
    return p;
  });

  protected computedOrientation = computed(() => {
    const o = this.props().orientation;
    return o ? o.toLowerCase() : 'horizontal';
  });

  protected get thicknessValue(): string {
    const t = this.props().thickness;
    if (typeof t === 'number' || /^\d+$/.test(String(t))) return `${t}px`;
    return (t as string) || '';
  }

  protected get inlineStyles(): Record<string, string> {
    const p = this.props();
    const styles: Record<string, string> = {
      '--origo-divider-variant': p.variant || 'solid',
    };
    if (this.thicknessValue) {
      styles['--origo-divider-thickness'] = this.thicknessValue;
    }
    return styles;
  }
}
