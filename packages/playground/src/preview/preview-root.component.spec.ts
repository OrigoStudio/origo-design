import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewRootComponent } from './preview-root.component';
import { Component, Input } from '@angular/core';
import { OrigoRendererComponent } from '@origo/angular-renderer';

// Mock OrigoRendererComponent to avoid needing to provide all its dependencies
@Component({
  selector: 'origo-renderer',
  standalone: true,
  template: '<div>Mock Renderer</div>',
})
class MockOrigoRendererComponent {
  @Input() node: any;
}

describe('PreviewRootComponent', () => {
  let component: PreviewRootComponent;
  let fixture: ComponentFixture<PreviewRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewRootComponent],
    })
      .overrideComponent(PreviewRootComponent, {
        remove: { imports: [OrigoRendererComponent] },
        add: { imports: [MockOrigoRendererComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PreviewRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null ast', () => {
    expect(component.ast()).toBeNull();
  });
});
