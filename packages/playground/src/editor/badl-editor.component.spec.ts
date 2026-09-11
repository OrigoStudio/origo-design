import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadlEditorComponent } from './badl-editor.component';
import { NgZone, ComponentRef } from '@angular/core';
import { registerBadlSchema } from './schema-registry';
import { vi } from 'vitest';

vi.mock('./schema-registry', () => ({
  registerBadlSchema: vi.fn(),
}));

// Mock monaco editor create and dispose
const mockDispose = vi.fn();
const mockOnDidChangeModelContent = vi.fn();
const mockSetValue = vi.fn();
const mockGetValue = vi.fn().mockReturnValue('{}');
const mockGetModel = vi.fn().mockReturnValue({
  getValue: mockGetValue,
  setValue: mockSetValue,
});
const mockCreate = vi.fn().mockReturnValue({
  dispose: mockDispose,
  onDidChangeModelContent: mockOnDidChangeModelContent,
  setValue: mockSetValue,
  getValue: mockGetValue,
  getModel: mockGetModel,
});
const mockCreateModel = vi.fn().mockReturnValue({});

vi.mock('monaco-editor', () => ({
  editor: {
    create: (...args: unknown[]) => mockCreate(...args),
    createModel: (...args: unknown[]) => mockCreateModel(...args),
  },
  Uri: {
    parse: vi.fn().mockReturnValue('parsed-uri'),
  },
}));

describe('BadlEditorComponent', () => {
  let component: BadlEditorComponent;
  let fixture: ComponentFixture<BadlEditorComponent>;
  let componentRef: ComponentRef<BadlEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadlEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadlEditorComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // reset mocks
    vi.clearAllMocks();
    localStorage.removeItem('origo_playground_draft');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize monaco editor outside Angular zone', () => {
    const ngZone = TestBed.inject(NgZone);
    const runOutsideAngularSpy = vi.spyOn(ngZone, 'runOutsideAngular');

    componentRef.setInput('initialValue', '{}');
    fixture.detectChanges();

    expect(registerBadlSchema).toHaveBeenCalled();
    expect(runOutsideAngularSpy).toHaveBeenCalled();

    // Wait for the view init to complete
    expect(mockCreate).toHaveBeenCalled();
    expect(mockCreateModel).toHaveBeenCalledWith('{}', 'json', 'parsed-uri');
    const createArgs = mockCreate.mock.calls[0];
    expect(createArgs[1]).toEqual(
      expect.objectContaining({
        model: {},
        automaticLayout: true,
        minimap: { enabled: false },
      })
    );
  });

  it('should dispose editor on destroy', () => {
    fixture.detectChanges(); // trigger view init
    expect(mockCreate).toHaveBeenCalled();

    component.ngOnDestroy();

    expect(mockDispose).toHaveBeenCalled();
  });

  describe('State Persistence', () => {
    it('should initialize with localStorage draft if valid', () => {
      localStorage.setItem('origo_playground_draft', JSON.stringify({ valid: 'json' }));
      componentRef.setInput('initialValue', '{}');
      fixture.detectChanges();

      expect(mockCreateModel).toHaveBeenCalledWith('{"valid":"json"}', 'json', 'parsed-uri');
    });

    it('should fallback to initialValue if localStorage has invalid JSON', () => {
      localStorage.setItem('origo_playground_draft', 'invalid-json');
      componentRef.setInput('initialValue', '{}');
      fixture.detectChanges();

      expect(mockCreateModel).toHaveBeenCalledWith('{}', 'json', 'parsed-uri');
    });

    it('should fallback to initialValue if localStorage access throws SecurityError', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('SecurityError', 'SecurityError');
      });
      componentRef.setInput('initialValue', '{}');
      fixture.detectChanges();

      expect(mockCreateModel).toHaveBeenCalledWith('{}', 'json', 'parsed-uri');
      getItemSpy.mockRestore();
    });

    it('should debounce saving to localStorage', async () => {
      vi.useFakeTimers();
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      try {
        componentRef.setInput('initialValue', '{}');
        fixture.detectChanges();

        // Simulate editor content change
        mockGetValue.mockReturnValue('{"new":"content"}');
        const calls = mockOnDidChangeModelContent.mock.calls;
        const changeCallback = calls[calls.length - 1][0];
        changeCallback();
        fixture.detectChanges();
        TestBed.flushEffects();

        // Timer is 500ms
        await vi.advanceTimersByTimeAsync(100);
        expect(setItemSpy).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(400); // Total 500
        expect(setItemSpy).toHaveBeenCalledWith('origo_playground_draft', '{"new":"content"}');
      } finally {
        setItemSpy.mockRestore();
        vi.useRealTimers();
      }
    });

    it('should gracefully handle QuotaExceededError and SecurityError when saving to localStorage', async () => {
      vi.useFakeTimers();
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });
      try {
        componentRef.setInput('initialValue', '{}');
        fixture.detectChanges();

        mockGetValue.mockReturnValue('{"new":"content"}');
        const calls = mockOnDidChangeModelContent.mock.calls;
        const changeCallback = calls[calls.length - 1][0];
        changeCallback();
        fixture.detectChanges();
        TestBed.flushEffects();

        await vi.advanceTimersByTimeAsync(500);
        expect(setItemSpy).toHaveBeenCalled();
        // Should not throw unhandled promise rejection or crash
      } finally {
        setItemSpy.mockRestore();
        vi.useRealTimers();
      }
    });
  });
});
