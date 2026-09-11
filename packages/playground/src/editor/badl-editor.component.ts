import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  input,
  output,
  NgZone,
  inject,
  signal,
  effect,
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
  // Note: initialValue() signal read outside Angular zone in ngAfterViewInit is intentionally non-reactive
  // as it is only used for the initial model creation.
  readonly theme = input<string>('vs-dark');
  readonly readOnly = input<boolean>(false);
  readonly editorContentChange = output<string>();

  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private zone = inject(NgZone);
  private editorContent = signal<string>('');

  constructor() {
    effect(onCleanup => {
      const content = this.editorContent();
      if (content === null || content === undefined) return; // Allow empty string for cleared editor

      const timer = setTimeout(() => {
        try {
          localStorage.setItem('origo_playground_draft', content);
        } catch (e) {
          console.warn('Could not save draft to local storage (Quota or Security Error)', e);
        }
      }, 500);

      onCleanup(() => clearTimeout(timer));
    });

    effect(() => {
      const theme = this.theme();
      const readOnly = this.readOnly();
      this.zone.runOutsideAngular(() => {
        this.editor?.updateOptions({ theme, readOnly });
      });
    });
  }

  ngAfterViewInit(): void {
    registerBadlSchema();
    this.zone.runOutsideAngular(() => {
      if (!this.editorContainer?.nativeElement) return;
      try {
        // Fallback to empty valid JSON object
        let savedState = this.initialValue() || '{}';
        try {
          const draft = localStorage.getItem('origo_playground_draft');
          if (draft) {
            // Validate it's a valid JSON object to prevent crash loops
            const parsed = JSON.parse(draft);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              savedState = JSON.stringify(parsed);
            }
          }
        } catch (e) {
          console.warn('Could not restore playground draft, falling back to initialValue', e);
        }

        this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
          model: monaco.editor.createModel(
            savedState,
            'json',
            monaco.Uri.parse('inmemory://model/domain.json')
          ),
          theme: this.theme(),
          readOnly: this.readOnly(),
          automaticLayout: true, // Required for split-pane resize in Story 7.2
          minimap: { enabled: false },
        });

        // Initial compilation trigger
        this.editorContentChange.emit(savedState);

        // Apply initial values to satisfy patch #1 (redundant but requested)
        this.editor.updateOptions({ theme: this.theme(), readOnly: this.readOnly() });

        this.editor.onDidChangeModelContent(() => {
          if (!this.editor) return; // Guard against disposed editor
          const val = this.editor.getModel()?.getValue();
          if (val !== undefined) {
            this.zone.run(() => this.editorContent.set(val));
            this.editorContentChange.emit(val);
          }
        });
      } catch (e) {
        console.error('Failed to initialize Monaco Editor', e);
      }
    });
  }

  loadSample(): void {
    if (this.editor) {
      const sample = {
        id: 'dom-identity',
        name: 'Identity Management',
        version: '1.0.0',
        domain: 'core',
        entities: [
          {
            id: 'ent-user',
            name: 'User',
            fields: [
              {
                id: 'fld-user-id',
                name: 'id',
                type: 'string',
                label: 'User ID',
                validation: ['required', 'uuid'],
                metadata_path: '/user/id',
              },
              {
                id: 'fld-user-username',
                name: 'username',
                type: 'string',
                label: 'Username',
                validation: ['required', 'min:3', 'max:50'],
                metadata_path: '/user/username',
              },
              {
                id: 'fld-user-email',
                name: 'email',
                type: 'string',
                label: 'Email Address',
                validation: ['required', 'email'],
                metadata_path: '/user/email',
              },
              {
                id: 'fld-user-roleId',
                name: 'roleId',
                type: 'string',
                label: 'Assigned Role',
                references: 'ent-role',
                validation: ['required'],
                metadata_path: '/user/roleId',
              },
            ],
          },
          {
            id: 'ent-role',
            name: 'Role',
            fields: [
              {
                id: 'fld-role-id',
                name: 'id',
                type: 'string',
                label: 'Role ID',
                validation: ['required', 'uuid'],
                metadata_path: '/role/id',
              },
              {
                id: 'fld-role-name',
                name: 'name',
                type: 'string',
                label: 'Role Name',
                validation: ['required'],
                metadata_path: '/role/name',
              },
              {
                id: 'fld-role-permissions',
                name: 'permissions',
                type: 'array',
                itemType: 'string',
                label: 'Permissions List',
                validation: [],
                metadata_path: '/role/permissions',
              },
            ],
          },
        ],
      };

      const formatted = JSON.stringify(sample, null, 2);
      this.editor.setValue(formatted);
      // The onDidChangeModelContent will trigger preview compilation automatically
    }
  }

  ngOnDestroy(): void {
    this.editor?.dispose(); // CRITICAL — prevents Monaco timer memory leak
    this.editor = null;
  }
}
