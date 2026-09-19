import { InjectionToken, Type } from '@angular/core';

import { ButtonComponent } from '../components/primitives/button/button.component';
import { TextInputComponent } from '../components/primitives/text-input/text-input.component';
import { VBoxComponent } from '../components/primitives/vbox/vbox.component';
import { SelectComponent } from '../components/primitives/select/select.component';
import { CheckboxComponent } from '../components/primitives/checkbox/checkbox.component';
import { RadioGroupComponent } from '../components/primitives/radio-group/radio-group.component';
import { TextareaComponent } from '../components/primitives/textarea/textarea.component';
import { HBoxComponent } from '../components/primitives/hbox/hbox.component';
import { LabelComponent } from '../components/primitives/label/label.component';
import { FormFieldComponent } from '../components/primitives/form-field/form-field.component';

export const RENDERER_REGISTRY = new InjectionToken<Map<string, Type<unknown>>>(
  'RENDERER_REGISTRY',
  {
    providedIn: 'root',
    factory: () => {
      const map = new Map<string, Type<unknown>>();
      map.set('Button', ButtonComponent);
      map.set('button', ButtonComponent);
      map.set('TextInput', TextInputComponent);
      map.set('textInput', TextInputComponent);
      map.set('VBox', VBoxComponent);
      map.set('vbox', VBoxComponent);
      map.set('Select', SelectComponent);
      map.set('Checkbox', CheckboxComponent);
      map.set('RadioGroup', RadioGroupComponent);
      map.set('Textarea', TextareaComponent);
      map.set('HBox', HBoxComponent);
      map.set('Label', LabelComponent);
      map.set('FormField', FormFieldComponent);
      return map;
    },
  }
);
