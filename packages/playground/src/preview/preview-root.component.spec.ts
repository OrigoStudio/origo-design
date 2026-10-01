import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewRootComponent } from './preview-root.component';
import { Component, Input, provideZonelessChangeDetection } from '@angular/core';
import { OrigoRendererComponent, WebExperienceAdapterService } from '@origostudio/angular-renderer';
import { vi } from 'vitest';

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
  let mockExperienceService: { getState: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockExperienceService = {
      getState: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PreviewRootComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceService },
      ],
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

  it('should contain DataGrid for entities when activeOutcome is entities', () => {
    mockExperienceService.getState.mockImplementation((store: string, key: string) => {
      if (store === 'main-sidebar' && key === 'activeOutcome') return 'entities';
      return null;
    });

    component.ast.set({
      domains: [
        {
          name: 'TestDomain',
          entities: [
            { name: 'User', fields: [] },
            { name: 'Account', fields: [{ name: 'id' }] },
          ],
          capabilities: [],
        },
      ],
    } as unknown as CanonicalAST);

    const node = component.uiNode();
    expect(node).toBeTruthy();
    const contentVBox = node?.children?.find((c: any) => c.id === 'content-vbox');
    const entityGrid = contentVBox?.children?.find((c: any) => c.id === 'entity-grid');
    expect(entityGrid).toBeDefined();
    expect(entityGrid.type).toBe('DataGrid');
    expect(entityGrid.props.columns).toEqual([
      { key: 'name', label: 'Entity Name' },
      { key: 'fieldCount', label: 'Fields' },
    ]);
    expect(entityGrid.props.rows.length).toBe(2);
    expect(entityGrid.props.rows[0].name).toBe('User');
    expect(entityGrid.props.rows[0].fieldCount).toBe(0);
    expect(entityGrid.props.rows[1].name).toBe('Account');
    expect(entityGrid.props.rows[1].fieldCount).toBe(1);
  });

  it('should contain DataGrid/List or Card for capabilities when activeOutcome is capabilities', () => {
    mockExperienceService.getState.mockImplementation((store: string, key: string) => {
      if (store === 'main-sidebar' && key === 'activeOutcome') return 'capabilities';
      return null;
    });

    component.ast.set({
      domains: [
        {
          name: 'TestDomain',
          entities: [],
          capabilities: [{ name: 'Cap1' }],
        },
      ],
    } as unknown as CanonicalAST);

    const node = component.uiNode();
    const contentVBox = node?.children?.find((c: any) => c.id === 'content-vbox');
    const capabilitiesList = contentVBox?.children?.find((c: any) => c.id === 'capabilities-list');
    expect(capabilitiesList).toBeDefined();
    expect(capabilitiesList.type).toBe('DataGrid');
  });

  it('should not throw and should render Card when capabilities is empty', () => {
    mockExperienceService.getState.mockImplementation((store: string, key: string) => {
      if (store === 'main-sidebar' && key === 'activeOutcome') return 'capabilities';
      return null;
    });

    // Domain has no capabilities
    component.ast.set({
      domains: [
        {
          name: 'TestDomain',
          entities: [],
        },
      ],
    } as unknown as CanonicalAST);

    const node = component.uiNode();
    const contentVBox = node?.children?.find((c: any) => c.id === 'content-vbox');
    const capabilitiesCard = contentVBox?.children?.find((c: any) => c.id === 'capabilities-card');
    expect(capabilitiesCard).toBeDefined();
    expect(capabilitiesCard.type).toBe('Card');
  });

  it('should render Domain Configuration form when activeOutcome is home or unknown', () => {
    mockExperienceService.getState.mockImplementation((store: string, key: string) => {
      if (store === 'main-sidebar' && key === 'activeOutcome') return 'unknown-state';
      return null;
    });

    component.ast.set({
      domains: [
        {
          name: 'TestDomain',
          entities: [],
          capabilities: [],
        },
      ],
    } as unknown as CanonicalAST);

    const node = component.uiNode();
    const contentVBox = node?.children?.find((c: any) => c.id === 'content-vbox');
    const entityCard = contentVBox?.children?.find((c: any) => c.id === 'entity-card');
    const formVBox = contentVBox?.children?.find((c: any) => c.id === 'form-vbox');

    expect(entityCard).toBeDefined();
    expect(entityCard.props.title).toBe('Domain Configuration');
    expect(formVBox).toBeDefined();
    expect(formVBox.children.length).toBeGreaterThan(0);
  });
});
