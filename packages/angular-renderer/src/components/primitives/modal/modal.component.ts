import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  viewChild,
  ViewContainerRef,
  computed,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, ContainerComponent } from '../../../adapters/web/adapter';
import { DialogComponent, DialogProps, DialogContractSchema } from '../dialog/dialog.component';

export type ModalProps = DialogProps;
export const ModalContractSchema = DialogContractSchema;

@Component({
  selector: 'origo-modal',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-modal-host]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class ModalComponent implements OrigoAdapter<ModalProps>, ContainerComponent {
  static readonly contractSchema = ModalContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ModalProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });

  visibleChange = output<boolean>();
  open = output<void>();
  close = output<void>();
  maximize = output<boolean>();
  restore = output<void>();
  dragEnd = output<{ x: number; y: number }>();
  resizeEnd = output<{ width: number; height: number }>();

  coercedModalContract = computed(() => {
    const origContract = this.contract();
    return {
      ...origContract,
      props: {
        ...(origContract?.props ?? {}),
        modal: true, // Architectural invariant: modal is always strictly true
      },
    };
  });
}
