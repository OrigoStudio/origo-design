import {
  Component,
  input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  forwardRef,
  viewChild,
  ViewContainerRef,
  output,
  computed,
  signal,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface RichTextEditorProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  toolbar?: string[];
}

@Component({
  selector: 'origo-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  host: {
    '[class.origo-rich-text-editor]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class RichTextEditorComponent
  implements OrigoAdapter<RichTextEditorProps>, ControlValueAccessor
{
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    toolbar: 'object', // array of strings
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<RichTextEditorProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  focus = output<FocusEvent>();
  blur = output<FocusEvent>();

  computedToolbar = computed(
    () => this.contract().props?.toolbar ?? ['bold', 'italic', 'underline']
  );

  disabled = false;
  value = signal<string>('');

  private isUpdating = false;

  private onChange: (value: string) => void = () => {
    /* empty */
  };
  private onTouched: () => void = () => {
    /* empty */
  };

  writeValue(obj: unknown): void {
    if (this.isUpdating) return;
    this.value.set(typeof obj === 'string' ? obj : '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event) {
    if (this.disabled) return;

    const target = event.target as HTMLElement;
    const newValue = target.innerHTML;

    this.isUpdating = true;
    this.value.set(newValue);
    this.onChange(newValue);
    this.isUpdating = false;
  }

  onFocus(event: FocusEvent) {
    this.focus.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.onTouched();
    this.blur.emit(event);
  }

  execCommand(command: string) {
    if (this.disabled) return;
    document.execCommand(command, false);
  }
}
