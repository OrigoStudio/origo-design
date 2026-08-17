import { Domain } from './domain';

export interface CanonicalAST {
  schemaVersion: string;
  domains: Domain[];
}

export interface ASTNode {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ASTNode[];
}

export interface InteractionContract<TProps = Record<string, unknown>> {
  id: string;
  type: string;
  props: TProps;
  children?: InteractionContract[];
}
