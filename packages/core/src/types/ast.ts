import { Domain } from './domain';

export interface CanonicalAST {
  schemaVersion: string;
  domains: Domain[];
}
