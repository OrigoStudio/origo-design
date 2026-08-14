import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, viewChild, ViewContainerRef } from '@angular/core';
import { OrigoRendererComponent } from './renderer.component';
import { ASTNode } from '@origo/core';
import { RENDERER_REGISTRY } from './renderer.tokens';

@Component({
  selector: 'test-text-primitive',
  standalone: true,
  template: `<span>{{ node().props?.['text'] }}</span>`,
})
class TestTextPrimitive {
  node = input.required<ASTNode>();
}

@Component({
  selector: 'test-container-primitive',
  standalone: true,
  template: `<div class="container"><ng-container #vc></ng-container></div>`,
})
class TestContainerPrimitive {
  node = input.required<ASTNode>();
  vc = viewChild.required('vc', { read: ViewContainerRef });
}

describe('OrigoRendererComponent', () => {
  let component: OrigoRendererComponent;
  let fixture: ComponentFixture<OrigoRendererComponent>;

  const mockRegistry = new Map<string, unknown>([
    ['Text', TestTextPrimitive],
    ['Container', TestContainerPrimitive],
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrigoRendererComponent],
      providers: [{ provide: RENDERER_REGISTRY, useValue: mockRegistry }],
    }).compileComponents();

    fixture = TestBed.createComponent(OrigoRendererComponent);
    component = fixture.componentInstance;
  });

  it('should create the renderer', () => {
    expect(component).toBeTruthy();
  });

  it('should render a simple primitive node', () => {
    fixture.componentRef.setInput('node', {
      id: '1',
      type: 'Text',
      props: { text: 'Hello World' },
    } as ASTNode);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('span')?.textContent).toBe('Hello World');
  });

  it('should render nested nodes recursively', () => {
    fixture.componentRef.setInput('node', {
      id: 'container-1',
      type: 'Container',
      children: [
        {
          id: 'text-1',
          type: 'Text',
          props: { text: 'Child 1' },
        },
        {
          id: 'text-2',
          type: 'Text',
          props: { text: 'Child 2' },
        },
      ],
    } as ASTNode);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const spans = compiled.querySelectorAll('span');
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('Child 1');
    expect(spans[1].textContent).toBe('Child 2');
  });

  it('should chunk render a massive AST to prevent blocking the main thread', async () => {
    jest.useFakeTimers();
    // Create a massive AST
    const children: ASTNode[] = [];
    for (let i = 0; i < 2000; i++) {
      children.push({
        id: `text-${i}`,
        type: 'Text',
        props: { text: `Item ${i}` },
      });
    }

    const massiveAST: ASTNode = {
      id: 'root-container',
      type: 'Container',
      children,
    };

    fixture.componentRef.setInput('node', massiveAST);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // Before ticking, only a portion should be rendered (chunking)
    const initialSpans = compiled.querySelectorAll('span').length;
    expect(initialSpans).toBeLessThan(2000);

    // Fast forward time to process all chunks
    await jest.advanceTimersByTimeAsync(5000);
    fixture.detectChanges();

    // Now all should be rendered
    const finalSpans = compiled.querySelectorAll('span').length;
    expect(finalSpans).toBe(2000);

    jest.useRealTimers();
  });

  it('should ignore circular child references to prevent infinite loops', () => {
    const nodeA: ASTNode = { id: 'A', type: 'Container', children: [] };
    const nodeB: ASTNode = { id: 'B', type: 'Container', children: [nodeA] };
    if (nodeA.children) {
      nodeA.children.push(nodeB); // Circular ref
    }

    fixture.componentRef.setInput('node', nodeA);
    fixture.detectChanges();

    // Should not throw or timeout
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });

  it('should fallback to parent view container for unregistered node types', () => {
    fixture.componentRef.setInput('node', {
      id: 'container-1',
      type: 'Container',
      children: [
        {
          id: 'unknown-1',
          type: 'UnknownType', // Not in registry
          children: [
            {
              id: 'text-1',
              type: 'Text',
              props: { text: 'Fallback Child' },
            },
          ],
        },
      ],
    } as ASTNode);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // The fallback child should still render inside the parent container
    const span = compiled.querySelector('span');
    expect(span?.textContent).toBe('Fallback Child');
  });

  it('should pass nodes through the adapter pipeline', () => {
    fixture.componentRef.setInput('node', {
      id: 'text-1',
      type: 'Text',
      props: { text: 'Adapter Test' },
    } as ASTNode);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // It should render properly using the coerced properties from prepareNode
    expect(compiled.querySelector('span')?.textContent).toBe('Adapter Test');
  });
});
