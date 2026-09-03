import { Component } from '@angular/core';
import { BadlEditorComponent } from '../editor/badl-editor.component';

@Component({
  standalone: true,
  imports: [BadlEditorComponent],
  selector: 'origo-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected title = 'playground';
}
