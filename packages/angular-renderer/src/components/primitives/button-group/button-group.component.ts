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
  orientation?: 'row' | 'column';
  attached?: boolean;
  size?: 'small' | 'medium' | 'large';
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
    orientation: 'string',
    attached: 'boolean',
    size: 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ButtonGroupProps>>();

  computedHostClasses = computed(() => {
    const o = this.contract().props?.orientation ?? 'row';
    const attached = this.contract().props?.attached;
    const size = this.contract().props?.size;
    return [
      'origo-button-group',
      `origo-orientation-${o}`,
      attached ? 'origo-attached' : '',
      size ? `origo-size-${size}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}
