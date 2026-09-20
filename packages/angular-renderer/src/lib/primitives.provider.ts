import { EnvironmentProviders, makeEnvironmentProviders, Type } from '@angular/core';
import { RENDERER_REGISTRY } from './renderer.tokens';
import { SelectComponent } from '../components/primitives/select/select.component';
import { CheckboxComponent } from '../components/primitives/checkbox/checkbox.component';
import { RadioGroupComponent } from '../components/primitives/radio-group/radio-group.component';
import { TextareaComponent } from '../components/primitives/textarea/textarea.component';
import { HBoxComponent } from '../components/primitives/hbox/hbox.component';
import { LabelComponent } from '../components/primitives/label/label.component';
import { FormFieldComponent } from '../components/primitives/form-field/form-field.component';

export function provideOrigo9Primitives(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: RENDERER_REGISTRY,
      useFactory: (m: Map<string, Type<unknown>>) => {
        m.set('Select', SelectComponent);
        m.set('Checkbox', CheckboxComponent);
        m.set('RadioGroup', RadioGroupComponent);
        m.set('Textarea', TextareaComponent);
        m.set('HBox', HBoxComponent);
        m.set('Label', LabelComponent);
        m.set('FormField', FormFieldComponent);
        return m;
      },
      deps: [RENDERER_REGISTRY],
    },
  ]);
}
