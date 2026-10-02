import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BadlEditorComponent } from '../editor/badl-editor.component';
import { vi } from 'vitest';
import { ORIGO_DOCS_URL } from './app.config';

vi.mock('monaco-editor', () => ({
  editor: {
    create: vi.fn().mockReturnValue({
      dispose: vi.fn(),
      onDidChangeModelContent: vi.fn(),
      setValue: vi.fn(),
      getValue: vi.fn(),
      getModel: vi.fn().mockReturnValue({ dispose: vi.fn() }),
      updateOptions: vi.fn(),
    }),
    createModel: vi.fn(),
    getModel: vi.fn().mockReturnValue(null),
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
      providers: [{ provide: ORIGO_DOCS_URL, useValue: 'https://test.docs.url' }],
    }).compileComponents();
  });

  it('should render the editor', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('origo-badl-editor')).toBeTruthy();
  });

  it('should render a help link with the configured docs URL', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a.help-link') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://test.docs.url/reference/schemas/');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
