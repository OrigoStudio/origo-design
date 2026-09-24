import {
  Component,
  input,
  model,
  computed,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  effect,
  untracked,
} from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface SwitchProps {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-switch',
  standalone: true,
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-switch]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class SwitchComponent implements OrigoAdapter<SwitchProps> {
  static readonly contractSchema: Record<
    string,
    'string' | 'number' | 'boolean' | 'object' | 'array'
  > = {
    checked: 'boolean',
    label: 'string',
    disabled: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<SwitchProps>>();
  checked = model<boolean>(false);

  computedLabel = computed(() => this.contract().props?.label ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedAriaLabel = computed(() => {
    const v = this.contract().props?.['aria-label'];
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
  });
  computedAriaDescribedBy = computed(() => {
    const v = this.contract().props?.['aria-describedby'];
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
  });

  private experienceAdapter = inject(WebExperienceAdapterService);

  constructor() {
    effect(() => {
      const props = this.contract().props;
      const coerced = props
        ? coerceContractProps<Record<string, any>>(props, SwitchComponent.contractSchema)
        : {};
      const contractVal = coerced['checked'] !== undefined ? !!coerced['checked'] : this.checked();
      untracked(() => {
        if (contractVal === this.checked()) return;
        this.checked.set(contractVal);
      });
    });
  }

  onChange(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || this.computedDisabled() || !this.contract().id)
      return;

    const isChecked = target.checked;
    this.checked.set(isChecked);
    this.experienceAdapter.updateState(this.contract().id, 'checked', isChecked);
  }
}
