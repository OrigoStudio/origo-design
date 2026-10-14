import { Injectable, signal } from '@angular/core';
import { ToastMessage } from './toast.models';

let toastIdCounter = 0;

@Injectable({
  providedIn: 'root',
})
export class OrigoToastService {
  readonly messages = signal<ToastMessage[]>([]);

  show(message: ToastMessage, preventDuplicates = false): void {
    const summary = message.summary ?? '';
    const detail = message.detail ?? message.message ?? message.content ?? '';
    const severity = message.severity ?? 'info';

    if (preventDuplicates) {
      const exists = this.messages().some(
        m =>
          (m.severity ?? 'info') === severity &&
          (m.summary ?? '') === summary &&
          (m.detail ?? m.message ?? m.content ?? '') === detail
      );
      if (exists) {
        return;
      }
    }

    const toastWithId: ToastMessage = {
      ...message,
      id: message.id ?? `origo-toast-${++toastIdCounter}`,
    };

    this.messages.update(current => [...current, toastWithId]);
  }

  info(summary: string, detail?: string, life?: number): void {
    this.show({ severity: 'info', summary, detail, life });
  }

  success(summary: string, detail?: string, life?: number): void {
    this.show({ severity: 'success', summary, detail, life });
  }

  warn(summary: string, detail?: string, life?: number): void {
    this.show({ severity: 'warn', summary, detail, life });
  }

  error(summary: string, detail?: string, life?: number): void {
    this.show({ severity: 'error', summary, detail, life });
  }

  remove(id: string): void {
    this.messages.update(current => current.filter(m => m.id !== id));
  }

  clear(group?: string): void {
    if (!group) {
      this.messages.set([]);
    } else {
      this.messages.update(current => current.filter(m => m.group !== group));
    }
  }
}
