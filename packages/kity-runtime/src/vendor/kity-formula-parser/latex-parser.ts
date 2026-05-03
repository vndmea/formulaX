// @ts-nocheck
import type { LegacyParserModuleContext } from './runtime';

export function registerLatexParserModules(context: LegacyParserModuleContext) {
  const { _p, window } = context;
_p[25] = {
    value: function(require) {
        let Parser = _p.r(43).Parser, LatexUtils = _p.r(1), PRE_HANDLER = _p.r(8), serialization = _p.r(42), OP_DEFINE = _p.r(7), REVERSE_DEFINE = _p.r(9), SPECIAL_LIST = _p.r(10), Utils = _p.r(4);
        // data
        let leftChar = "\uFFF8", rightChar = "\uFFFC", clearCharPattern = new RegExp(leftChar + "|" + rightChar, "g"), leftCharPattern = new RegExp(leftChar, "g"), rightCharPattern = new RegExp(rightChar, "g");
        Parser.register("latex", Parser.implement({
            parse: function(data) {
                let units = this.split(this.format(data));
                units = this.parseToGroup(units);
                units = this.parseToStruct(units);
                return this.generateTree(units);
            },
            serialization: function(tree, options) {
                return serialization(tree, options);
            },
            expand: function(expandObj) {
                let parseObj = expandObj.parse, formatKey = null, preObj = expandObj.pre, reverseObj = expandObj.reverse;
                for (let key in parseObj) {
                    if (!parseObj.hasOwnProperty(key)) {
                        continue;
                    }
                    formatKey = key.replace(/\\/g, "");
                    OP_DEFINE[formatKey] = parseObj[key];
                }
                for (let key in reverseObj) {
                    if (!reverseObj.hasOwnProperty(key)) {
                        continue;
                    }
                    REVERSE_DEFINE[key.replace(/\\/g, "")] = reverseObj[key];
                }
                // Preprocess
                if (preObj) {
                    for (let key in preObj) {
                        if (!preObj.hasOwnProperty(key)) {
                            continue;
                        }
                        PRE_HANDLER[key.replace(/\\/g, "")] = preObj[key];
                    }
                }
            },
            // Format input data
            format: function(input) {
                // Clear extra spaces
                input = clearEmpty(input);
                // 处理输入的“{”和“}�?
                input = input.replace(clearCharPattern, "").replace(/\\{/gi, leftChar).replace(/\\}/gi, rightChar);
                // Preprocessor processing
                for (let key in PRE_HANDLER) {
                    if (PRE_HANDLER.hasOwnProperty(key)) {
                        input = PRE_HANDLER[key](input);
                    }
                }
                return input;
            },
            split: function(data) {
                let units = [], pattern = /(?:\\[^a-z]\s*)|(?:\\[a-z]+\s*)|(?:[{}]\s*)|(?:[^\\{}]\s*)/gi, emptyPattern = /^\s+|\s+$/g, match = null;
                data = data.replace(emptyPattern, "");
                while (match = pattern.exec(data)) {
                    match = match[0].replace(emptyPattern, "");
                    if (match) {
                        units.push(match);
                    }
                }
                return units;
            },
            /**
          * Generate tree from parsed syntax units
          * @param units Units
          * @return Generated tree object
          */
            generateTree: function(units) {
                let tree = [], currentUnit = null;
                // Recursive processing
                while (currentUnit = units.shift()) {
                    if (Utils.isArray(currentUnit)) {
                        tree.push(this.generateTree(currentUnit));
                    } else {
                        tree.push(currentUnit);
                    }
                }
                tree = LatexUtils.toRPNExpression(tree);
                return LatexUtils.generateTree(tree);
            },
            parseToGroup: function(units) {
                let group = [], groupStack = [ group ], groupCount = 0, bracketsCount = 0;
                for (let i = 0, len = units.length; i < len; i++) {
                    switch (units[i]) {
                      case "{":
                        groupCount++;
                        groupStack.push(group);
                        group.push([]);
                        group = group[group.length - 1];
                        break;

                      case "}":
                        groupCount--;
                        group = groupStack.pop();
                        break;

                      // left-right grouping
                        case "\\left":
                        bracketsCount++;
                        groupStack.push(group);
                        // Enter two levels
                        group.push([ [] ]);
                        group = group[group.length - 1][0];
                        group.type = "brackets";
                        // Read left bracket
                        i++;
                        group.leftBrackets = units[i].replace(leftCharPattern, "{").replace(rightCharPattern, "}");
                        break;

                      case "\\right":
                        bracketsCount--;
                        // Read right bracket
                        i++;
                        group.rightBrackets = units[i].replace(leftCharPattern, "{").replace(rightCharPattern, "}");
                        group = groupStack.pop();
                        break;

                      default:
                        group.push(units[i].replace(leftCharPattern, "\\{").replace(rightCharPattern, "\\}"));
                        break;
                    }
                }
                if (groupCount !== 0) {
                    throw new Error("Group Error!");
                }
                if (bracketsCount !== 0) {
                    throw new Error("Brackets Error!");
                }
                return groupStack[0];
            },
            parseToStruct: function(units) {
                let structs = [];
                for (let i = 0, len = units.length; i < len; i++) {
                    if (Utils.isArray(units[i])) {
                        if (units[i].type === "brackets") {
                            // Handle auto-sized bracket groups
                            // Get bracket group definition
                            structs.push(Utils.getBracketsDefine(units[i].leftBrackets, units[i].rightBrackets));
                            // Handle internal expression
                            structs.push(this.parseToStruct(units[i]));
                        } else {
                            // Normal group
                            structs.push(this.parseToStruct(units[i]));
                        }
                    } else {
                        structs.push(parseStruct(units[i]));
                    }
                }
                return structs;
            }
        }));
         /**
      * Convert serialized string representation to structured intermediate format
      */
        function parseStruct(str) {
            // Special control characters take priority
            if (isSpecialCharacter(str)) {
                return str.substring(1);
            }
            switch (Utils.getLatexType(str)) {
              case "operator":
                return Utils.getDefine(str);

              case "function":
                return Utils.getFuncDefine(str);

              default:
                // text
                return transformSpecialCharacters(str);
            }
        }
        // Transform special text characters
        function transformSpecialCharacters(char) {
            if (char.indexOf("\\") === 0) {
                return char + "\\";
            }
            return char;
        }
        function isSpecialCharacter(char) {
            if (char.indexOf("\\") === 0) {
                return !!SPECIAL_LIST[char.substring(1)];
            }
            return false;
        }
        function clearEmpty(data) {
            return data.replace(/\\\s+/, "").replace(/\s*([^a-z0-9\s])\s*/gi, function(match, symbol) {
                return symbol;
            });
        }
    }
};

/**
 * "Square root" preprocessor
 */
_p[26] = {
    value: function() {
        return function(input) {
            return input.replace(/\\(i+)nt(\b|[^a-zA-Z])/g, function(match, sign, suffix) {
                return "\\int " + sign.length + suffix;
            });
        };
    }
};

/**
 * "Double quote" preprocessor
 */
_p[27] = {
    value: function() {
        return function(input) {
            return input.replace(/``/g, "�?);
        };
    }
};

/*!
 * Reverse parsing handler: brackets
 */
_p[28] = {
    value: function() {
        /**
     * Operand mapping table
     * 0: Left symbol
     * 1: Right symbol
     * 2: Expression
     */
        return function(operands) {
            if (operands[0] === "{" || operands[0] === "}") {
                operands[0] = "\\" + operands[0];
            }
            if (operands[1] === "{" || operands[1] === "}") {
                operands[1] = "\\" + operands[1];
            }
            return [ "\\left", operands[0], operands[2], "\\right", operands[1] ].join(" ");
        };
    }
};

/*!
 * Reverse parsing handler: combination
 */
_p[29] = {
    value: function() {
        return function(operands) {
            if (this.attr["data-root"] || this.attr["data-placeholder"]) {
                return operands.join("");
            }
            return "{" + operands.join("") + "}";
        };
    }
};

/*!
 * Reverse parsing handler: fraction
 */
_p[30] = {
    value: function() {
        return function(operands) {
            return "\\frac " + operands[0] + " " + operands[1];
        };
    }
};

/*!
 * Reverse parsing handler: func
 */
_p[31] = {
    value: function() {
        /**
     * Operand mapping table
     * 0: Function name
     * 1: Superscript
     * 2: Subscript
     */
        return function(operands) {
            let result = [ "\\" + operands[0] ];
            // Superscript
            if (operands[2]) {
                result.push("^" + operands[2]);
            }
            // Subscript
            if (operands[3]) {
                result.push("_" + operands[3]);
            }
            if (operands[1]) {
                result.push(" " + operands[1]);
            }
            return result.join("");
        };
    }
};

/*!
 * Reverse parsing handler: integration
 */
_p[32] = {
    value: function() {
        /**
     * Operand mapping table
     * 0: Superscript
     * 1: Subscript
     */
        return function(operands) {
            let result = [ "\\int " ];
            // Fix serialization of multiple integrals
            if (this.callFn && this.callFn.setType) {
                result = [ "\\" ];
                for (let i = 0, len = this.callFn.setType; i < len; i++) {
                    result.push("i");
                }
                result.push("nt ");
            }
            // Superscript
            if (operands[1]) {
                result.push("^" + operands[1]);
            }
            // Subscript
            if (operands[2]) {
                result.push("_" + operands[2]);
            }
            if (operands[0]) {
                result.push(" " + operands[0]);
            }
            return result.join("");
        };
    }
};

/*!
 * Reverse parsing handler: mathcal (mathscr)
 */
_p[34] = {
    value: function() {
        return function(operands) {
            return "\\mathcal{" + operands[0] + "}";
        };
    }
};

/*!
 * Reverse parsing handler: mathfrak
 */
_p[35] = {
    value: function() {
        return function(operands) {
            return "\\mathfrak{" + operands[0] + "}";
        };
    }
};

/*!
 * Reverse parsing handler: mathrm
 */
_p[36] = {
    value: function() {
        return function(operands) {
            return "\\mathrm{" + operands[0] + "}";
        };
    }
};

/*!
 * Reverse parsing handler: script
 */
_p[37] = {
    value: function() {
        /**
     * Operand mapping table
     * 0: Expression
     * 1: Superscript
     * 2: Subscript
     */
        return function(operands) {
            return operands[0] + "^" + operands[1] + "_" + operands[2];
        };
    }
};

/*!
 * Reverse parsing handler: sqrt
 */
_p[38] = {
    value: function() {
        /**
     * Operand mapping table
     * 0: Expression
     * 1: Exponent
     */
        return function(operands) {
            let result = [ "\\sqrt" ];
            // Exponent
            if (operands[1]) {
                result.push("[" + operands[1] + "]");
            }
            result.push(" " + operands[0]);
            return result.join("");
        };
    }
};

/*!
 * Reverse parsing handler: subscript
 */
_p[39] = {
    value: function() {
        /**
     * Operand mapping table
     * 0: Expression
     * 1: Subscript
     */
        return function(operands) {
            return operands[0] + "_" + operands[1];
        };
    }
};

/*!
 * Reverse parsing handler: summation
 */
_p[40] = {
    value: function() {
        /**
     * Operand mapping table
     * 0: Superscript
     * 1: Subscript
     */
        return function(operands) {
            let result = [ "\\sum " ];
            // Superscript
            if (operands[1]) {
                result.push("^" + operands[1]);
            }
            // Subscript
            if (operands[2]) {
                result.push("_" + operands[2]);
            }
            if (operands[0]) {
                result.push(" " + operands[0]);
            }
            return result.join("");
        };
    }
};

/*!
 * Reverse parsing handler: superscript
 */
_p[41] = {
    value: function() {
        /**
     * Operand mapping table
     * 0: Expression
     * 1: Superscript
     */
        return function(operands) {
            return operands[0] + "^" + operands[1];
        };
    }
};

/**
 * Created by hn on 14-3-20.
 */
_p[42] = {
    value: function(require) {
        let reverseHandlerTable = _p.r(9), SPECIAL_LIST = _p.r(10), specialCharPattern = /(\\(?:[\w]+)|(?:[^a-z]))\\/gi;
        return function(tree, options) {
            return reverseParse(tree, options);
        };
        function reverseParse(tree, options) {
            let operands = [], reverseHandlerName = null, originalOperands = null;
            // String processing, need to handle special characters
            if (typeof tree !== "object") {
                if (isSpecialCharacter(tree)) {
                    return "\\" + tree + " ";
                }
                return tree.replace(specialCharPattern, function(match, group) {
                    return group + " ";
                });
            }
            // combination needs special handling, nested combination nodes should be removed
            if (tree.name === "combination" && tree.operand.length === 1 && tree.operand[0].name === "combination") {
                tree = tree.operand[0];
            }
            originalOperands = tree.operand;
            for (let i = 0, len = originalOperands.length; i < len; i++) {
                if (originalOperands[i]) {
                    operands.push(reverseParse(originalOperands[i]));
                } else {
                    operands.push(originalOperands[i]);
                }
            }
            if (tree.attr && tree.attr._reverse) {
                reverseHandlerName = tree.attr._reverse;
            } else {
                reverseHandlerName = tree.name;
            }
            return reverseHandlerTable[reverseHandlerName].call(tree, operands, options);
        }
        function isSpecialCharacter(char) {
            return !!SPECIAL_LIST[char];
        }
    }
};

/*!
 * Kity Formula formula representation parser interface
 */
}
