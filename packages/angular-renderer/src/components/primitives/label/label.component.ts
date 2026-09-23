import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
} from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';

export interface LabelProps {
  text?: string;
  for?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-label',
  standalone: true,
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-label]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class LabelComponent implements OrigoAdapter<LabelProps> {
  static readonly contractSchema = {
    text: 'string',
    for: 'string',
    required: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<LabelProps>>();

  computedText = computed(() => this.contract().props?.text ?? '');
  computedFor = computed(() => {
    const f = this.contract().props?.for;
    return f !== undefined && f !== null ? String(f) : undefined;
  });
  computedRequired = computed(() => !!this.contract().props?.required);
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
