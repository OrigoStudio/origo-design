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
  ElementRef,
  signal,
  AfterContentChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface BadgeProps {
  value?: string | number;
  severity?:
    | 'primary'
    | 'secondary'
    | 'info'
    | 'success'
    | 'warn'
    | 'warning'
    | 'error'
    | 'contrast'
    | string;
  size?: 'small' | 'medium' | 'large' | string;
  shape?: 'circle' | 'rounded' | 'square' | string;
  max?: number;
  dot?: boolean;
  interactive?: boolean;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const BadgeContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  value: 'string',
  severity: 'string',
  size: 'string',
  shape: 'string',
  max: 'number',
  dot: 'boolean',
  interactive: 'boolean',
} as const;

@Component({
  selector: 'origo-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-badge-host]': 'true',
    '[attr.data-testid]': 'contractId()',
  },
})
export class BadgeComponent
  implements OrigoAdapter<BadgeProps>, ContainerComponent, AfterContentChecked
{
  static readonly contractSchema = BadgeContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<BadgeProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });
  contentWrapper = viewChild<ElementRef<HTMLElement>>('contentWrapper');

  click = output<MouseEvent>();

  private experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
  private readonly _hasProjectedContent = signal(false);

  readonly contractId = computed(() => {
    try {
      return this.contract()?.id ?? '';
    } catch {
      return '';
    }
  });

  readonly coercedProps = computed(() => {
    let rawProps: BadgeProps | undefined;
    try {
      rawProps = this.contract()?.props;
    } catch {
      rawProps = undefined;
    }
    return coerceContractProps<BadgeProps>(rawProps, BadgeContractSchema);
  });

  readonly isDot = computed(() => {
    const p = this.coercedProps();
    if (p.dot === true) return true;
    const v = p.value;
    return v === undefined || v === null || String(v).trim() === '';
  });

  readonly displayValue = computed(() => {
    const p = this.coercedProps();
    const v = p.value;
    if (v === undefined || v === null) return '';
    const maxVal = p.max;
    if (maxVal !== undefined && maxVal !== null && !isNaN(Number(v)) && Number(v) > maxVal) {
      return `${maxVal}+`;
    }
    return String(v);
  });

  readonly isInteractive = computed(() => this.coercedProps().interactive === true);

  readonly severity = computed(() => {
    const s = this.coercedProps().severity?.toLowerCase() || 'primary';
    return s === 'warn' || s === 'warning' ? 'warning' : s;
  });

  readonly size = computed(() => this.coercedProps().size || 'medium');

  readonly shape = computed(() => this.coercedProps().shape || 'rounded');

  readonly ariaLabel = computed(() => this.coercedProps()['aria-label']);

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);

  readonly computedAriaLabel = computed(() => {
    if (this.ariaLabel()) return this.ariaLabel();
    if (this.isDot()) return 'Status indicator';
    return String(this.displayValue());
  });

  readonly hasContent = computed(() => {
    let contractWithChildren: { children?: unknown[] } | undefined;
    try {
      contractWithChildren = this.contract() as unknown as { children?: unknown[] };
    } catch {
      contractWithChildren = undefined;
    }
    return this._hasProjectedContent() || (contractWithChildren?.children?.length ?? 0) > 0;
  });

  readonly computedBadgeClasses = computed(() => {
    const classes = [
      'origo-badge',
      `origo-badge--severity-${this.severity()}`,
      `origo-badge--size-${this.size()}`,
      `origo-badge--shape-${this.shape()}`,
    ];
    if (this.isDot()) classes.push('origo-badge--dot');
    if (this.isInteractive()) classes.push('origo-badge--interactive');
    return classes.join(' ');
  });

  ngAfterContentChecked() {
    const wrapper = this.contentWrapper();
    if (wrapper) {
      const el = wrapper.nativeElement;
      let hasChildren = false;
      for (let i = 0; i < el.childNodes.length; i++) {
        const node = el.childNodes[i];
        if (node.nodeType === 1) {
          // ELEMENT_NODE
          hasChildren = true;
          break;
        } else if (node.nodeType === 3 && (node.textContent?.trim().length ?? 0) > 0) {
          // TEXT_NODE
          hasChildren = true;
          break;
        }
      }
      if (this._hasProjectedContent() !== hasChildren) {
        queueMicrotask(() => {
          this._hasProjectedContent.set(hasChildren);
        });
      }
    }
  }

  onClick(event: MouseEvent) {
    if (this.isInteractive()) {
      event.stopPropagation();
      this.click.emit(event);
      if (this.contract()?.id) {
        this.experienceAdapter?.dispatchCapability(this.contract().id, 'click', { event });
      }
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.isInteractive() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.stopPropagation();
      const syntheticMouseEvent = new MouseEvent('click', {
        bubbles: false,
        cancelable: true,
      });
      this.onClick(syntheticMouseEvent);
    }
  }
}
