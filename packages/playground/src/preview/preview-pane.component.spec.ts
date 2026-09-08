import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewPaneComponent } from './preview-pane.component';
import { PreviewService } from './preview.service';
import { signal } from '@angular/core';
import { CanonicalAST } from '@origo/core';
import { Component } from '@angular/core';
import { ErrorDisplayComponent } from './error-display.component';

// Mock ErrorDisplayComponent to avoid rendering it
@Component({
  selector: 'origo-playground-error-display',
  standalone: true,
  template: '<div></div>',
})
class MockErrorDisplayComponent {}

describe('PreviewPaneComponent', () => {
  let component: PreviewPaneComponent;
  let fixture: ComponentFixture<PreviewPaneComponent>;
  let mockPreviewService: any;
  let mockAstSignal: any;

  beforeEach(async () => {
    mockAstSignal = signal<CanonicalAST | null>(null);
    mockPreviewService = {
      compiledAstSignal: mockAstSignal,
      compilationErrorsSignal: signal([]),
    };

    await TestBed.configureTestingModule({
      imports: [PreviewPaneComponent],
      providers: [{ provide: PreviewService, useValue: mockPreviewService }],
    })
      .overrideComponent(PreviewPaneComponent, {
        remove: { imports: [ErrorDisplayComponent] },
        add: { imports: [MockErrorDisplayComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PreviewPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
