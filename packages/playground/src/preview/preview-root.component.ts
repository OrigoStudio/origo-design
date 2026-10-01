import { Component, HostListener, signal, computed, inject } from '@angular/core';
import { CanonicalAST, ASTNode } from '@origostudio/core';
import { CommonModule } from '@angular/common';
import { OrigoRendererComponent, WebExperienceAdapterService } from '@origostudio/angular-renderer';

@Component({
  selector: 'origo-root',
  standalone: true,
  imports: [CommonModule, OrigoRendererComponent],
  template: `
    @if (ast(); as validAst) {
      @if (uiNode(); as node) {
        <origo-renderer [node]="node" />
      }
    } @else {
      <div class="empty-state">Waiting for compilation...</div>
    }
  `,
  styleUrl: './preview-root.component.scss',
})
export class PreviewRootComponent {
  public ast = signal<CanonicalAST | null>(null);
  private experience = inject(WebExperienceAdapterService);

  public uiNode = computed<ASTNode | null>(() => {
    const data = this.ast();
    if (!data || !data.domains || data.domains.length === 0) return null;

    const domain = data.domains[0];
    const entities = domain.entities || [];
    const capabilities = domain.capabilities || [];

    const activeOutcome =
      (this.experience.getState('main-sidebar', 'activeOutcome') as string) || 'home';
    const activeTab = (this.experience.getState('tabs', 'activeTab') as string) || 'overview';

    let contentChildren: ASTNode[] = [];

    if (activeOutcome === 'entities') {
      contentChildren = entities.length
        ? [
            {
              id: 'entity-grid',
              type: 'DataGrid',
              props: {
                'aria-label': 'Entities Grid',
                columns: [
                  { key: 'name', label: 'Entity Name' },
                  { key: 'fieldCount', label: 'Fields' },
                ],
                rows: entities.map(e => ({
                  name: e?.name ?? '-',
                  fieldCount: e?.fields?.length ?? 0,
                })),
              },
            },
          ]
        : [
            {
              id: 'entities-card',
              type: 'Card',
              props: {
                title: 'No Entities',
                subtitle: 'No entities are defined for this domain.',
              },
            },
          ];
    } else if (activeOutcome === 'capabilities') {
      contentChildren = capabilities.length
        ? [
            {
              id: 'capabilities-list',
              type: 'DataGrid',
              props: {
                'aria-label': 'Capabilities',
                columns: [{ key: 'name', label: 'Capability Name' }],
                rows: capabilities.map(c => ({ name: c?.name || '-' })),
              },
            },
          ]
        : [
            {
              id: 'capabilities-card',
              type: 'Card',
              props: {
                title: 'No Capabilities',
                subtitle: 'No capabilities are defined for this domain.',
              },
            },
          ];
    } else {
      contentChildren = [
        {
          id: 'entity-card',
          type: 'Card',
          props: {
            title: 'Domain Configuration',
            subtitle: 'Manage core settings for this domain',
          },
        },
        {
          id: 'form-vbox',
          type: 'vbox',
          props: { gap: '15px' },
          children: [
            {
              id: 'form-hbox',
              type: 'HBox',
              props: { gap: '15px' },
              children: [
                {
                  id: 'ff-status',
                  type: 'FormField',
                  props: { label: 'Status' },
                  children: [{ id: 'switch-status', type: 'Switch', props: { checked: true } }],
                },
                {
                  id: 'ff-version',
                  type: 'FormField',
                  props: { label: 'Version' },
                  children: [
                    {
                      id: 'chip-version',
                      type: 'Chip',
                      props: { text: domain.version || '1.0' },
                    },
                  ],
                },
              ],
            },
            {
              id: 'ff-desc',
              type: 'FormField',
              props: { label: 'Description' },
              children: [
                {
                  id: 'textarea-desc',
                  type: 'Textarea',
                  props: { placeholder: 'Enter description' },
                },
              ],
            },
            {
              id: 'ff-type',
              type: 'FormField',
              props: { label: 'Type' },
              children: [
                {
                  id: 'select-type',
                  type: 'Select',
                  props: {
                    options: [
                      { value: 'core', label: 'Core' },
                      { value: 'plugin', label: 'Plugin' },
                    ],
                  },
                },
              ],
            },
            {
              id: 'ff-radio',
              type: 'FormField',
              props: { label: 'Environment' },
              children: [
                {
                  id: 'radio-env',
                  type: 'RadioGroup',
                  props: {
                    options: [
                      { value: 'dev', label: 'Development' },
                      { value: 'prod', label: 'Production' },
                    ],
                  },
                },
              ],
            },
            {
              id: 'ff-check',
              type: 'FormField',
              props: { label: 'Enable Validation' },
              children: [
                {
                  id: 'check-val',
                  type: 'Checkbox',
                  props: { checked: true, label: 'Strict mode' },
                },
              ],
            },
          ],
        },
      ];
    }

    return {
      id: 'root-hbox',
      type: 'HBox',
      props: { gap: '0', alignment: 'stretch' },
      children: [
        {
          id: 'main-sidebar',
          type: 'Sidebar',
          props: {
            'aria-label': 'Main Navigation',
            activeOutcome: activeOutcome,
            items: [
              { key: 'nav-1', label: domain.name || 'Domain', outcomeRef: 'home' },
              { key: 'nav-2', label: 'Entities', outcomeRef: 'entities' },
              { key: 'nav-3', label: 'Capabilities', outcomeRef: 'capabilities' },
            ],
          },
        },
        {
          id: 'content-vbox',
          type: 'vbox',
          props: { padding: '20px', gap: '20px', flex: 1 },
          children: [
            {
              id: 'breadcrumbs',
              type: 'Breadcrumbs',
              props: {
                items: [
                  { label: 'Home', outcomeRef: 'home' },
                  { label: domain.domain || 'Domain', outcomeRef: 'domain' },
                ],
              },
            },
            {
              id: 'tabs',
              type: 'Tabs',
              props: {
                activeTab: activeTab,
                tabs: [
                  { key: 'overview', label: 'Overview' },
                  { key: 'settings', label: 'Settings' },
                ],
              },
            },
            ...contentChildren,
          ],
        },
      ],
    };
  });

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) {
      return;
    }
    if (event.data?.type === 'RENDER_AST') {
      this.ast.set(event.data.ast);
    }
  }
}
