import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, viewChild, ViewContainerRef } from '@angular/core';
import { OrigoRendererComponent } from './renderer.component';
import { ASTNode, InteractionContract } from '@origo/core';
import { RENDERER_REGISTRY } from './renderer.tokens';
import { OrigoAdapter } from '../adapters/web/adapter';

@Component({
  selector: 'test-text-primitive',
  standalone: true,
  template: `<span>{{ contract().props?.['text'] }}</span>`,
})
class TestTextPrimitive implements OrigoAdapter {
  contract = input.required<InteractionContract>();
}

@Component({
  selector: 'test-container-primitive',
  standalone: true,
  template: `<div class="container"><ng-container #vc></ng-container></div>`,
})
class TestContainerPrimitive implements OrigoAdapter {
  contract = input.required<InteractionContract>();
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
    // Create a massive AST
    const children: ASTNode[] = [];
    for (let i = 0; i < 250; i++) {
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
    // Before waiting, only a portion should be rendered (chunking)
    const initialSpans = compiled.querySelectorAll('span').length;
    expect(initialSpans).toBeLessThan(250);

    // Wait for the event loop to process all chunks
    let retries = 50;
    while (compiled.querySelectorAll('span').length < 250 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 20));
      fixture.detectChanges();
      retries--;
    }

    // Now all should be rendered
    const finalSpans = compiled.querySelectorAll('span').length;
    expect(finalSpans).toBe(250);
  }, 10000);

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
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
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
    expect(warnSpy).toHaveBeenCalledWith('No primitive found for node type: UnknownType');
    warnSpy.mockRestore();
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
