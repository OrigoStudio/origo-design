import { Component } from '@angular/core';
import { BadlEditorComponent } from '../editor/badl-editor.component';
import { PreviewPaneComponent } from '../preview/preview-pane.component';
import { PreviewRootComponent } from '../preview/preview-root.component';

@Component({
  standalone: true,
  imports: [BadlEditorComponent, PreviewPaneComponent, PreviewRootComponent],
  selector: 'origo-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected title = 'playground';
  protected isPreview = window.location.search.includes('preview=true');
}
