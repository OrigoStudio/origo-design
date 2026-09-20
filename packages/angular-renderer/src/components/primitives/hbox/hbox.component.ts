import {
  Component,
  input,
  viewChild,
  ViewContainerRef,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
} from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter, ContainerComponent } from '../../../adapters/web/adapter';

export interface HBoxProps {
  gap?: number | string;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  padding?: number | string;
}

@Component({
  selector: 'origo-hbox',
  standalone: true,
  templateUrl: './hbox.component.html',
  styleUrls: ['./hbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-hbox]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[style.gap]': 'computedGap()',
    '[style.align-items]': 'computedAlignment()',
    '[style.padding-inline]': 'computedPadding()',
    '[style.padding-block]': 'computedPadding()',
  },
})
export class HBoxComponent implements OrigoAdapter<HBoxProps>, ContainerComponent {
  static readonly contractSchema = {
    gap: 'string',
    alignment: 'string',
    padding: 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<HBoxProps>>();

  vc = viewChild.required('vc', { read: ViewContainerRef });

  computedGap = computed(() => {
    const gap = this.contract().props?.gap;
    if (gap === undefined || gap === null || gap === '') return undefined;
    const num = Number(gap);
    if (!isNaN(num)) return `${num}px`;
    const str = String(gap);
    return /^[0-9.]+(px|em|rem|%|vh|vw)$/.test(str) || str.startsWith('var(') ? str : undefined;
  });

  computedAlignment = computed(() => {
    const align = this.contract().props?.alignment;
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      case 'center':
        return 'center';
      case 'stretch':
        return 'stretch';
      default:
        return 'stretch';
    }
  });

  computedPadding = computed(() => {
    const padding = this.contract().props?.padding;
    if (padding === undefined || padding === null || padding === '') return undefined;
    const num = Number(padding);
    if (!isNaN(num)) return `${num}px`;
    const str = String(padding);
    return /^[0-9.]+(px|em|rem|%|vh|vw)$/.test(str) || str.startsWith('var(') ? str : undefined;
  });
}
