// @ts-nocheck
import type { LegacyParserModuleContext } from './runtime';

export function registerLatexSupportModules(context: LegacyParserModuleContext) {
  const { _p, window } = context;
_p[1] = {
    value: function(require) {
        return {
            toRPNExpression: _p.r(2),
            generateTree: _p.r(3)
        };
    }
};

_p[2] = {
    value: function(require) {
        let Utils = _p.r(4);
        function rpn(units) {
            let signStack = [], currentUnit = null;
            // 先处理函数
            units = processFunction(units);
            while (currentUnit = units.shift()) {
                // 移除brackets中外层包裹的combination节点
                if (currentUnit.name === "combination" && currentUnit.operand.length === 1 && currentUnit.operand[0].name === "brackets") {
                    currentUnit = currentUnit.operand[0];
                }
                if (Utils.isArray(currentUnit)) {
                    signStack.push(rpn(currentUnit));
                    continue;
                }
                signStack.push(currentUnit);
            }
            // 要处理brackets被附加的包裹元素
            return signStack;
        }
        /**
     * “latex函数”处理器
     * @param units 单元组
     * @returns {Array} 处理过后的单元组
     */
        function processFunction(units) {
            let processed = [], currentUnit = null;
            while ((currentUnit = units.pop()) !== undefined) {
                if (currentUnit && typeof currentUnit === "object" && (currentUnit.sign === false || currentUnit.name === "function")) {
                    // 预先处理不可作为独立符号的函数
                    let tt = currentUnit.handler(currentUnit, [], processed.reverse());
                    processed.unshift(tt);
                    processed.reverse();
                } else {
                    processed.push(currentUnit);
                }
            }
            return processed.reverse();
        }
        return rpn;
    }
};

/**
 * 从单元组构建树
 */
_p[3] = {
    value: function(require) {
        let mergeHandler = _p.r(13), Utils = _p.r(4);
        function generateTree(units) {
            let currentUnit = null, tree = [];
            for (let i = 0, len = units.length; i < len; i++) {
                if (Utils.isArray(units[i])) {
                    units[i] = generateTree(units[i]);
                }
            }
            while (currentUnit = units.shift()) {
                if (typeof currentUnit === "object" && currentUnit.handler) {
                    // 后操作数
                    tree.push(currentUnit.handler(currentUnit, tree, units));
                } else {
                    tree.push(currentUnit);
                }
            }
            return mergeHandler(tree);
        }
        return generateTree;
    }
};

/**
 * 通用工具包
 */
_p[4] = {
    value: function(require) {
        let OPERATOR_LIST = _p.r(7), FUNCTION_LIST = _p.r(6), FUNCTION_HANDLER = _p.r(15), Utils = {
            // 根据输入的latex字符串， 检测出该字符串所对应的kf的类型
            getLatexType: function(str) {
                str = str.replace(/^\\/, "");
                // 操作符
                if (OPERATOR_LIST[str]) {
                    return "operator";
                }
                if (FUNCTION_LIST[str]) {
                    return "function";
                }
                return "text";
            },
            isArray: function(obj) {
                return obj && Object.prototype.toString.call(obj) === "[object Array]";
            },
            getDefine: function(str) {
                return Utils.extend({}, OPERATOR_LIST[str.replace("\\", "")]);
            },
            getFuncDefine: function(str) {
                return {
                    name: "function",
                    params: str.replace(/^\\/, ""),
                    handler: FUNCTION_HANDLER
                };
            },
            getBracketsDefine: function(leftBrackets, rightBrackets) {
                return Utils.extend({
                    params: [ leftBrackets, rightBrackets ]
                }, OPERATOR_LIST.brackets);
            },
            extend: function(target, sources) {
                for (let key in sources) {
                    if (sources.hasOwnProperty(key)) {
                        target[key] = sources[key];
                    }
                }
                return target;
            }
        };
        return Utils;
    }
};

/**
 * 定义括号类型， 对于属于括号类型的符号或表达式， 则可以应用brackets函数处理
 */
_p[5] = {
    value: function() {
        let t = true;
        return {
            ".": t,
            "{": t,
            "}": t,
            "[": t,
            "]": t,
            "(": t,
            ")": t,
            "|": t
        };
    }
};

/**
 * 函数列表
 */
_p[6] = {
    value: function() {
        return {
            sin: 1,
            cos: 1,
            arccos: 1,
            cosh: 1,
            det: 1,
            inf: 1,
            limsup: 1,
            Pr: 1,
            tan: 1,
            arcsin: 1,
            cot: 1,
            dim: 1,
            ker: 1,
            ln: 1,
            sec: 1,
            tanh: 1,
            arctan: 1,
            coth: 1,
            exp: 1,
            lg: 1,
            log: 1,
            arg: 1,
            csc: 1,
            gcd: 1,
            lim: 1,
            max: 1,
            sinh: 1,
            deg: 1,
            hom: 1,
            liminf: 1,
            min: 1,
            sup: 1
        };
    }
};

/**
 * 操作符列表
 */
_p[7] = {
    value: function(require) {
        let scriptHandler = _p.r(22), TYPE = _p.r(11);
        return {
            "^": {
                name: "superscript",
                type: TYPE.OP,
                handler: scriptHandler
            },
            _: {
                name: "subscript",
                type: TYPE.OP,
                handler: scriptHandler
            },
            frac: {
                name: "fraction",
                type: TYPE.FN,
                sign: false,
                handler: _p.r(14)
            },
            sqrt: {
                name: "radical",
                type: TYPE.FN,
                sign: false,
                handler: _p.r(23)
            },
            sum: {
                name: "summation",
                type: TYPE.FN,
                traversal: "rtl",
                handler: _p.r(24)
            },
            "int": {
                name: "integration",
                type: TYPE.FN,
                traversal: "rtl",
                handler: _p.r(16)
            },
            brackets: {
                name: "brackets",
                type: TYPE.FN,
                handler: _p.r(12)
            },
            mathcal: {
                name: "mathcal",
                type: TYPE.FN,
                sign: false,
                handler: _p.r(19)
            },
            mathfrak: {
                name: "mathfrak",
                type: TYPE.FN,
                sign: false,
                handler: _p.r(20)
            },
            mathbb: {
                name: "mathbb",
                type: TYPE.FN,
                sign: false,
                handler: _p.r(18)
            },
            mathrm: {
                name: "mathrm",
                type: TYPE.FN,
                sign: false,
                handler: _p.r(21)
            }
        };
    }
};

/**
 * 预处理器列表
 */
_p[8] = {
    value: function(require) {
        return {
            // 积分预处理器
            "int": _p.r(26),
            // 引号预处理
            quot: _p.r(27)
        };
    }
};

/*!
 * 逆解析对照表
 */
_p[9] = {
    value: function(require) {
        return {
            combination: _p.r(29),
            fraction: _p.r(30),
            "function": _p.r(31),
            integration: _p.r(32),
            subscript: _p.r(39),
            superscript: _p.r(41),
            script: _p.r(37),
            radical: _p.r(38),
            summation: _p.r(40),
            brackets: _p.r(28),
            mathcal: _p.r(34),
            mathfrak: _p.r(35),
            mathbb: _p.r(33),
            mathrm: _p.r(36)
        };
    }
};

/*!
 * 特殊字符定义
 */
_p[10] = {
    value: function() {
        return {
            "#": 1,
            $: 1,
            "%": 1,
            _: 1,
            "&": 1,
            "{": 1,
            "}": 1,
            "^": 1,
            "~": 1
        };
    }
};

/**
 * 操作符类型定义
 */
_p[11] = {
    value: function() {
        return {
            OP: 1,
            FN: 2
        };
    }
};

/*!
 * 括号处理器
 */
_p[12] = {
    value: function(require) {
        let BRACKETS_TYPE = _p.r(5);
        return function(info, processedStack, unprocessedStack) {
            // 括号验证
            for (let i = 0, len = info.params.length; i < len; i++) {
                if (!(info.params[i] in BRACKETS_TYPE)) {
                    throw new Error("Brackets: invalid params");
                }
            }
            info.operand = info.params;
            info.params[2] = unprocessedStack.shift();
            delete info.handler;
            delete info.params;
            return info;
        };
    }
};

/*!
 * 合并处理(特殊处理函数)
 */
_p[13] = {
    value: function() {
        return function() {
            return {
                name: "combination",
                operand: arguments[0] || []
            };
        };
    }
};

/*!
 * 分数函数处理器
 */
_p[14] = {
    value: function() {
        // 处理函数接口
        return function(info, processedStack, unprocessedStack) {
            let numerator = unprocessedStack.shift(), // 分子
            denominator = unprocessedStack.shift();
            // 分母
            if (numerator === undefined || denominator === undefined) {
                throw new Error("Frac: Syntax Error");
            }
            info.operand = [ numerator, denominator ];
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 函数表达式处理器
 */
_p[15] = {
    value: function(require) {
        let ScriptExtractor = _p.r(17);
        // 处理函数接口
        return function(info, processedStack, unprocessedStack) {
            let params = ScriptExtractor.exec(unprocessedStack);
            info.operand = [ info.params, params.expr, params.superscript, params.subscript ];
            delete info.params;
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 积分函数处理器
 */
_p[16] = {
    value: function(require) {
        let ScriptExtractor = _p.r(17), FN_TYPE = _p.r(11).FN;
        return function(info, processedStack, unprocessedStack) {
            let count = unprocessedStack.shift(), params = ScriptExtractor.exec(unprocessedStack);
            if (params.expr && params.expr.type === FN_TYPE && params.expr.handler) {
                params.expr = params.expr.handler(params.expr, processedStack, unprocessedStack);
            }
            info.operand = [ params.expr, params.superscript, params.subscript ];
            // 参数配置调用
            info.callFn = {
                setType: [ count | 0 ]
            };
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 通用上下标提取器
 */
_p[17] = {
    value: function() {
        return {
            exec: function(stack) {
                // 提取上下标
                let result = extractScript(stack), expr = stack.shift();
                if (expr && expr.name && expr.name.indexOf("script") !== -1) {
                    throw new Error("Script: syntax error!");
                }
                result.expr = expr || null;
                return result;
            }
        };
        function extractScript(stack) {
            let scriptGroup = extract(stack), nextGroup = null, result = {
                superscript: null,
                subscript: null
            };
            if (scriptGroup) {
                nextGroup = extract(stack);
            } else {
                return result;
            }
            result[scriptGroup.type] = scriptGroup.value || null;
            if (nextGroup) {
                if (nextGroup.type === scriptGroup.type) {
                    throw new Error("Script: syntax error!");
                }
                result[nextGroup.type] = nextGroup.value || null;
            }
            return result;
        }
        function extract(stack) {
            let forward = stack.shift();
            if (!forward) {
                return null;
            }
            if (forward.name === "subscript" || forward.name === "superscript") {
                return {
                    type: forward.name,
                    value: stack.shift()
                };
            }
            stack.unshift(forward);
            return null;
        }
    }
};

/*!
 * 双线处理
 */
_p[18] = {
    value: function() {
        return function(info, processedStack, unprocessedStack) {
            let chars = unprocessedStack.shift();
            if (typeof chars === "object" && chars.name === "combination") {
                chars = chars.operand.join("");
            }
            info.name = "text";
            info.attr = {
                _reverse: "mathbb"
            };
            info.callFn = {
                setFamily: [ "KF AMS BB" ]
            };
            info.operand = [ chars ];
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 手写体处理
 */
_p[19] = {
    value: function() {
        return function(info, processedStack, unprocessedStack) {
            let chars = unprocessedStack.shift();
            if (typeof chars === "object" && chars.name === "combination") {
                chars = chars.operand.join("");
            }
            info.name = "text";
            info.attr = {
                _reverse: "mathcal"
            };
            info.callFn = {
                setFamily: [ "KF AMS CAL" ]
            };
            info.operand = [ chars ];
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 花体处理
 */
_p[20] = {
    value: function() {
        return function(info, processedStack, unprocessedStack) {
            let chars = unprocessedStack.shift();
            if (typeof chars === "object" && chars.name === "combination") {
                chars = chars.operand.join("");
            }
            info.name = "text";
            info.attr = {
                _reverse: "mathfrak"
            };
            info.callFn = {
                setFamily: [ "KF AMS FRAK" ]
            };
            info.operand = [ chars ];
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 罗马处理
 */
_p[21] = {
    value: function() {
        return function(info, processedStack, unprocessedStack) {
            let chars = unprocessedStack.shift();
            if (typeof chars === "object" && chars.name === "combination") {
                chars = chars.operand.join("");
            }
            info.name = "text";
            info.attr = {
                _reverse: "mathrm"
            };
            info.callFn = {
                setFamily: [ "KF AMS ROMAN" ]
            };
            info.operand = [ chars ];
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 上下标操作符函数处理
 */
_p[22] = {
    value: function() {
        // 处理函数接口
        return function(info, processedStack, unprocessedStack) {
            let base = processedStack.pop(), script = unprocessedStack.shift() || null;
            if (!script) {
                throw new Error("Missing script");
            }
            base = base || "";
            if (base.name === info.name || base.name === "script") {
                throw new Error("script error");
            }
            // 执行替换
            if (base.name === "subscript") {
                base.name = "script";
                base.operand[2] = base.operand[1];
                base.operand[1] = script;
                return base;
            } else if (base.name === "superscript") {
                base.name = "script";
                base.operand[2] = script;
                return base;
            }
            info.operand = [ base, script ];
            // 删除处理器
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 方根函数处理器
 */
_p[23] = {
    value: function(require) {
        let mergeHandler = _p.r(13);
        // 处理函数接口
        return function(info, processedStack, unprocessedStack) {
            let exponent = unprocessedStack.shift(), tmp = null, // 被开方数
            radicand = null;
            if (exponent === "[") {
                exponent = [];
                while (tmp = unprocessedStack.shift()) {
                    if (tmp === "]") {
                        break;
                    }
                    exponent.push(tmp);
                }
                if (exponent.length === 0) {
                    exponent = null;
                } else {
                    exponent = mergeHandler(exponent);
                }
                radicand = unprocessedStack.shift();
            } else {
                radicand = exponent;
                exponent = null;
            }
            info.operand = [ radicand, exponent ];
            delete info.handler;
            return info;
        };
    }
};

/*!
 * 求和函数处理器
 */
_p[24] = {
    value: function(require) {
        let ScriptExtractor = _p.r(17);
        return function(info, processedStack, unprocessedStack) {
            let params = ScriptExtractor.exec(unprocessedStack);
            info.operand = [ params.expr, params.superscript, params.subscript ];
            delete info.handler;
            return info;
        };
    }
};

/**
 * Kity Formula Latex解析器实现
 */
/* jshint forin: false */
}
