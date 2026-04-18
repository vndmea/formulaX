import {
  insertFenced,
  insertFraction,
  insertSqrt,
  insertSubscript,
  insertSuperscript,
  type FormulaCommand,
} from '@formulax/core';

export interface ToolbarAction {
  id: string;
  label: string;
  command: FormulaCommand;
}

export const createToolbarActions = (): ToolbarAction[] => [
  { id: 'fraction', label: '分数', command: insertFraction() },
  { id: 'sup', label: '上标', command: insertSuperscript() },
  { id: 'sub', label: '下标', command: insertSubscript() },
  { id: 'sqrt', label: '根号', command: insertSqrt() },
  { id: 'fence', label: '括号', command: insertFenced() },
];

export const renderToolbar = (): string =>
  `
  <div class="fx-toolbar">
    ${createToolbarActions()
      .map((action) => `<button type="button" data-command="${action.id}">${action.label}</button>`)
      .join('')}
  </div>
`;

export const renderFormulaPanel = (): string =>
  `
  <section class="fx-panel">
    <h3>基础结构</h3>
    <p>分数、上下标、根号与括号已可用，可继续扩展符号面板。</p>
  </section>
`;

export const renderModal = (title: string, content: string): string =>
  `
  <div class="fx-modal" role="dialog" aria-modal="true">
    <div class="fx-modal-card">
      <h3>${title}</h3>
      <div>${content}</div>
    </div>
  </div>
`;
