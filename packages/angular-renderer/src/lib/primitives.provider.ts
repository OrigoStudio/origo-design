import { EnvironmentProviders, makeEnvironmentProviders, Type } from '@angular/core';
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
        m.set('DataGrid', DataGridComponent);
        m.set('List', ListComponent);
        m.set('Card', CardComponent);
        m.set('Sidebar', SidebarComponent);
        m.set('Tabs', TabsComponent);
        m.set('Breadcrumbs', BreadcrumbsComponent);
        m.set('Navigation', SidebarComponent);
        m.set('Switch', SwitchComponent);
        m.set('Chip', ChipComponent);
        return m;
      },
      deps: [RENDERER_REGISTRY],
    },
  ]);
}
