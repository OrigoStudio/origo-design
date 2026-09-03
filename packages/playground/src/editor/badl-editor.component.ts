import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  input,
  NgZone,
  inject,
} from '@angular/core';
import * as monaco from 'monaco-editor';
import './monaco-environment'; // MUST be first monaco import — side-effect only
import { registerBadlSchema } from './schema-registry';

@Component({
  selector: 'origo-badl-editor',
  standalone: true,
  templateUrl: './badl-editor.component.html',
  styleUrls: ['./badl-editor.component.scss'],
})
export class BadlEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef<HTMLDivElement>;

  readonly initialValue = input<string>('');
  readonly theme = input<string>('vs-dark');
  readonly readOnly = input<boolean>(false);

  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private zone = inject(NgZone);

  ngAfterViewInit(): void {
    registerBadlSchema();
    this.zone.runOutsideAngular(() => {
      if (!this.editorContainer?.nativeElement) return;
      try {
        this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
          model: monaco.editor.createModel(
            this.initialValue(),
            'json',
            monaco.Uri.parse('inmemory://model/domain.json')
          ),
          theme: this.theme(),
          readOnly: this.readOnly(),
          automaticLayout: true, // Required for split-pane resize in Story 7.2
          minimap: { enabled: false },
        });
      } catch (e) {
        console.error('Failed to initialize Monaco Editor', e);
      }
    });
  }

  ngOnDestroy(): void {
    this.editor?.dispose(); // CRITICAL — prevents Monaco timer memory leak
    this.editor = null;
  }
}
