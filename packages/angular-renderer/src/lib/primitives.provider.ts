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
import { DatePickerComponent } from '../components/primitives/date-picker/date-picker.component';
import { TimePickerComponent } from '../components/primitives/time-picker/time-picker.component';
import { DateRangePickerComponent } from '../components/primitives/date-range-picker/date-range-picker.component';
import { ContainerComponent } from '../components/primitives/container/container.component';
import { GridComponent } from '../components/primitives/grid/grid.component';
import { StackComponent } from '../components/primitives/stack/stack.component';
import { DividerComponent } from '../components/primitives/divider/divider.component';
import { FileInputComponent } from '../components/primitives/file-input/file-input.component';
import { DropzoneComponent } from '../components/primitives/dropzone/dropzone.component';
import { RichTextEditorComponent } from '../components/primitives/rich-text-editor/rich-text-editor.component';
import { PaginationComponent } from '../components/primitives/pagination/pagination.component';
import { StepperComponent } from '../components/primitives/stepper/stepper.component';
import { DialogComponent } from '../components/primitives/dialog/dialog.component';
import { ModalComponent } from '../components/primitives/modal/modal.component';
import { DrawerComponent } from '../components/primitives/drawer/drawer.component';
import { PopoverComponent } from '../components/primitives/popover/popover.component';
import { TooltipComponent } from '../components/primitives/tooltip/tooltip.component';
import { AlertComponent } from '../components/primitives/alert/alert.component';
import { ToastComponent } from '../components/primitives/toast/toast.component';
import { SnackbarComponent } from '../components/primitives/snackbar/snackbar.component';
import { BannerComponent } from '../components/primitives/banner/banner.component';
import { SpinnerComponent } from '../components/primitives/spinner/spinner.component';
import { ProgressBarComponent } from '../components/primitives/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../components/primitives/skeleton/skeleton.component';
import { BadgeComponent } from '../components/primitives/badge/badge.component';
import { TagComponent } from '../components/primitives/tag/tag.component';
import { BlockUIComponent } from '../components/primitives/block-ui/block-ui.component';

export function provideOrigo9Primitives(): EnvironmentProviders {
  const registryMap = new Map<string, unknown>([
    ['Alert', AlertComponent],
    ['Message', AlertComponent],
    ['Toast', ToastComponent],
    ['Snackbar', SnackbarComponent],
    ['Banner', BannerComponent],
    ['Dialog', DialogComponent],
    ['Modal', ModalComponent],
    ['Drawer', DrawerComponent],
    ['SidebarDrawer', DrawerComponent],
    ['Popover', PopoverComponent],
    ['Tooltip', TooltipComponent],
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
    ['Pagination', PaginationComponent],
    ['Paginator', PaginationComponent],
    ['Stepper', StepperComponent],
    ['Navigation', SidebarComponent],
    ['Switch', SwitchComponent],
    ['Chip', ChipComponent],
    ['TextInput', TextInputComponent],
    ['Button', ButtonComponent],
    ['VBox', VBoxComponent],
    ['InputNumber', InputNumberComponent],
    ['DatePicker', DatePickerComponent],
    ['TimePicker', TimePickerComponent],
    ['DateRangePicker', DateRangePickerComponent],
    ['Container', ContainerComponent],
    ['Grid', GridComponent],
    ['Stack', StackComponent],
    ['Divider', DividerComponent],
    ['FileInput', FileInputComponent],
    ['Dropzone', DropzoneComponent],
    ['RichTextEditor', RichTextEditorComponent],
    ['Spinner', SpinnerComponent],
    ['ProgressBar', ProgressBarComponent],
    ['Progress', ProgressBarComponent],
    ['Skeleton', SkeletonComponent],
    ['Badge', BadgeComponent],
    ['Tag', TagComponent],
    ['BlockUI', BlockUIComponent],
    ['LoadingOverlay', BlockUIComponent],
    ['vbox', VBoxComponent], // For backward compatibility with 'vbox' in preview-root
  ]);

  return makeEnvironmentProviders([
    {
      provide: RENDERER_REGISTRY,
      useValue: registryMap,
    },
  ]);
}
