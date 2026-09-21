import {
  Component,
  input,
  model,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  effect,
  untracked,
} from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface CheckboxProps {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
  required?: boolean;
}

@Component({
  selector: 'origo-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-checkbox]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class CheckboxComponent implements OrigoAdapter<CheckboxProps> {
  static readonly contractSchema = {
    checked: 'boolean',
    label: 'string',
    disabled: 'boolean',
    required: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<CheckboxProps>>();
  checked = model<boolean>(false);

  computedLabel = computed(() => this.contract().props?.label ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedRequired = computed(() => !!this.contract().props?.required);
  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  private experienceAdapter = inject(WebExperienceAdapterService);

  constructor() {
    effect(() => {
      const contractVal = !!this.contract().props?.checked;
      untracked(() => {
        if (contractVal === this.checked()) return;
        this.checked.set(contractVal);
      });
    });
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target || this.computedDisabled()) return;

    const isChecked = target.checked;
    this.checked.set(isChecked);
    this.experienceAdapter.updateState(this.contract().id, 'checked', isChecked);
  }
}
