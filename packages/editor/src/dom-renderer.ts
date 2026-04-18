import type { FormulaDoc, FormulaNode, FormulaPath } from '@formulax/core';

const joinPath = (path: FormulaPath): string => path.join('.');

export const renderInteractiveHtml = (doc: FormulaDoc, activePath: FormulaPath): string => `
  <div class="fx-editor-surface" data-role="surface">
    ${renderChildren(doc.body, [], activePath)}
  </div>
`;

const renderChildren = (nodes: FormulaNode[], basePath: FormulaPath, activePath: FormulaPath): string => {
  const html: string[] = [];
  for (let index = 0; index <= nodes.length; index += 1) {
    const path = joinPath([...basePath, index]);
    const isActive = path === joinPath(activePath);
    html.push(
      `<button class="fx-slot${isActive ? ' is-active' : ''}" data-path="${path}" type="button" title="${path}"></button>`,
    );
    if (index < nodes.length) {
      html.push(renderNode(nodes[index], [...basePath, index], activePath));
    }
  }
  return html.join('');
};

const renderNode = (node: FormulaNode, path: FormulaPath, activePath: FormulaPath): string => {
  const pathValue = joinPath(path);
  const isActive = (p: FormulaPath) => joinPath(p) === joinPath(activePath);

  switch (node.type) {
    case 'text':
      return `<span class="fx-node fx-text" data-node-path="${pathValue}">${node.value}</span>`;
    case 'group':
      return `<span class="fx-node fx-group" data-node-path="${pathValue}">${renderChildren(node.body, [...path, 0], activePath)}</span>`;
    case 'frac':
      return `<span class="fx-node fx-frac" data-node-path="${pathValue}">
        <span class="fx-frac-num${isActive([...path, 0]) ? ' is-active' : ''}" data-path="${joinPath([...path, 0])}">${renderChildren(node.numerator, [...path, 0], activePath)}</span>
        <span class="fx-frac-line"></span>
        <span class="fx-frac-den${isActive([...path, 1]) ? ' is-active' : ''}" data-path="${joinPath([...path, 1])}">${renderChildren(node.denominator, [...path, 1], activePath)}</span>
      </span>`;
    case 'supsub':
      return `<span class="fx-node fx-supsub" data-node-path="${pathValue}">
        <span class="fx-supsub-base">${renderChildren(node.base, [...path, 0], activePath)}</span>
        <span class="fx-supsub-stack">
          <span class="fx-sup${isActive([...path, 1]) ? ' is-active' : ''}" data-path="${joinPath([...path, 1])}">${renderChildren(node.sup ?? [], [...path, 1], activePath)}</span>
          <span class="fx-sub${isActive([...path, 2]) ? ' is-active' : ''}" data-path="${joinPath([...path, 2])}">${renderChildren(node.sub ?? [], [...path, 2], activePath)}</span>
        </span>
      </span>`;
    case 'sqrt':
      return `<span class="fx-node fx-sqrt" data-node-path="${pathValue}">
        <span class="fx-sqrt-symbol">√</span>
        <span class="fx-sqrt-body${isActive([...path, 0]) ? ' is-active' : ''}" data-path="${joinPath([...path, 0])}">${renderChildren(node.value, [...path, 0], activePath)}</span>
      </span>`;
    case 'fenced':
      return `<span class="fx-node fx-fenced" data-node-path="${pathValue}">
        <span class="fx-fence">${node.left}</span>
        <span class="fx-fenced-body${isActive([...path, 0]) ? ' is-active' : ''}" data-path="${joinPath([...path, 0])}">${renderChildren(node.body, [...path, 0], activePath)}</span>
        <span class="fx-fence">${node.right}</span>
      </span>`;
    case 'doc':
      return renderChildren(node.body, [0], activePath);
  }

  throw new Error(`Unsupported node type: ${String((node as { type?: string }).type)}`);
};