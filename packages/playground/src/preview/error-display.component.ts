import { Component, inject } from '@angular/core';
import { PreviewService } from './preview.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'origo-playground-error-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-display.component.html',
  styleUrl: './error-display.component.scss',
})
export class ErrorDisplayComponent {
  public previewService = inject(PreviewService);
}
