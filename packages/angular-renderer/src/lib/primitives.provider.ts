import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { RENDERER_REGISTRY } from './renderer.tokens';
import { SelectComponent } from '../components/primitives/select/select.component';
import { CheckboxComponent } from '../components/primitives/checkbox/checkbox.component';
import { RadioGroupComponent } from '../components/primitives/radio-group/radio-group.component';
import { TextareaComponent } from '../components/primitives/textarea/textarea.component';
import { HBoxComponent } from '../components/primitives/hbox/hbox.component';
import { LabelComponent } from '../components/primitives/label/label.component';
import { FormFieldComponent } from '../components/primitives/form-field/form-field.component';
import { DataGridComponent } from '../components/primitives/data-grid/data-grid.component';
import { ListComponent } from '../components/primitives/list/list.component';
import { CardComponent } from '../components/primitives/card/card.component';
import { SidebarComponent } from '../components/primitives/sidebar/sidebar.component';
import { TabsComponent } from '../components/primitives/tabs/tabs.component';
import { BreadcrumbsComponent } from '../components/primitives/breadcrumbs/breadcrumbs.component';
import { SwitchComponent } from '../components/primitives/switch/switch.component';
import { ChipComponent } from '../components/primitives/chip/chip.component';
import { TextInputComponent } from '../components/primitives/text-input/text-input.component';
import { ButtonComponent } from '../components/primitives/button/button.component';
import { VBoxComponent } from '../components/primitives/vbox/vbox.component';

export function provideOrigo9Primitives(): EnvironmentProviders {
  const registryMap = new Map<string, any>([
    ['Select', SelectComponent],
    ['Checkbox', CheckboxComponent],
    ['RadioGroup', RadioGroupComponent],
    ['Textarea', TextareaComponent],
    ['HBox', HBoxComponent],
    ['Label', LabelComponent],
    ['FormField', FormFieldComponent],
    ['DataGrid', DataGridComponent],
    ['List', ListComponent],
    ['Card', CardComponent],
    ['Sidebar', SidebarComponent],
    ['Tabs', TabsComponent],
    ['Breadcrumbs', BreadcrumbsComponent],
    ['Navigation', SidebarComponent],
    ['Switch', SwitchComponent],
    ['Chip', ChipComponent],
    ['TextInput', TextInputComponent],
    ['Button', ButtonComponent],
    ['VBox', VBoxComponent],
    ['vbox', VBoxComponent], // For backward compatibility with 'vbox' in preview-root
  ]);

  return makeEnvironmentProviders([
    {
      provide: RENDERER_REGISTRY,
      useValue: registryMap,
    },
  ]);
}
