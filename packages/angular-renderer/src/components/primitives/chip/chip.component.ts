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

export interface ChipProps {
  selected?: boolean;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-chip',
  standalone: true,
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-chip]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class ChipComponent implements OrigoAdapter<ChipProps> {
  static readonly contractSchema: Record<
    string,
    'string' | 'number' | 'boolean' | 'object' | 'array'
  > = {
    selected: 'boolean',
    label: 'string',
    disabled: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ChipProps>>();
  selected = model<boolean>(false);

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
        ? coerceContractProps<Record<string, any>>(props, ChipComponent.contractSchema)
        : {};
      const contractVal =
        coerced['selected'] !== undefined ? !!coerced['selected'] : this.selected();
      untracked(() => {
        if (contractVal === this.selected()) return;
        this.selected.set(contractVal);
      });
    });
  }

  onClick() {
    if (this.computedDisabled() || !this.contract().id) return;

    const nextSelected = !this.selected();
    this.selected.set(nextSelected);
    this.experienceAdapter.updateState(this.contract().id, 'selected', nextSelected);
  }
}
