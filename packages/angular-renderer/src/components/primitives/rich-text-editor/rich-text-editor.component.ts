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
  inject,
  ElementRef,
  SecurityContext,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

export interface RichTextEditorProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  toolbar?: string[];
  'aria-label'?: string;
  'aria-describedby'?: string;
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
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
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
    'aria-label': 'string',
    'aria-describedby': 'string',
  } as const;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<RichTextEditorProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });
  contentRef = viewChild<ElementRef<HTMLElement>>('contentEl');

  focus = output<FocusEvent>();
  blur = output<FocusEvent>();

  protected props = computed(() => {
    return coerceContractProps<RichTextEditorProps>(
      this.contract().props,
      RichTextEditorComponent.contractSchema
    );
  });

  computedToolbar = computed(() => {
    const t = this.props()?.toolbar;
    return Array.isArray(t) ? t : ['bold', 'italic', 'underline'];
  });

  computedAriaLabel = computed(() => this.props()?.['aria-label'] || null);
  computedAriaDescribedBy = computed(() => this.props()?.['aria-describedby'] || null);

  disabled = false;

  private sanitizer = inject(DomSanitizer);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(obj: unknown): void {
    const val = typeof obj === 'string' ? obj : '';
    const safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, val) || '';

    const el = this.contentRef()?.nativeElement;
    if (el && el.innerHTML !== safeHtml) {
      el.innerHTML = safeHtml;
    }
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
    this.onChange(target.innerHTML);
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
    const el = this.contentRef()?.nativeElement;
    if (!el) return;

    // Custom formatting engine to support Shadow DOM
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    // Ensure the selection is within our contentEditable
    if (!el.contains(range.commonAncestorContainer)) return;

    const tagMap: Record<string, string> = {
      bold: 'b',
      italic: 'i',
      underline: 'u',
    };
    const tag = tagMap[command];

    if (tag) {
      const newNode = document.createElement(tag);
      try {
        range.surroundContents(newNode);
      } catch {
        // Fallback for complex selections
        newNode.appendChild(range.extractContents());
        range.insertNode(newNode);
      }
      this.onChange(el.innerHTML);
    }
  }
}
