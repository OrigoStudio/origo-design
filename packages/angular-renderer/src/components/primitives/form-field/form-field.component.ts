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

  labelContract = computed<InteractionContract<LabelProps>>(() => {
    const parentId = this.contract().id;
    return {
      id: `${parentId}-label`,
      type: 'Label',
      props: {
        text: this.computedLabel(),
        required: this.computedRequired(),
      },
    };
  });
}
