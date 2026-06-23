let nextFormulaNodeId = 1;

export function createFormulaNodeId(prefix = 'fx'): string {
  const value = nextFormulaNodeId;
  nextFormulaNodeId += 1;
  return `${prefix}-${value}`;
}

export function resetFormulaNodeIdsForTests(): void {
  nextFormulaNodeId = 1;
}
