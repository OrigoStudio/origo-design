import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'origo-spike-shadow-trigger',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `
    <div
      class="clipped-boundary"
      style="overflow: hidden; max-height: 40px; position: relative; border: 1px dashed red;"
    >
      <button
        #triggerBtn
        id="spike-trigger-button"
        type="button"
        class="trigger-btn"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'dialog'"
        [attr.aria-controls]="overlayId"
        (click)="toggle()"
      >
        Toggle Shadow Overlay
      </button>

      <!-- Internal clipped element demonstrating local template clipping problem -->
      <div *ngIf="isOpen()" id="internal-clipped-panel" class="internal-dropdown">
        Internal clipped content (overflow: hidden will clip this if rendered in Shadow DOM)
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        contain: content;
      }
      .clipped-boundary {
        overflow: hidden;
        height: 38px;
        background: #fafafa;
      }
      .trigger-btn {
        padding-inline: 12px;
        padding-block: 8px;
        cursor: pointer;
      }
      .internal-dropdown {
        position: absolute;
        top: 40px;
        inset-inline-start: 0;
        width: 200px;
        height: 150px;
        background: yellow;
      }
    `,
  ],
})
export class SpikeShadowTriggerComponent {
  readonly isOpen = signal(false);
  readonly overlayId = 'origo-spike-overlay-panel';

  @ViewChild('triggerBtn', { static: true })
  triggerBtnRef!: ElementRef<HTMLButtonElement>;

  readonly destroyRef = inject(DestroyRef);

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
