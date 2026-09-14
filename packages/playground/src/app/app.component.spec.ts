import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BadlEditorComponent } from '../editor/badl-editor.component';
import { vi } from 'vitest';

vi.mock('monaco-editor', () => ({
  editor: {
    create: vi.fn().mockReturnValue({
      dispose: vi.fn(),
      onDidChangeModelContent: vi.fn(),
      setValue: vi.fn(),
      getValue: vi.fn(),
    }),
    createModel: vi.fn(),
  },
  Uri: { parse: vi.fn() },
  languages: {
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: vi.fn(),
      },
    },
  },
}));

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, BadlEditorComponent],
    }).compileComponents();
  });

  it('should render the editor', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('origo-badl-editor')).toBeTruthy();
  });
});
