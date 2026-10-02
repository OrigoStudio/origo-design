import { Component, inject } from '@angular/core';
import { PreviewService } from '../preview/preview.service';
import { BadlEditorComponent } from '../editor/badl-editor.component';
import { PreviewPaneComponent } from '../preview/preview-pane.component';
import { ORIGO_DOCS_URL } from './app.config';

@Component({
  standalone: true,
  imports: [BadlEditorComponent, PreviewPaneComponent],
  selector: 'origo-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected title = 'playground';
  protected docsUrl = inject(ORIGO_DOCS_URL) + '/reference/schemas/';
  private previewService = inject(PreviewService);

  public onContentChange(content: string) {
    this.previewService.onContentChange(content);
  }
}
