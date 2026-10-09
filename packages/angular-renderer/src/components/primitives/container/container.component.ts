import { Component, input, viewChild, ViewContainerRef, computed } from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';

export interface ContainerProps {
  fluid?: boolean;
  maxWidth?: string;
  padding?: string | number;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const contractSchema: Record<
  keyof ContainerProps,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  fluid: 'boolean',
  maxWidth: 'string',
  padding: 'string',
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
};

@Component({
  selector: 'origo-container',
  standalone: true,
  templateUrl: './container.component.html',
  styleUrl: './container.component.scss',
})
export class ContainerComponent implements OrigoAdapter<ContainerProps>, IContainerComponent {
  contract = input.required<InteractionContract<ContainerProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  protected props = computed(() =>
    coerceContractProps<ContainerProps>(this.contract().props, contractSchema)
  );

  protected get paddingValue(): string {
    const p = this.props().padding;
    if (typeof p === 'number') return `${p}px`;
    return (p as string) || '';
  }
}
