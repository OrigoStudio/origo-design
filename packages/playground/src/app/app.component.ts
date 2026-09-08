import { Component, inject } from '@angular/core';
import { PreviewService } from '../preview/preview.service';
import { BadlEditorComponent } from '../editor/badl-editor.component';
import { PreviewPaneComponent } from '../preview/preview-pane.component';

@Component({
  standalone: true,
  imports: [BadlEditorComponent, PreviewPaneComponent],
  selector: 'origo-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected title = 'playground';
  private previewService = inject(PreviewService);

  public onContentChange(content: string) {
    this.previewService.onContentChange(content);
  }
}
