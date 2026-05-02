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
                // 预处理
                if (preObj) {
                    for (let key in preObj) {
                        if (!preObj.hasOwnProperty(key)) {
                            continue;
                        }
                        PRE_HANDLER[key.replace(/\\/g, "")] = preObj[key];
                    }
                }
            },
            // 格式化输入数据
            format: function(input) {
                // 清理多余的空格
                input = clearEmpty(input);
                // 处理输入的“{”和“}”
                input = input.replace(clearCharPattern, "").replace(/\\{/gi, leftChar).replace(/\\}/gi, rightChar);
                // 预处理器处理
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
         * 根据解析出来的语法单元生成树
         * @param units 单元
         * @return 生成的树对象
         */
            generateTree: function(units) {
                let tree = [], currentUnit = null;
                // 递归处理
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

                      // left-right分组
                        case "\\left":
                        bracketsCount++;
                        groupStack.push(group);
                        // 进入两层
                        group.push([ [] ]);
                        group = group[group.length - 1][0];
                        group.type = "brackets";
                        // 读取左括号
                        i++;
                        group.leftBrackets = units[i].replace(leftCharPattern, "{").replace(rightCharPattern, "}");
                        break;

                      case "\\right":
                        bracketsCount--;
                        // 读取右括号
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
                            // 处理自动调整大小的括号组
                            // 获取括号组定义
                            structs.push(Utils.getBracketsDefine(units[i].leftBrackets, units[i].rightBrackets));
                            // 处理内部表达式
                            structs.push(this.parseToStruct(units[i]));
                        } else {
                            // 普通组
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
     * 把序列化的字符串表示法转化为中间格式的结构化表示
     */
        function parseStruct(str) {
            // 特殊控制字符优先处理
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
        // 转换特殊的文本字符
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
 * “开方”预处理器
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
 * “双引号”预处理器
 */
_p[27] = {
    value: function() {
        return function(input) {
            return input.replace(/``/g, "“");
        };
    }
};

/*!
 * 逆解析处理函数: brackets
 */
_p[28] = {
    value: function() {
        /**
     * operands中元素对照表
     * 0: 左符号
     * 1: 右符号
     * 2: 表达式
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
 * 逆解析处理函数：combination
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
 * 逆解析处理函数: fraction
 */
_p[30] = {
    value: function() {
        return function(operands) {
            return "\\frac " + operands[0] + " " + operands[1];
        };
    }
};

/*!
 * 逆解析处理函数: func
 */
_p[31] = {
    value: function() {
        /**
     * operands中元素对照表
     * 0: 函数名
     * 1: 上标
     * 2: 下标
     */
        return function(operands) {
            let result = [ "\\" + operands[0] ];
            // 上标
            if (operands[2]) {
                result.push("^" + operands[2]);
            }
            // 下标
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
 * 逆解析处理函数: integration
 */
_p[32] = {
    value: function() {
        /**
     * operands中元素对照表
     * 0: 上标
     * 1: 下标
     */
        return function(operands) {
            let result = [ "\\int " ];
            // 修正多重积分的序列化
            if (this.callFn && this.callFn.setType) {
                result = [ "\\" ];
                for (let i = 0, len = this.callFn.setType; i < len; i++) {
                    result.push("i");
                }
                result.push("nt ");
            }
            // 上标
            if (operands[1]) {
                result.push("^" + operands[1]);
            }
            // 下标
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
 * 逆解析处理函数: mathbb
 */
_p[33] = {
    value: function() {
        return function(operands) {
            return "\\mathbb{" + operands[0] + "}";
        };
    }
};

/*!
 * 逆解析处理函数: mathcal
 */
_p[34] = {
    value: function() {
        return function(operands) {
            return "\\mathcal{" + operands[0] + "}";
        };
    }
};

/*!
 * 逆解析处理函数: mathfrak
 */
_p[35] = {
    value: function() {
        return function(operands) {
            return "\\mathfrak{" + operands[0] + "}";
        };
    }
};

/*!
 * 逆解析处理函数: mathcal
 */
_p[36] = {
    value: function() {
        return function(operands) {
            return "\\mathrm{" + operands[0] + "}";
        };
    }
};

/*!
 * 逆解析处理函数: script
 */
_p[37] = {
    value: function() {
        /**
     * operands中元素对照表
     * 0: 表达式
     * 1: 上标
     * 2: 下标
     */
        return function(operands) {
            return operands[0] + "^" + operands[1] + "_" + operands[2];
        };
    }
};

/*!
 * 逆解析处理函数: sqrt
 */
_p[38] = {
    value: function() {
        /**
     * operands中元素对照表
     * 0: 表达式
     * 1: 指数
     */
        return function(operands) {
            let result = [ "\\sqrt" ];
            // 上标
            if (operands[1]) {
                result.push("[" + operands[1] + "]");
            }
            result.push(" " + operands[0]);
            return result.join("");
        };
    }
};

/*!
 * 逆解析处理函数: subscript
 */
_p[39] = {
    value: function() {
        /**
     * operands中元素对照表
     * 0: 表达式
     * 1: 下标
     */
        return function(operands) {
            return operands[0] + "_" + operands[1];
        };
    }
};

/*!
 * 逆解析处理函数: summation
 */
_p[40] = {
    value: function() {
        /**
     * operands中元素对照表
     * 0: 上标
     * 1: 下标
     */
        return function(operands) {
            let result = [ "\\sum " ];
            // 上标
            if (operands[1]) {
                result.push("^" + operands[1]);
            }
            // 下标
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
 * 逆解析处理函数: superscript
 */
_p[41] = {
    value: function() {
        /**
     * operands中元素对照表
     * 0: 表达式
     * 1: 上标
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
            // 字符串处理， 需要处理特殊字符
            if (typeof tree !== "object") {
                if (isSpecialCharacter(tree)) {
                    return "\\" + tree + " ";
                }
                return tree.replace(specialCharPattern, function(match, group) {
                    return group + " ";
                });
            }
            // combination需要特殊处理, 重复嵌套的combination节点要删除
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
 * Kity Formula 公式表示法Parser接口
 */
}
