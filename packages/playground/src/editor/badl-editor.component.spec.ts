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
const mockCreate = vi.fn().mockReturnValue({
  dispose: mockDispose,
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
});
