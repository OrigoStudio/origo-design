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
  inject,
  ElementRef,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';

export interface DropzoneProps {
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
  selector: 'origo-dropzone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropzoneComponent),
      multi: true,
    },
  ],
  host: {
    '[class.origo-dropzone]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
  },
})
export class DropzoneComponent implements OrigoAdapter<DropzoneProps>, ControlValueAccessor {
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

  contract = input.required<InteractionContract<DropzoneProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });
  inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  fileDrop = output<File[]>();
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
    return coerceContractProps<DropzoneProps>(
      this.contract().props,
      DropzoneComponent.contractSchema
    );
  });

  computedMultiple = computed(() => !!this.props()?.multiple);
  computedAccept = computed(() => this.props()?.accept ?? '*/*');
  computedMaxFileSize = computed(() => this.props()?.maxFileSize);
  computedUploadUrl = computed(() => this.props()?.uploadUrl);
  computedAriaLabel = computed(() => this.props()?.['aria-label'] || null);
  computedAriaDescribedBy = computed(() => this.props()?.['aria-describedby'] || null);

  disabled = false;
  files = signal<File[]>([]);
  isDragging = signal<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: File[]) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(obj: unknown): void {
    if (!obj) {
      this.files.set([]);
      const inputEl = this.inputRef()?.nativeElement;
      if (inputEl) inputEl.value = '';
    } else if (Array.isArray(obj)) {
      this.files.set(obj);
    } else {
      this.files.set([obj as File]);
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

  onDragOver(event: DragEvent) {
    if (this.disabled) return;
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    if (this.disabled) return;
    event.preventDefault();

    // Ignore dragleave if it's just moving into a child element
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      event.clientX > rect.left &&
      event.clientX < rect.right &&
      event.clientY > rect.top &&
      event.clientY < rect.bottom
    ) {
      return;
    }
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    if (this.disabled) return;
    event.preventDefault();
    this.isDragging.set(false);
    this.onTouched();

    if (event.dataTransfer?.files) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      if (!droppedFiles.length) return;
      this.processFiles(droppedFiles, 'drop');
    }
  }

  onFileChange(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files) {
      const selectedFiles = Array.from(inputEl.files);
      if (!selectedFiles.length) return;
      this.processFiles(selectedFiles, 'select');
      inputEl.value = '';
    }
  }

  private processFiles(incomingFiles: File[], source: 'drop' | 'select') {
    const accept = this.computedAccept();
    let validFiles = incomingFiles;

    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map((a: string) => a.trim().toLowerCase());
      validFiles = incomingFiles.filter(file => {
        const fileType = file.type.toLowerCase();
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return acceptedTypes.some((type: string) => {
          if (type.startsWith('.')) return fileExt === type;
          if (type.endsWith('/*')) return fileType.startsWith(type.substring(0, type.length - 1));
          return fileType === type;
        });
      });
      if (validFiles.length < incomingFiles.length) {
        this.fileError.emit(
          `Some files were rejected because they do not match the accepted types: ${accept}`
        );
      }
    }

    if (!validFiles.length) return;

    const maxFileSize = this.computedMaxFileSize();
    if (typeof maxFileSize === 'number' && maxFileSize >= 0) {
      const invalidFiles = validFiles.filter(file => file.size > maxFileSize);
      if (invalidFiles.length > 0) {
        this.fileError.emit(`File size exceeds maximum allowed size of ${maxFileSize} bytes`);
        validFiles = validFiles.filter(file => file.size <= maxFileSize);
      }
    }

    if (!validFiles.length) return;

    const currentFiles = this.computedMultiple()
      ? [...this.files(), ...validFiles]
      : [...validFiles];
    this.files.set(currentFiles);
    this.onChange(currentFiles);

    if (source === 'drop') {
      this.fileDrop.emit(validFiles);
    } else {
      this.fileSelect.emit(validFiles);
    }

    const uploadUrl = this.computedUploadUrl();
    if (uploadUrl && validFiles.length > 0) {
      this.uploadFiles(validFiles, uploadUrl);
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
    const updated = this.files().filter(f => f !== file);
    this.files.set(updated);
    this.onChange(updated);
    this.fileRemove.emit(file);
  }

  public clearFiles() {
    this.files.set([]);
    this.onChange([]);
    this.clear.emit();
    const inputEl = this.inputRef()?.nativeElement;
    if (inputEl) inputEl.value = '';
  }

  private uploadFiles(filesToUpload: File[], url: string) {
    this.uploadStart.emit();

    if (!this.http) {
      this.uploadError.emit('HttpClient is not provided.');
      return;
    }

    const formData = new FormData();
    filesToUpload.forEach(file => formData.append('file', file));

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
