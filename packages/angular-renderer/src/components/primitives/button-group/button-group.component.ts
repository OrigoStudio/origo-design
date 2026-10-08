import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';

export interface ButtonGroupProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  orientation?: 'row' | 'column';
  attached?: boolean;
  size?: 'small' | 'medium' | 'large';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-button-group',
  standalone: true,
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class]': 'computedHostClasses()',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class ButtonGroupComponent implements OrigoAdapter<ButtonGroupProps> {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    orientation: 'string',
    attached: 'boolean',
    size: 'string',
    'aria-label': 'string',
    'aria-describedby': 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ButtonGroupProps>>();

  computedHostClasses = computed(() => {
    const rawO = this.contract().props?.orientation;
    const o = rawO === 'column' ? 'column' : 'row';
    const attached = this.contract().props?.attached;
    const rawSize = this.contract().props?.size;
    const size = ['small', 'medium', 'large'].includes(rawSize as string) ? rawSize : undefined;
    return [
      'origo-button-group',
      `origo-orientation-${o}`,
      attached ? 'origo-attached' : '',
      size ? `origo-size-${size}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null && String(label).trim() !== ''
      ? String(label)
      : undefined;
  });
  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null && String(desc).trim() !== ''
      ? String(desc)
      : undefined;
  });
}
