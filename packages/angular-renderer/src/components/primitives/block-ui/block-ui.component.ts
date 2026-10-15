import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
  viewChild,
  ViewContainerRef,
  TemplateRef,
  DestroyRef,
  PLATFORM_ID,
  effect,
  untracked,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
import { OrigoOverlayRef } from '../../../lib/overlay/overlay.models';
import { SpinnerComponent, SpinnerProps } from '../spinner/spinner.component';

export interface BlockUIProps {
  blocked?: boolean;
  loading?: boolean;
  fullScreen?: boolean;
  message?: string;
  spinner?: boolean;
  baseZIndex?: number;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const BlockUIContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  blocked: 'boolean',
  loading: 'boolean',
  fullScreen: 'boolean',
  message: 'string',
  spinner: 'boolean',
  baseZIndex: 'number',
} as const;

@Component({
  selector: 'origo-block-ui',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './block-ui.component.html',
  styleUrls: ['./block-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-block-ui-host]': 'true',
    '[attr.data-testid]': 'contractId()',
    '[attr.aria-busy]': "isBlocked() ? 'true' : null",
  },
})
export class BlockUIComponent implements OrigoAdapter<BlockUIProps>, ContainerComponent {
  static readonly contractSchema = BlockUIContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<BlockUIProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });
  fullScreenOverlayTemplate = viewChild<TemplateRef<unknown>>('fullScreenOverlayTemplate');

  blockedChange = output<boolean>();

  private overlayRef?: OrigoOverlayRef;
  private readonly overlayService = inject(OrigoOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly vcr = inject(ViewContainerRef);
  private readonly experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
  private lastBlockedState: boolean | null = null;

  readonly contractId = computed(() => {
    try {
      return this.contract()?.id ?? '';
    } catch {
      return '';
    }
  });

  readonly coercedProps = computed(() => {
    let rawProps: BlockUIProps | undefined;
    try {
      rawProps = this.contract()?.props;
    } catch {
      rawProps = undefined;
    }
    return coerceContractProps<BlockUIProps>(rawProps, BlockUIContractSchema);
  });

  readonly isBlocked = computed(() => {
    const p = this.coercedProps();
    return !!(p.blocked || p.loading);
  });

  readonly isFullScreen = computed(() => !!this.coercedProps().fullScreen);

  readonly message = computed(() => this.coercedProps().message ?? '');

  readonly showSpinner = computed(() => this.coercedProps().spinner !== false);

  readonly computedZIndex = computed(() => this.coercedProps().baseZIndex ?? 1000);

  readonly spinnerContract = computed<InteractionContract<SpinnerProps>>(() => ({
    id: `${this.contractId()}-spinner`,
    type: 'Spinner',
    props: {
      label: this.message() || 'Loading...',
    },
  }));

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.overlayRef?.dispose();
    });

    effect(() => {
      const blocked = this.isBlocked();
      const fullScreen = this.isFullScreen();
      const contractId = this.contractId();

      if (this.lastBlockedState !== null && this.lastBlockedState !== blocked) {
        untracked(() => {
          this.blockedChange.emit(blocked);
          if (contractId) {
            this.experienceAdapter?.updateState(contractId, 'blocked', blocked);
            this.experienceAdapter?.dispatchCapability(contractId, 'blockedChange', { blocked });
          }
        });
      }
      this.lastBlockedState = blocked;

      if (isPlatformBrowser(this.platformId) && fullScreen) {
        if (blocked) {
          if (!this.overlayRef) {
            untracked(() => this.openFullScreenOverlay());
          }
        } else {
          if (this.overlayRef) {
            untracked(() => {
              this.overlayRef?.close();
              this.overlayRef?.dispose();
              this.overlayRef = undefined;
            });
          }
        }
      } else if (!fullScreen && this.overlayRef) {
        untracked(() => {
          this.overlayRef?.close();
          this.overlayRef?.dispose();
          this.overlayRef = undefined;
        });
      }
    });
  }

  private openFullScreenOverlay() {
    const tpl = this.fullScreenOverlayTemplate();
    if (!tpl) return;

    this.overlayRef = this.overlayService.create(
      {
        position: {
          type: 'global',
          position: 'center',
          width: '100vw',
          height: '100vh',
        },
        hasBackdrop: false,
        panelClass: ['origo-overlay-pane', 'origo-overlay-pane--block-ui'],
        viewContainerRef: this.vcr,
      },
      this.destroyRef
    );

    this.overlayRef.open(tpl, this.vcr);
  }
}
