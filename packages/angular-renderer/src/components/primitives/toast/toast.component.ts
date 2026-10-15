import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  viewChild,
  TemplateRef,
  computed,
  signal,
  effect,
  DestroyRef,
  PLATFORM_ID,
  ViewContainerRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import {
  ToastProps,
  ToastMessage,
  ToastContractSchema,
  ToastPosition,
  ToastSeverity,
} from './toast.models';
import { OrigoToastService } from './toast.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
import { OrigoOverlayRef } from '../../../lib/overlay/overlay.models';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

interface ActiveToastTimer {
  timeoutId: ReturnType<typeof setTimeout>;
  startTime: number;
  remaining: number;
}

let toastItemCounter = 0;

@Component({
  selector: 'origo-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-toast-host]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class ToastComponent implements OrigoAdapter<ToastProps>, AfterViewInit {
  static readonly contractSchema = ToastContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ToastProps>>();

  show = output<ToastMessage>();
  close = output<ToastMessage>();
  action = output<{ message: ToastMessage; action: string }>();

  toastTemplate = viewChild<TemplateRef<unknown>>('toastTemplate');

  private overlayService = inject(OrigoOverlayService);
  private toastService = inject(OrigoToastService);
  private destroyRef = inject(DestroyRef);
  private vcr = inject(ViewContainerRef);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private readonly experienceAdapter = inject(WebExperienceAdapterService, { optional: true });

  private overlayRef: OrigoOverlayRef | null = null;
  private currentOverlayPosition: ToastPosition | null = null;
  private readonly timers = new Map<string, ActiveToastTimer>();
  private readonly scheduledMessageIds = new Set<string>();

  private readonly imperativeMessages = signal<ToastMessage[]>([]);
  private readonly dismissedIds = signal<Set<string>>(new Set());

  readonly coercedProps = computed(() =>
    coerceContractProps<ToastProps>(this.contract()?.props, ToastContractSchema)
  );

  readonly position = computed<ToastPosition>(() => {
    return (this.coercedProps().position as ToastPosition) || 'top-end';
  });

  readonly defaultLife = computed(() => {
    const life = this.coercedProps().life;
    return typeof life === 'number' ? life : 3000;
  });

  readonly defaultClosable = computed(() => {
    const closable = this.coercedProps().closable;
    return closable !== false;
  });

  readonly preventDuplicates = computed(() => this.coercedProps().preventDuplicates === true);

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);

  private readonly contractMessages = computed<ToastMessage[]>(() => {
    const props = this.coercedProps();
    const result: ToastMessage[] = [];

    if (props.messages && Array.isArray(props.messages)) {
      props.messages.forEach((m, idx) => {
        result.push({
          ...m,
          id: m.id ?? `contract-msg-${idx}-${m.summary || ''}`,
          severity: (m.severity as ToastSeverity) || 'info',
          detail: m.detail ?? m.message ?? m.content,
          closable: m.closable !== undefined ? m.closable : this.defaultClosable(),
          life: m.life !== undefined ? m.life : this.defaultLife(),
        });
      });
    } else if (props.summary || props.message || props.detail) {
      result.push({
        id: `contract-msg-single-${props.summary || ''}`,
        severity: (props.severity as ToastSeverity) || 'info',
        summary: props.summary,
        detail: props.detail ?? props.message,
        icon: props.icon,
        life: props.life ?? this.defaultLife(),
        closable: props.closable !== undefined ? props.closable : this.defaultClosable(),
        sticky: props.sticky,
      });
    }

    return result;
  });

  private readonly serviceMessages = computed<ToastMessage[]>(() => {
    const serviceMessages = this.toastService.messages();
    const currentGroup = this.coercedProps().group;
    return serviceMessages
      .filter(msg => !currentGroup || msg.group === currentGroup)
      .map(m => ({
        ...m,
        id: m.id ?? `service-toast-${m.summary || ''}`,
        severity: (m.severity as ToastSeverity) || 'info',
        summary: m.summary ?? '',
        detail: m.detail ?? m.message ?? m.content ?? '',
        closable: m.closable !== undefined ? m.closable : this.defaultClosable(),
        life: m.life !== undefined ? m.life : this.defaultLife(),
      }));
  });

  readonly activeMessages = computed<ToastMessage[]>(() => {
    const dismissed = this.dismissedIds();
    const all = [
      ...this.contractMessages(),
      ...this.serviceMessages(),
      ...this.imperativeMessages(),
    ];
    const filtered = all.filter(m => m.id && !dismissed.has(m.id));

    if (!this.preventDuplicates()) {
      return filtered;
    }

    const unique: ToastMessage[] = [];
    for (const m of filtered) {
      const isDup = unique.some(
        u =>
          (u.severity || 'info') === (m.severity || 'info') &&
          (u.summary || '') === (m.summary || '') &&
          (u.detail || '') === (m.detail || '')
      );
      if (!isDup) {
        unique.push(m);
      }
    }
    return unique;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearAllTimers();
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    });

    // Reactive effect to schedule timers for active messages and manage overlay
    effect(() => {
      const msgs = this.activeMessages();
      const pos = this.position();
      this.cdr.markForCheck();
      if (!isPlatformBrowser(this.platformId)) return;

      if (msgs.length === 0) {
        this.clearAllTimers();
        this.scheduledMessageIds.clear();
        if (this.overlayRef) {
          this.overlayRef.dispose();
          this.overlayRef = null;
          this.currentOverlayPosition = null;
        }
        if (this.contract()?.id) {
          this.experienceAdapter?.updateState(this.contract().id, 'visible', false);
        }
        return;
      }

      if (this.overlayRef && this.currentOverlayPosition !== pos) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }

      this.ensureOverlay();
      if (this.contract()?.id) {
        this.experienceAdapter?.updateState(this.contract().id, 'visible', true);
      }

      // Cleanup timers for messages no longer active
      const activeIds = new Set(msgs.map(m => m.id).filter((id): id is string => !!id));
      for (const id of Array.from(this.scheduledMessageIds)) {
        if (!activeIds.has(id)) {
          this.clearTimer(id);
          this.scheduledMessageIds.delete(id);
        }
      }

      // Schedule timers for newly active messages
      for (const msg of msgs) {
        if (msg.id && !this.scheduledMessageIds.has(msg.id)) {
          this.scheduledMessageIds.add(msg.id);
          this.show.emit(msg);

          const life = msg.sticky ? 0 : (msg.life ?? this.defaultLife());
          if (life > 0) {
            this.startTimer(msg.id, life);
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.activeMessages().length > 0) {
      this.ensureOverlay();
    }
  }

  private ensureOverlay(): void {
    if (this.overlayRef) return;
    const template = this.toastTemplate();
    if (!template) return;

    const pos = this.position();
    this.overlayRef = this.overlayService.create({
      position: {
        type: 'global',
        position: pos,
      },
      hasBackdrop: false,
      panelClass: ['origo-overlay-pane--toast', 'origo-toast-portal'],
      viewContainerRef: this.vcr,
    });

    this.currentOverlayPosition = pos;
    this.overlayRef.open(template, this.vcr);
  }

  addToast(message: ToastMessage): void {
    const id = message.id ?? `origo-toast-item-${++toastItemCounter}`;
    const toastItem: ToastMessage = {
      ...message,
      id,
      severity: (message.severity as ToastSeverity) || 'info',
      summary: message.summary ?? '',
      detail: message.detail ?? message.message ?? message.content ?? '',
      closable: message.closable !== undefined ? message.closable : this.defaultClosable(),
      life: message.life !== undefined ? message.life : this.defaultLife(),
    };

    this.imperativeMessages.update(msgs => {
      if (this.preventDuplicates()) {
        const isDuplicate = msgs.some(
          m =>
            (m.severity || 'info') === toastItem.severity &&
            (m.summary || '') === toastItem.summary &&
            (m.detail || '') === toastItem.detail
        );
        if (isDuplicate) return msgs;
      }
      return [...msgs, toastItem];
    });
  }

  private startTimer(id: string, duration: number): void {
    this.clearTimer(id);
    const timeoutId = setTimeout(() => {
      this.dismiss(id);
    }, duration);

    this.timers.set(id, {
      timeoutId,
      startTime: Date.now(),
      remaining: duration,
    });
  }

  onItemMouseEnter(id: string): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    clearTimeout(timer.timeoutId);
    const elapsed = Date.now() - timer.startTime;
    timer.remaining = Math.max(0, timer.remaining - elapsed);
  }

  onItemMouseLeave(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.remaining <= 0) return;
    timer.startTime = Date.now();
    timer.timeoutId = setTimeout(() => {
      this.dismiss(id);
    }, timer.remaining);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer.timeoutId);
      this.timers.delete(id);
    }
  }

  private clearAllTimers(): void {
    this.timers.forEach(t => clearTimeout(t.timeoutId));
    this.timers.clear();
  }

  dismiss(id: string): void {
    this.clearTimer(id);
    const target = this.activeMessages().find(m => m.id === id);
    if (target) {
      this.dismissedIds.update(set => new Set(set).add(id));
      this.imperativeMessages.update(msgs => msgs.filter(m => m.id !== id));
      this.toastService.remove(id);
      this.close.emit(target);
      if (this.contract()?.id) {
        this.experienceAdapter?.dispatchCapability(this.contract().id, 'close', target);
      }
    }
  }

  normalizeSeverity(severity?: string): string {
    const s = severity?.toLowerCase();
    if (s === 'warn' || s === 'warning') return 'warning';
    if (s === 'error') return 'error';
    if (s === 'success') return 'success';
    return 'info';
  }

  getItemRole(severity?: string): string {
    const s = this.normalizeSeverity(severity);
    return s === 'error' || s === 'warning' ? 'alert' : 'status';
  }

  getItemAriaLive(severity?: string): string {
    const s = this.normalizeSeverity(severity);
    return s === 'error' || s === 'warning' ? 'assertive' : 'polite';
  }
}
