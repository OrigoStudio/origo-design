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
  HostListener,
  signal,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropzoneProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  multiple?: boolean;
  accept?: string;
  maxFileSize?: number;
  uploadUrl?: string;
}

@Component({
  selector: 'origo-dropzone',
  standalone: true,
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
    '[class.origo-dropzone--dragover]': 'isDragOver()',
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
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<DropzoneProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

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

  computedMultiple = computed(() => !!this.contract().props?.multiple);
  computedAccept = computed(() => this.contract().props?.accept ?? '*/*');
  computedMaxFileSize = computed(() => this.contract().props?.maxFileSize);
  computedUploadUrl = computed(() => this.contract().props?.uploadUrl);

  disabled = false;
  files: File[] = [];
  isDragOver = signal(false);

  private onChange: (value: File[]) => void = () => {
    /* empty */
  };
  private onTouched: () => void = () => {
    /* empty */
  };

  writeValue(obj: unknown): void {
    if (!obj) {
      this.files = [];
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

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver.set(true);
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (this.disabled) return;

    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(selectedFiles: File[]) {
    const maxFileSize = this.computedMaxFileSize();
    if (maxFileSize) {
      const invalidFiles = selectedFiles.filter(file => file.size > maxFileSize);
      if (invalidFiles.length > 0) {
        this.fileError.emit(`File size exceeds maximum allowed size of ${maxFileSize} bytes`);
        return;
      }
    }

    if (!this.computedMultiple() && selectedFiles.length > 1) {
      selectedFiles = [selectedFiles[0]];
    }

    this.files = this.computedMultiple() ? [...this.files, ...selectedFiles] : [...selectedFiles];
    this.onChange(this.files);
    this.fileSelect.emit(selectedFiles);

    const uploadUrl = this.computedUploadUrl();
    if (uploadUrl && selectedFiles.length > 0) {
      this.uploadFiles(selectedFiles, uploadUrl);
    }
  }

  onFocus(event: FocusEvent) {
    this.focus.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.onTouched();
    this.blur.emit(event);
  }

  private uploadFiles(files: File[], url: string) {
    this.uploadStart.emit();

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file));

    xhr.upload.addEventListener('progress', event => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        this.uploadProgress.emit(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        this.uploadSuccess.emit(xhr.responseText);
      } else {
        this.uploadError.emit(`Upload failed with status ${xhr.status}`);
      }
    });

    xhr.addEventListener('error', () => {
      this.uploadError.emit('Upload failed due to network error');
    });

    xhr.open('POST', url);
    xhr.send(formData);
  }
}
