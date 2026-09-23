import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface ButtonProps {
  label?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-button]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
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
  computedType = computed(() => {
    const type = this.contract().props?.type;
    return type === 'button' || type === 'submit' || type === 'reset' ? type : 'button';
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

  action = output<void>();

  private experienceAdapter = inject(WebExperienceAdapterService);

  onClick() {
    if (this.computedDisabled()) return;

    const id = this.contract().id;
    if (!id) return;

    this.experienceAdapter.dispatchCapability(id, 'click');
    this.action.emit();
  }
}
