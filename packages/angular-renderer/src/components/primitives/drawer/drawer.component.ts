import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  viewChild,
  ViewContainerRef,
  TemplateRef,
  computed,
  effect,
  DestroyRef,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
import { OrigoOverlayConfig, OrigoOverlayRef } from '../../../lib/overlay/overlay.models';

let drawerCounter = 0;

export interface DrawerProps {
  visible?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  modal?: boolean;
  dismissible?: boolean;
  closeOnEscape?: boolean;
  blockScroll?: boolean;
  size?: string;
  header?: string;
  footer?: string;
  closable?: boolean;
  data?: unknown;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const DrawerContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  visible: 'boolean',
  position: 'string',
  modal: 'boolean',
  dismissible: 'boolean',
  closeOnEscape: 'boolean',
  blockScroll: 'boolean',
  size: 'string',
  header: 'string',
  footer: 'string',
  closable: 'boolean',
  data: 'object',
} as const;

@Component({
  selector: 'origo-drawer',
  standalone: true,
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-drawer-host]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class DrawerComponent implements OrigoAdapter<DrawerProps>, ContainerComponent {
  static readonly contractSchema = DrawerContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<DrawerProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });

  drawerTemplate = viewChild('drawerTemplate', { read: TemplateRef });

  visibleChange = output<boolean>();
  open = output<void>();
  close = output<void>();
  show = output<void>();
  hide = output<void>();

  private overlayService = inject(OrigoOverlayService);
  private destroyRef = inject(DestroyRef);
  private vcr = inject(ViewContainerRef);
  private experienceAdapter = inject(WebExperienceAdapterService);

  private readonly id = ++drawerCounter;
  readonly headerId = `origo-drawer-header-${this.id}`;

  private overlayRef: OrigoOverlayRef | null = null;
  private isOpen = false;

  coercedProps = computed(() =>
    coerceContractProps<DrawerProps>(this.contract()?.props ?? {}, DrawerContractSchema)
  );

  computedVisible = computed(() => !!this.coercedProps().visible);
  computedPosition = computed(() => this.coercedProps().position ?? 'left');
  computedModal = computed(() => this.coercedProps().modal !== false);
  computedDismissible = computed(() => this.coercedProps().dismissible !== false);
  computedCloseOnEscape = computed(() => this.coercedProps().closeOnEscape !== false);
  computedSize = computed(() => this.coercedProps().size ?? '320px');
  computedHeader = computed(() => this.coercedProps().header);
  computedFooter = computed(() => this.coercedProps().footer);
  computedClosable = computed(() => this.coercedProps().closable !== false);

  computedAriaLabel = computed(() => {
    const label = this.contract()?.props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : 'Drawer';
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract()?.props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  constructor() {
    effect(() => {
      const visible = this.computedVisible();
      if (visible && !this.isOpen) {
        this.openDrawer();
      } else if (!visible && this.isOpen) {
        this.closeDrawer(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }

  private openDrawer(): void {
    if (this.isOpen) return;

    const tpl = this.drawerTemplate();
    if (!tpl) return;

    const pos = this.computedPosition();
    const size = this.computedSize();

    let alignment: 'start' | 'end' | 'top' | 'bottom' = 'start';
    let width: string | undefined = size;
    let height: string | undefined = '100%';

    switch (pos) {
      case 'right':
        alignment = 'end';
        width = size;
        height = '100%';
        break;
      case 'top':
        alignment = 'top';
        width = '100%';
        height = size;
        break;
      case 'bottom':
        alignment = 'bottom';
        width = '100%';
        height = size;
        break;
      case 'left':
      default:
        alignment = 'start';
        width = size;
        height = '100%';
        break;
    }

    const config: OrigoOverlayConfig = {
      position: {
        type: 'global',
        position: alignment,
        width,
        height,
      },
      hasBackdrop: this.computedModal(),
      backdropClass: 'origo-drawer-backdrop',
      panelClass: ['origo-overlay-pane--drawer', `origo-overlay-pane--drawer-${pos}`],
      closeOnBackdropClick: this.computedDismissible(),
      closeOnOutsideClick: this.computedDismissible(),
      closeOnEscape: this.computedCloseOnEscape(),
      trapFocus: this.computedModal(),
      viewContainerRef: this.vcr,
    };

    this.overlayRef = this.overlayService.create(config, this.destroyRef);
    this.overlayRef.open(tpl, this.vcr);
    this.isOpen = true;

    this.open.emit();
    this.show.emit();
    this.experienceAdapter.updateState(this.contract().id, 'visible', true);
    this.experienceAdapter.dispatchCapability(this.contract().id, 'open', undefined);
    this.experienceAdapter.dispatchCapability(this.contract().id, 'show', undefined);

    this.overlayRef.afterClosed().then(result => {
      if (this.isOpen) {
        this.isOpen = false;
        this.visibleChange.emit(false);
        this.close.emit();
        this.hide.emit();
        this.experienceAdapter.updateState(this.contract().id, 'visible', false);
        this.experienceAdapter.dispatchCapability(this.contract().id, 'close', result);
        this.experienceAdapter.dispatchCapability(this.contract().id, 'hide', result);
      }
    });
  }

  private closeDrawer(notify = true): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.overlayRef?.isOpen) {
      this.overlayRef.close();
    }

    if (notify) {
      this.visibleChange.emit(false);
      this.close.emit();
      this.hide.emit();
      this.experienceAdapter.updateState(this.contract().id, 'visible', false);
      this.experienceAdapter.dispatchCapability(this.contract().id, 'close', undefined);
      this.experienceAdapter.dispatchCapability(this.contract().id, 'hide', undefined);
    }
  }

  onClose(): void {
    this.closeDrawer(true);
  }

  private cleanup(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.isOpen = false;
  }
}
