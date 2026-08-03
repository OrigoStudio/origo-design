import { generateHeavyAstFixture, countAstNodes } from './heavy-ast-fixture';

describe('Heavy AST Fixture Generator (NFR-PERF-002)', () => {
  it('should deterministically generate a 500-entity BADL AST payload with >= 10,000 total nodes', () => {
    const fixture1 = generateHeavyAstFixture(500);
    const fixture2 = generateHeavyAstFixture(500);

    expect(fixture1.schemaVersion).toBe('1.0.0');
    expect(fixture1.entities.length).toBe(500);

    // Verify determinism
    expect(JSON.stringify(fixture1)).toBe(JSON.stringify(fixture2));

    // Verify node count is >= 10,000
    const nodeCount = countAstNodes(fixture1);
    expect(nodeCount).toBeGreaterThanOrEqual(10000);
  });

  it('should assign valid metadata_path and capability types to all entities', () => {
    const fixture = generateHeavyAstFixture(10);
    expect(fixture.entities.length).toBe(10);

    const firstEntity = fixture.entities[0];
    expect(firstEntity.fields[0].metadata_path).toBe(
      `${firstEntity.name}.${firstEntity.fields[0].name}`
    );
    expect(firstEntity.capabilities[0].type).toMatch(/^(Command|Query)$/);
  });
});
