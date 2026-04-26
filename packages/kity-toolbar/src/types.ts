export interface SymbolItem {
  id: string;
  label: string;
  latex: string;
  category: string;
}

export interface SymbolCategory {
  id: string;
  label: string;
  symbols: SymbolItem[];
}

export interface StructureItem {
  id: string;
  label: string;
  latex: string;
  category: string;
  hasDropdown?: boolean;
}

export interface StructureCategory {
  id: string;
  label: string;
  structures: StructureItem[];
}

export interface ToolbarOptions {
  container: HTMLElement;
  onSymbolInsert?: (latex: string) => void;
  onStructureInsert?: (latex: string) => void;
}
