import {
  Component,
  input,
  viewChild,
  ViewContainerRef,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
} from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter, ContainerComponent } from '../../../adapters/web/adapter';
import { LabelComponent, LabelProps } from '../label/label.component';

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-form-field',
  standalone: true,
  imports: [LabelComponent],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-form-field]': 'true',
    '[class.has-error]': '!!computedError()',
    '[attr.data-testid]': 'contract().id ?? ""',
    '[attr.role]': 'computedAriaLabel() ? "group" : null',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
  },
})
export class FormFieldComponent implements OrigoAdapter<FormFieldProps>, ContainerComponent {
  static readonly contractSchema = {
    label: 'string',
    error: 'string',
    hint: 'string',
    required: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<FormFieldProps>>();

  vc = viewChild.required('vc', { read: ViewContainerRef });

  computedLabel = computed(() => this.contract().props?.label);
  computedError = computed(() => this.contract().props?.error);
  computedHint = computed(() => this.contract().props?.hint);
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

  labelContract = computed<InteractionContract<LabelProps>>(() => {
    const parentId = this.contract().id;
    const childId = this.contract().children?.[0]?.id;
    return {
      id: `${parentId}-label`,
      type: 'Label',
      props: {
        text: this.computedLabel(),
        required: this.computedRequired(),
        for: childId,
      },
    };
  });
}
