import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';

export interface ButtonProps {
  label?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

@Component({
  selector: 'origo-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.origo-button]': 'true',
  },
})
export class ButtonComponent implements OrigoAdapter<ButtonProps> {
  static readonly contractSchema = {
    label: 'string',
    disabled: 'boolean',
    type: 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ButtonProps>>();

  computedLabel = computed(() => this.contract().props?.label ?? 'Button');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedType = computed(() => this.contract().props?.type ?? 'button');
}
