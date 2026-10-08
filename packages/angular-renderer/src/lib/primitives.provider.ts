import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { RENDERER_REGISTRY } from './renderer.tokens';
import { IconButtonComponent } from '../components/primitives/icon-button/icon-button.component';
import { ButtonGroupComponent } from '../components/primitives/button-group/button-group.component';
import { FloatingActionButtonComponent } from '../components/primitives/floating-action-button/floating-action-button.component';
import { SelectComponent } from '../components/primitives/select/select.component';
import { MultiSelectComponent } from '../components/primitives/multi-select/multi-select.component';
import { AutocompleteComponent } from '../components/primitives/autocomplete/autocomplete.component';
import { ComboboxComponent } from '../components/primitives/combobox/combobox.component';
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
import { InputNumberComponent } from '../components/primitives/input-number/input-number.component';

export function provideOrigo9Primitives(): EnvironmentProviders {
  const registryMap = new Map<string, unknown>([
    ['IconButton', IconButtonComponent],
    ['ButtonGroup', ButtonGroupComponent],
    ['FloatingActionButton', FloatingActionButtonComponent],
    ['Select', SelectComponent],
    ['MultiSelect', MultiSelectComponent],
    ['Autocomplete', AutocompleteComponent],
    ['Combobox', ComboboxComponent],
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
    ['InputNumber', InputNumberComponent],
    ['vbox', VBoxComponent], // For backward compatibility with 'vbox' in preview-root
  ]);

  return makeEnvironmentProviders([
    {
      provide: RENDERER_REGISTRY,
      useValue: registryMap,
    },
  ]);
}
