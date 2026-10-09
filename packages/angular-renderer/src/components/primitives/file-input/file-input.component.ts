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
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface FileInputProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  multiple?: boolean;
  accept?: string;
  maxFileSize?: number;
  uploadUrl?: string;
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
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<FileInputProps>>();
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

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const selectedFiles = Array.from(input.files);

      const maxFileSize = this.computedMaxFileSize();
      if (maxFileSize) {
        const invalidFiles = selectedFiles.filter(file => file.size > maxFileSize);
        if (invalidFiles.length > 0) {
          this.fileError.emit(`File size exceeds maximum allowed size of ${maxFileSize} bytes`);
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
