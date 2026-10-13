import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface BreadcrumbItem {
  label: string;
  icon?: string;
  outcomeRef?: string;
  url?: string;
  disabled?: boolean;
}

export interface BreadcrumbsProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  items?: Array<BreadcrumbItem>;
  home?: BreadcrumbItem;
  separator?: string;
  routerMode?: 'angular' | 'native' | 'state';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const BreadcrumbsContractSchema: Record<
  keyof BreadcrumbsProps,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  items: 'array',
  home: 'object',
  separator: 'string',
  routerMode: 'string',
  'aria-label': 'string',
  'aria-describedby': 'string',
};

@Component({
  selector: 'origo-breadcrumbs',
  standalone: true,
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-breadcrumbs]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
    role: 'navigation',
  },
})
export class BreadcrumbsComponent implements OrigoAdapter<BreadcrumbsProps>, IContainerComponent {
  static readonly contractSchema = BreadcrumbsContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<BreadcrumbsProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  itemClick = output<BreadcrumbItem>();

  private experienceAdapter = inject(WebExperienceAdapterService);

  protected props = computed(() =>
    coerceContractProps<BreadcrumbsProps>(this.contract().props, BreadcrumbsContractSchema)
  );

  computedAriaLabel = computed(() => {
    const label = this.props()['aria-label'];
    return label !== undefined && label !== null ? String(label) : 'Breadcrumbs';
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.props()['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  computedSeparator = computed(() => {
    const sep = this.props().separator;
    return typeof sep === 'string' && sep.trim().length > 0 ? sep : '/';
  });

  computedHome = computed<BreadcrumbItem | undefined>(() => {
    const home = this.props().home;
    if (!home || home.label == null) return undefined;

    return {
      label: String(home.label),
      icon: home.icon ? String(home.icon) : undefined,
      outcomeRef: home.outcomeRef ? String(home.outcomeRef) : undefined,
      url: home.url ? String(home.url) : undefined,
      disabled: !!home.disabled,
    };
  });

  computedItems = computed<BreadcrumbItem[]>(() => {
    const items = this.props().items;
    if (!Array.isArray(items)) return [];

    return items
      .filter(item => item != null && item.label != null)
      .map(item => ({
        label: String(item.label),
        icon: item.icon ? String(item.icon) : undefined,
        outcomeRef: item.outcomeRef ? String(item.outcomeRef) : undefined,
        url: item.url ? String(item.url) : undefined,
        disabled: !!item.disabled,
      }));
  });

  onItemClick(event: Event, item: BreadcrumbItem, isLast: boolean) {
    if (isLast || item.disabled) {
      event.preventDefault();
      return;
    }

    if (!item.url) {
      event.preventDefault();
    }

    if (item.outcomeRef) {
      this.experienceAdapter.updateState(this.contract().id, 'activeOutcome', item.outcomeRef);
    }

    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'itemClick', item);
    }

    this.itemClick.emit(item);
  }
}
