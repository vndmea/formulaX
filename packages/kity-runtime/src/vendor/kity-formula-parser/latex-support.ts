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
            // Process functions first
            units = processFunction(units);
            while (currentUnit = units.shift()) {
                // Remove the combination node wrapped outside brackets
                if (currentUnit.name === "combination" && currentUnit.operand.length === 1 && currentUnit.operand[0].name === "brackets") {
                    currentUnit = currentUnit.operand[0];
                }
                if (Utils.isArray(currentUnit)) {
                    signStack.push(rpn(currentUnit));
                    continue;
                }
                signStack.push(currentUnit);
            }
            // Handle brackets with attached wrapper elements
            return signStack;
        }
        /**
     * "latex function" processor
     * @param units Unit group
     * @returns {Array} Processed unit group
     */
        function processFunction(units) {
            let processed = [], currentUnit = null;
            while ((currentUnit = units.pop()) !== undefined) {
                if (currentUnit && typeof currentUnit === "object" && (currentUnit.sign === false || currentUnit.name === "function")) {
                    // Pre-process functions that cannot be independent symbols
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
 * Build tree from unit group
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
                    // Post-operand
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
 * Common utility package
 */
_p[4] = {
    value: function(require) {
        let OPERATOR_LIST = _p.r(7), FUNCTION_LIST = _p.r(6), FUNCTION_HANDLER = _p.r(15), Utils = {
            // Detect the kf type based on input latex string
            getLatexType: function(str) {
                str = str.replace(/^\\/, "");
                // Operator
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
 * Define bracket types - symbols or expressions belonging to bracket types can be processed by the brackets function
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
 * Function list
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
 * Operator list
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
 * Preprocessor list
 */
_p[8] = {
    value: function(require) {
        return {
            // Integration preprocessor
            "int": _p.r(26),
            // Quote preprocessor
            quot: _p.r(27)
        };
    }
};

/*!
 * Reverse parsing mapping table
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
 * Special character definition
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
 * Operator type definition
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
 * Bracket processor
 */
_p[12] = {
    value: function(require) {
        let BRACKETS_TYPE = _p.r(5);
        return function(info, processedStack, unprocessedStack) {
            // Bracket validation
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
 * Merge processing (special processing function)
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
 * Fraction function processor
 */
_p[14] = {
    value: function() {
        // Process function interface
        return function(info, processedStack, unprocessedStack) {
            let numerator = unprocessedStack.shift(), // Numerator
            denominator = unprocessedStack.shift();
            // Denominator
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
 * Function expression processor
 */
_p[15] = {
    value: function(require) {
        let ScriptExtractor = _p.r(17);
        // Process function interface
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
 * Integration function processor
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
            // Argument configuration call
            info.callFn = {
                setType: [ count | 0 ]
            };
            delete info.handler;
            return info;
        };
    }
};

/*!
 * Common superscript/subscript extractor
 */
_p[17] = {
    value: function() {
        return {
            exec: function(stack) {
                // Extract superscript/subscript
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
 * Double-struck processing
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
 * Script/Cursive style processing
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
 * Fraktur/Old German style processing
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
 * Roman style processing
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
 * Superscript/subscript operator function processing
 */
_p[22] = {
    value: function() {
        // Process function interface
        return function(info, processedStack, unprocessedStack) {
            let base = processedStack.pop(), script = unprocessedStack.shift() || null;
            if (!script) {
                throw new Error("Missing script");
            }
            base = base || "";
            if (base.name === info.name || base.name === "script") {
                throw new Error("script error");
            }
            // Execute replacement
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
            // Delete processor
            delete info.handler;
            return info;
        };
    }
};

/*!
 * Square root function processor
 */
_p[23] = {
    value: function(require) {
        let mergeHandler = _p.r(13);
        // Process function interface
        return function(info, processedStack, unprocessedStack) {
            let exponent = unprocessedStack.shift(), tmp = null, // Radicand
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
 * Summation function processor
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
 * Kity Formula Latex parser implementation
 */
/* jshint forin: false */
}
