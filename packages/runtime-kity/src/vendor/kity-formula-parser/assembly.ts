// @ts-nocheck
import type { LegacyParserModuleContext } from './runtime';

export function registerAssemblyModule(context: LegacyParserModuleContext) {
  const { _p, window } = context;

  _p[0] = {
    value: function () {
      const kf = window.kf as any;
      const CONSTRUCT_MAPPING = {};
      const CURSOR_CHAR = '\uF155';

      class Assembly {
        formula: any;

        constructor(formula: any) {
          this.formula = formula;
        }

        generateBy(data: { tree: any }) {
          const tree = data.tree;
          const objTree = {};
          const selectInfo = {};
          const mapping = {};

          if (typeof tree === 'string') {
            throw new Error('Unhandled string tree node');
          }

          this.formula.appendExpression(generateExpression(tree, deepCopy(tree), objTree, mapping, selectInfo));

          return {
            select: selectInfo,
            parsedTree: tree,
            tree: objTree,
            mapping,
          };
        }

        regenerateBy(data: { tree: any }) {
          this.formula.clearExpressions();
          return this.generateBy(data);
        }
      }

      function generateExpression(originTree: any, tree: any, objTree: any, mapping: any, selectInfo: any) {
        let currentOperand = null;
        let exp = null;
        const cursorLocation: number[] = [];
        const operand = tree.operand || [];
        let constructor = null;

        objTree.operand = [];

        if (tree.name.indexOf('text') === -1) {
          for (let i = 0, len = operand.length; i < len; i += 1) {
            currentOperand = operand[i];

            if (currentOperand === CURSOR_CHAR) {
              cursorLocation.push(i);
              if (!Object.prototype.hasOwnProperty.call(selectInfo, 'startOffset')) {
                selectInfo.startOffset = i;
              }
              selectInfo.endOffset = i;
              if (tree.attr && tree.attr.id) {
                selectInfo.groupId = tree.attr.id;
              }
              continue;
            }

            if (!currentOperand) {
              operand[i] = createObject('empty');
              objTree.operand.push(operand[i]);
            } else if (typeof currentOperand === 'string') {
              if (tree.name === 'brackets' && i < 2) {
                operand[i] = currentOperand;
              } else if (tree.name === 'function' && i === 0) {
                operand[i] = currentOperand;
              } else {
                operand[i] = createObject('text', currentOperand);
              }
              objTree.operand.push(operand[i]);
            } else {
              objTree.operand.push({});
              operand[i] = generateExpression(originTree.operand[i], currentOperand, objTree.operand[objTree.operand.length - 1], mapping, selectInfo);
            }
          }

          if (cursorLocation.length === 2) {
            selectInfo.endOffset -= 1;
          }

          while (cursorLocation.length) {
            const index = cursorLocation[cursorLocation.length - 1];
            operand.splice(index, 1);
            cursorLocation.pop();
            originTree.operand.splice(index, 1);
          }
        }

        constructor = getConstructor(tree.name);
        if (!constructor) {
          throw new Error(`operator type error: not found ${tree.operator}`);
        }

        exp = Object.create(constructor.prototype);
        constructor.apply(exp, operand);
        objTree.func = exp;

        for (const fn in tree.callFn) {
          if (!Object.prototype.hasOwnProperty.call(tree.callFn, fn) || !exp[fn]) {
            continue;
          }
          exp[fn].apply(exp, tree.callFn[fn]);
        }

        if (tree.attr) {
          if (tree.attr.id) {
            mapping[tree.attr.id] = {
              objGroup: exp,
              strGroup: originTree,
            };
          }
          if (tree.attr['data-root']) {
            mapping.root = {
              objGroup: exp,
              strGroup: originTree,
            };
          }
          exp.setAttr(tree.attr);
        }

        return exp;
      }

      function createObject(type: string, value?: string) {
        switch (type) {
          case 'empty':
            return new kf.EmptyExpression();
          case 'text':
            return new kf.TextExpression(value);
          default:
            throw new Error(`Unsupported assembly object type: ${type}`);
        }
      }

      function getConstructor(name: string) {
        return (
          CONSTRUCT_MAPPING[name] ||
          kf[
            name
              .replace(/^[a-z]/i, (match: string) => match.toUpperCase())
              .replace(/-([a-z])/gi, (_match: string, char: string) => char.toUpperCase()) + 'Expression'
          ]
        );
      }

      function deepCopy(source: any): any {
        if (!source || typeof source !== 'object') {
          return source;
        }

        if (Array.isArray(source)) {
          return source.map((item) => deepCopy(item));
        }

        const target: Record<string, any> = {};
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = deepCopy(source[key]);
          }
        }
        return target;
      }

      return Assembly;
    },
  };
}
