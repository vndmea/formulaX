import type { FormulaDoc } from './ast';
export interface FormulaImportExportProtocol {
    parseLatex(input: string): FormulaDoc;
    serializeLatex(doc: FormulaDoc): string;
}
//# sourceMappingURL=protocol.d.ts.map