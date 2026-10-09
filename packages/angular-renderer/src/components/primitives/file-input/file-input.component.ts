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
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';

export interface FileInputProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  multiple?: boolean;
  accept?: string;
  maxFileSize?: number;
  uploadUrl?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-file-input',
  standalone: true,
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class.origo-file-input]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
  },
})
export class FileInputComponent implements OrigoAdapter<FileInputProps>, ControlValueAccessor {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    multiple: 'boolean',
    accept: 'string',
    maxFileSize: 'number',
    uploadUrl: 'string',
    'aria-label': 'string',
    'aria-describedby': 'string',
  } as const;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<FileInputProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });
  inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  fileSelect = output<File[]>();
  fileRemove = output<File>();
  fileError = output<string>();
  clear = output<void>();
  focus = output<FocusEvent>();
  blur = output<FocusEvent>();
  uploadStart = output<void>();
  uploadProgress = output<number>();
  uploadSuccess = output<unknown>();
  uploadError = output<unknown>();

  private http = inject(HttpClient, { optional: true });

  protected props = computed(() => {
    return coerceContractProps<FileInputProps>(
      this.contract().props,
      FileInputComponent.contractSchema
    );
  });

  computedMultiple = computed(() => !!this.props()?.multiple);
  computedAccept = computed(() => this.props()?.accept ?? '*/*');
  computedMaxFileSize = computed(() => this.props()?.maxFileSize);
  computedUploadUrl = computed(() => this.props()?.uploadUrl);
  computedAriaLabel = computed(() => this.props()?.['aria-label'] || null);
  computedAriaDescribedBy = computed(() => this.props()?.['aria-describedby'] || null);

  disabled = false;
  files: File[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: File[]) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(obj: unknown): void {
    if (!obj) {
      this.files = [];
      const inputEl = this.inputRef()?.nativeElement;
      if (inputEl) inputEl.value = '';
    } else if (Array.isArray(obj)) {
      this.files = obj;
    } else {
      this.files = [obj as File];
    }
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileChange(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files) {
      const selectedFiles = Array.from(inputEl.files);
      if (!selectedFiles.length) return;

      const maxFileSize = this.computedMaxFileSize();
      if (typeof maxFileSize === 'number' && maxFileSize >= 0) {
        const invalidFiles = selectedFiles.filter(file => file.size > maxFileSize);
        if (invalidFiles.length > 0) {
          this.fileError.emit(`File size exceeds maximum allowed size of ${maxFileSize} bytes`);
          inputEl.value = '';
          return;
        }
      }

      this.files = this.computedMultiple() ? [...this.files, ...selectedFiles] : [...selectedFiles];
      this.onChange(this.files);
      this.fileSelect.emit(selectedFiles);

      const uploadUrl = this.computedUploadUrl();
      if (uploadUrl && selectedFiles.length > 0) {
        this.uploadFiles(selectedFiles, uploadUrl);
      }

      inputEl.value = '';
    }
  }

  onFocus(event: FocusEvent) {
    this.focus.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.onTouched();
    this.blur.emit(event);
  }

  public removeFile(file: File) {
    this.files = this.files.filter(f => f !== file);
    this.onChange(this.files);
    this.fileRemove.emit(file);
  }

  public clearFiles() {
    this.files = [];
    this.onChange(this.files);
    this.clear.emit();
    const inputEl = this.inputRef()?.nativeElement;
    if (inputEl) inputEl.value = '';
  }

  private uploadFiles(files: File[], url: string) {
    this.uploadStart.emit();

    if (!this.http) {
      this.uploadError.emit('HttpClient is not provided.');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('file', file));

    this.http
      .post(url, formData, {
        reportProgress: true,
        observe: 'events',
        responseType: 'json',
      })
      .subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total && event.total > 0) {
              const percentComplete = (event.loaded / event.total) * 100;
              this.uploadProgress.emit(percentComplete);
            } else {
              this.uploadProgress.emit(100);
            }
          } else if (event.type === HttpEventType.Response) {
            this.uploadSuccess.emit(event.body);
          }
        },
        error: err => {
          this.uploadError.emit(err.message || 'Upload failed');
        },
      });
  }
}
