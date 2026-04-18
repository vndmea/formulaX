import katex from 'katex';
import { serializeLatex, type FormulaDoc } from '@formulax/core';

export interface KatexLike {
  renderToString(input: string, options?: Record<string, unknown>): string;
}

export interface RenderKatexOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  katexInstance?: KatexLike;
}

export const toKatexLatex = (doc: FormulaDoc): string => serializeLatex(doc);

export const renderKatex = (doc: FormulaDoc, options: RenderKatexOptions = {}): string => {
  const engine = options.katexInstance ?? katex;
  return engine.renderToString(toKatexLatex(doc), {
    displayMode: options.displayMode ?? false,
    throwOnError: options.throwOnError ?? false,
  });
};
