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

export interface VBoxProps {
  gap?: number | string;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  padding?: number | string;
}

@Component({
  selector: 'origo-vbox',
  standalone: true,
  templateUrl: './vbox.component.html',
  styleUrls: ['./vbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-vbox]': 'true',
    '[style.gap]': 'computedGap()',
    '[style.align-items]': 'computedAlignment()',
    '[style.padding]': 'computedPadding()',
  },
})
export class VBoxComponent implements OrigoAdapter<VBoxProps>, ContainerComponent {
  static readonly contractSchema = {
    gap: 'string',
    alignment: 'string',
    padding: 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<VBoxProps>>();

  vc = viewChild.required('vc', { read: ViewContainerRef });

  computedGap = computed(() => {
    const gap = this.contract().props?.gap;
    if (gap === undefined || gap === null || gap === '') return undefined;
    const num = Number(gap);
    return !isNaN(num) ? `${num}px` : String(gap);
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
    return !isNaN(num) ? `${num}px` : String(padding);
  });
}
