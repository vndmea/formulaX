// @ts-nocheck
import { legacyBoxType } from '../vendor/legacy-box-type';
import { legacyEleType } from '../vendor/legacy-ele-type';
import { legacyOtherPosition } from '../vendor/other-position';
import { resolveToolbarAssetPath } from '../toolbar-assets';
import { resolveUnicode } from '../formula-symbols';
import {
  DEFAULT_FORMULAX_LOCALE,
  normalizeFormulaXLocale,
  type FormulaXLocale,
} from '../i18n';

type ToolbarConfig = Record<string, any>;

type ToolbarCollection = ToolbarConfig[];

const UI_ELE_TYPE = legacyEleType;
const BOX_TYPE = legacyBoxType;
const OTHER_POSITION = legacyOtherPosition;

const zhCnToEnUsText = new Map<string, string>([
  ['预设', 'Presets'],
  ['预设公式', 'Preset formulas'],
  ['二次公式', 'Quadratic formula'],
  ['二项式定理', 'Binomial theorem'],
  ['勾股定理', 'Pythagorean theorem'],
  ['基础数学', 'Basic math'],
  ['希腊字母', 'Greek letters'],
  ['求反关系运算符', 'Negated operators'],
  ['字母类符号', 'Letter-like symbols'],
  ['箭头', 'Arrows'],
  ['手写体', 'Script'],
  ['分数', 'Fraction'],
  ['常用分数', 'Common fractions'],
  ['上下标', 'Scripts'],
  ['上标和下标', 'Superscripts and subscripts'],
  ['常用的上标和下标', 'Common superscripts and subscripts'],
  ['根式', 'Radicals'],
  ['常用根式', 'Common radicals'],
  ['积分', 'Integrals'],
  ['大型运算符', 'Large operators'],
  ['求和', 'Summations'],
  ['括号', 'Brackets'],
  ['方括号', 'Brackets'],
  ['函数', 'Functions'],
  ['三角函数', 'Trigonometric functions'],
  ['常用函数', 'Common functions'],
  ['小写', 'Lowercase'],
  ['大写', 'Uppercase'],
  ['变体', 'Variants'],
  ['花体', 'Fraktur'],
  ['双线', 'Double-struck'],
  ['罗马', 'Roman'],
]);

function each<T>(list: T[] | Record<string, T>, callback: (item: T, index: number | string) => void) {
  if (Array.isArray(list)) {
    list.forEach((item, index) => callback(item, index));
    return;
  }

  Object.keys(list).forEach((key) => callback(list[key], key));
}

function translateToolbarText(value: string, locale: FormulaXLocale) {
  if (locale === 'zh_CN') {
    return value;
  }

  const normalizedValue = value.replace(/<br\s*\/?>/gi, '').trim();
  const translatedValue = zhCnToEnUsText.get(normalizedValue);

  if (!translatedValue) {
    return value;
  }

  const lineBreakMatch = value.match(/<br\s*\/?>/i);
  return lineBreakMatch ? `${translatedValue}${lineBreakMatch[0]}` : translatedValue;
}

function localizeToolbarConfig(value: unknown, locale: FormulaXLocale): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => localizeToolbarConfig(item, locale));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const result: Record<string, unknown> = {};

  for (const [key, currentValue] of Object.entries(value)) {
    if ((key === 'label' || key === 'title') && typeof currentValue === 'string') {
      result[key] = translateToolbarText(currentValue, locale);
      continue;
    }

    result[key] = localizeToolbarConfig(currentValue, locale);
  }

  return result;
}

const baseToolbarConfig: ToolbarCollection = [ {
        type: UI_ELE_TYPE.DRAPDOWN_BOX,
        options: {
            button: {
                label: '预设<br/>',
                className: 'yushe-btn',
                icon: {
                    src: resolveToolbarAssetPath("btn.png"),
                    x: 0,
                    y: 0
                },
                iconSize: {
                    w: 40
                }
            },
            box: {
                width: 367,
                group: [ {
                    title: "预设公式",
                    items: [ {
                        title: "预设公式",
                        content: [ {
                            label: "二次公式",
                            item: {
                                val: "x=\\frac {-b\\pm\\sqrt {b^2-4ac}}{2a}"
                            }
                        }, {
                            label: "二项式定理",
                            item: {
                                val: "{\\left(x+a\\right)}^2=\\sum^n_{k=0}{\\left(^n_k\\right)x^ka^{n-k}}"
                            }
                        }, {
                            label: "勾股定理",
                            item: {
                                val: "a^2+b^2=c^2"
                            }
                        } ]
                    } ]
                } ]
            }
        }
    }, {
        type: UI_ELE_TYPE.DELIMITER
    }, {
        type: UI_ELE_TYPE.AREA,
        options: {
            box: {
                fixOffset: true,
                width: 527,
                type: BOX_TYPE.OVERLAP,
                group: [ {
                    title: "基础数学",
                    items: []
                }, {
                    title: "希腊字母",
                    items: []
                }, {
                    title: "求反关系运算符",
                    items: []
                }, {
                    title: "字母类符号",
                    items: []
                }, {
                    title: "箭头",
                    items: []
                }, {
                    title: "手写体",
                    items: []
                } ]
            }
        }
    }, {
        type: UI_ELE_TYPE.DELIMITER
    }, {
        type: UI_ELE_TYPE.DRAPDOWN_BOX,
        options: {
            button: {
                label: "分数<br/>",
                icon: {
                    src: resolveToolbarAssetPath("btn.png"),
                    x: 45,
                    y: 0
                }
            },
            box: {
                width: 332,
                group: [ {
                    title: "分数",
                    items: [ {
                        title: "分数",
                        content: [ {
                            item: {
                                val: "\\frac \\placeholder\\placeholder"
                            }
                        }, {
                            item: {
                                val: "{\\placeholder/\\placeholder}"
                            }
                        } ]
                    }, {
                        title: "常用分数",
                        content: [ {
                            item: {
                                val: "\\frac {dy}{dx}"
                            }
                        }, {
                            item: {
                                val: "\\frac {\\Delta y}{\\Delta x}"
                            }
                        }, {
                            item: {
                                val: "\\frac {\\delta y}{\\delta x}"
                            }
                        }, {
                            item: {
                                val: "\\frac \\pi 2"
                            }
                        } ]
                    } ]
                } ]
            }
        }
    }, {
        type: UI_ELE_TYPE.DRAPDOWN_BOX,
        options: {
            button: {
                label: "上下标<br/>",
                icon: {
                    src: resolveToolbarAssetPath("btn.png"),
                    x: 82,
                    y: 0
                }
            },
            box: {
                width: 332,
                group: [ {
                    title: "上标和下标",
                    items: [ {
                        title: "上标和下标",
                        content: [ {
                            item: {
                                val: "\\placeholder^\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\placeholder_\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\placeholder^\\placeholder_\\placeholder"
                            }
                        }, {
                            item: {
                                val: "{^\\placeholder_\\placeholder\\placeholder}"
                            }
                        } ]
                    }, {
                        title: "常用的上标和下标",
                        content: [ {
                            item: {
                                val: "e^{-i\\omega t}"
                            }
                        }, {
                            item: {
                                val: "x^2"
                            }
                        }, {
                            item: {
                                val: "{}^n_1Y"
                            }
                        } ]
                    } ]
                } ]
            }
        }
    }, {
        type: UI_ELE_TYPE.DRAPDOWN_BOX,
        options: {
            button: {
                label: "根式<br/>",
                icon: {
                    src: resolveToolbarAssetPath("btn.png"),
                    x: 119,
                    y: 0
                }
            },
            box: {
                width: 342,
                group: [ {
                    title: "根式",
                    items: [ {
                        title: "根式",
                        content: [ {
                            item: {
                                val: "\\sqrt \\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\sqrt [\\placeholder] \\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\sqrt [2] \\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\sqrt [3] \\placeholder"
                            }
                        } ]
                    }, {
                        title: "常用根式",
                        content: [ {
                            item: {
                                val: "\\frac {-b\\pm\\sqrt{b^2-4ac}}{2a}"
                            }
                        }, {
                            item: {
                                val: "\\sqrt {a^2+b^2}"
                            }
                        } ]
                    } ]
                } ]
            }
        }
    }, {
        type: UI_ELE_TYPE.DRAPDOWN_BOX,
        options: {
            button: {
                label: "积分<br/>",
                icon: {
                    src: resolveToolbarAssetPath("btn.png"),
                    x: 156,
                    y: 0
                }
            },
            box: {
                width: 332,
                group: [ {
                    title: "积分",
                    items: [ {
                        title: "积分",
                        content: [ {
                            item: {
                                val: "\\int \\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\int^\\placeholder_\\placeholder\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\iint\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\iint^\\placeholder_\\placeholder\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\iiint\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\iiint^\\placeholder_\\placeholder\\placeholder"
                            }
                        } ]
                    } ]
                } ]
            }
        }
    }, {
        type: UI_ELE_TYPE.DRAPDOWN_BOX,
        options: {
            button: {
                label: "大型<br/>运算符",
                icon: {
                    src: resolveToolbarAssetPath("btn.png"),
                    x: 193,
                    y: 0
                }
            },
            box: {
                width: 332,
                group: [ {
                    title: "求和",
                    items: [ {
                        title: "求和",
                        content: [ {
                            item: {
                                val: "\\sum\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\sum^\\placeholder_\\placeholder\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\sum_\\placeholder\\placeholder"
                            }
                        } ]
                    } ]
                } ]
            }
        }
    }, {
        type: UI_ELE_TYPE.DRAPDOWN_BOX,
        options: {
            button: {
                label: "括号<br/>",
                icon: {
                    src: resolveToolbarAssetPath("btn.png"),
                    x: 230,
                    y: 0
                }
            },
            box: {
                width: 332,
                group: [ {
                    title: "方括号",
                    items: [ {
                        title: "方括号",
                        content: [ {
                            item: {
                                val: "\\left(\\placeholder\\right)"
                            }
                        }, {
                            item: {
                                val: "\\left[\\placeholder\\right]"
                            }
                        }, {
                            item: {
                                val: "\\left\\{\\placeholder\\right\\}"
                            }
                        }, {
                            item: {
                                val: "\\left|\\placeholder\\right|"
                            }
                        } ]
                    } ]
                } ]
            }
        }
    }, {
        type: UI_ELE_TYPE.DRAPDOWN_BOX,
        options: {
            button: {
                label: "函数<br/>",
                icon: {
                    src: resolveToolbarAssetPath("btn.png"),
                    x: 267,
                    y: 0
                }
            },
            box: {
                width: 340,
                group: [ {
                    title: "函数",
                    items: [ {
                        title: "三角函数",
                        content: [ {
                            item: {
                                val: "\\sin\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\cos\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\tan\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\csc\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\sec\\placeholder"
                            }
                        }, {
                            item: {
                                val: "\\cot\\placeholder"
                            }
                        } ]
                    }, {
                        title: "常用函数",
                        content: [ {
                            item: {
                                val: "\\sin\\theta"
                            }
                        }, {
                            item: {
                                val: "\\cos{2x}"
                            }
                        }, {
                            item: {
                                val: "\\tan\\theta=\\frac {\\sin\\theta}{\\cos\\theta}"
                            }
                        } ]
                    } ]
                } ]
            }
        }
    } ];

    //--------------------------------------------- Initialize items outside the special character area
    ( function () {

        let tmp = [],
            otherImageSrc = resolveToolbarAssetPath("other.png"),
            currentConf = [];

        each( baseToolbarConfig, function ( conf ) {

            if ( conf.type === UI_ELE_TYPE.DELIMITER ) {
                return;
            }

            conf = conf.options.box.group;

            tmp = tmp.concat( conf );

        } );

        each( tmp, function ( conf ) {

            conf = conf.items;

            for ( let i = 0, len = conf.length; i < len; i++ ) {
                currentConf = currentConf.concat( conf[ i ].content );
            }

        } );

        // Add positioning metadata
        each( currentConf, function ( conf ) {

            let data = OTHER_POSITION[ conf.item.val ];

            if ( !data ) {
                return;
            }

            conf.item.img = otherImageSrc;
            conf.item.pos = data.pos;
            conf.item.size = data.size;

        } );

    } )();

    //--------------------------------------------- Initialize the special character area
    // Basic mathematics
    ( function () {

        let list = [
                "pm", "infty", "=", "sim", "times", "div", "!", "<", "ll", ">",
                "gg", "leq", "geq", "mp", "cong", "equiv", "propto", "approx",
                "forall", "partial", "surd", "cup", "cap", "varnothing", "%",
                "circ", "exists", "nexists", "in", "ni", "gets", "uparrow",
                "to", "downarrow", "leftrightarrow", "therefore", "because",
                "+", "-", "neg", "ast", "cdot", "vdots",/* "ddots",*/ "aleph",
                "beth", "blacksquare"

            ],
            configList = baseToolbarConfig[ 2 ].options.box.group[ 0 ].items;

        configList.push( {
            title: "基础数学",
            content: getUnicodeContents( list )
        } );

    } )();

    // Greek character configuration
    ( function () {

        let greekList = [ {
                title: "小写",
                values: [ "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega" ]
            }, {
                title: "大写",
                values: [ "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega" ]
            }, {
                title: "变体",
                values: [ "digamma", "varepsilon", "varkappa", "varphi", "varpi", "varrho", "varsigma", "vartheta" ]
            } ],
            greekConfigList = baseToolbarConfig[ 2 ].options.box.group[ 1 ].items;

        // Lowercase handling
        greekConfigList.push( {
            title: greekList[ 0 ].title,
            content: getUnicodeContents( greekList[ 0 ].values )
        } );

        // Uppercase handling
        greekConfigList.push( {
            title: greekList[ 1 ].title,
            content: getUnicodeContents( greekList[ 1 ].values )
        } );

        // Variant handling
        greekConfigList.push( {
            title: greekList[ 2 ].title,
            content: getUnicodeContents( greekList[ 2 ].values )
        } );

    } )();

    // Negated operators
    ( function () {

        let greekList = [ {
                title: "求反关系运算符",
                values: [
                    "neq", "nless", "ngtr", "nleq", "ngeq", "nsim", "lneqq",
                    "gneqq", "nprec", "nsucc", "notin", "nsubseteq", "nsupseteq",
                    "subsetneq", "supsetneq", "lnsim", "gnsim", "precnsim",
                    "succnsim", "ntriangleleft", "ntriangleright", "ntrianglelefteq",
                    "ntrianglerighteq", "nmid", "nparallel", "nvdash", "nVdash",
                    "nvDash", "nVDash", "nexists"
                ]
            } ],
            greekConfigList = baseToolbarConfig[ 2 ].options.box.group[ 2 ].items;

        greekConfigList.push( {
            title: greekList[ 0 ].title,
            content: getUnicodeContents( greekList[ 0 ].values )
        } );

    } )();

    // Letter-like symbols
    ( function () {

        let list = [
                "aleph", "beth", "daleth", "gimel", "complement", "ell", "eth", "hbar",
                "hslash", "mho", "partial", "wp", "circledS", "Bbbk", "Finv", "Game",
                "Im", "Re"
            ],
            configList = baseToolbarConfig[ 2 ].options.box.group[ 3 ].items;

        configList.push( {
            title: "字母类符号",
            content: getUnicodeContents( list )
        } );

    } )();

    // Arrow symbols
    ( function () {

        let list = [
                "gets", "to", "uparrow", "downarrow", "leftrightarrow", "updownarrow",
                "Leftarrow", "Rightarrow", "Uparrow", "Downarrow", "Leftrightarrow",
                "Updownarrow", "longleftarrow", "longrightarrow", "longleftrightarrow",
                "Longleftarrow", "Longrightarrow", "Longleftrightarrow", "nearrow",
                "nwarrow", "searrow", "swarrow", "nleftarrow", "nrightarrow",
                "nLeftarrow", "nRightarrow", "nLeftrightarrow", "leftharpoonup",
                "leftharpoondown", "rightharpoonup", "rightharpoondown", "upharpoonleft",
                "upharpoonright", "downharpoonleft",
                "downharpoonright", "leftrightharpoons", "rightleftharpoons", "leftleftarrows",
                "rightrightarrows", "upuparrows", "downdownarrows", "leftrightarrows",
                "rightleftarrows", "looparrowleft", "looparrowright", "leftarrowtail",
                "rightarrowtail", "Lsh", "Rsh", "Lleftarrow", "Rrightarrow", "curvearrowleft",
                "curvearrowright", "circlearrowleft", "circlearrowright", "multimap",
                "leftrightsquigarrow", "twoheadleftarrow", "twoheadrightarrow", "rightsquigarrow"
            ],
            configList = baseToolbarConfig[ 2 ].options.box.group[ 4 ].items;

        configList.push( {
            title: "箭头",
            content: getUnicodeContents( list )
        } );

    } )();

    // Script styles
    ( function () {

        let list = [ {
                title: "手写体",
                values: [
                    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
                    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
                    "Y", "Z" ]
            }, {
                title: "花体",
                values: [
                    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
                    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
                    "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
                    "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
                    "w", "x", "y", "z"
                ]
            }, {
                title: "双线",
                values: [
                    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
                    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
                    "Y", "Z"
                ]
            }, {
                title: "罗马",
                values: [
                    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
                    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
                    "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
                    "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
                    "w", "x", "y", "z"
                ]
            } ],
            configList = baseToolbarConfig[ 2 ].options.box.group[ 5 ].items;

        each( list[ 0 ].values, function ( item, index ) {

            list[ 0 ].values[ index ] = "mathcal{" + item + "}";

        } );

        each( list[ 1 ].values, function ( item, index ) {

            list[ 1 ].values[ index ] = "mathfrak{" + item + "}";

        } );

        each( list[ 2 ].values, function ( item, index ) {

            list[ 2 ].values[ index ] = "mathbb{" + item + "}";

        } );

        each( list[ 3 ].values, function ( item, index ) {

            list[ 3 ].values[ index ] = "mathrm{" + item + "}";

        } );

        // Script-style glyphs
        configList.push( {
            title: list[ 0 ].title,
            content: getUnicodeContents( list[ 0 ].values )
        } );

        configList.push( {
            title: list[ 1 ].title,
            content: getUnicodeContents( list[ 1 ].values )
        } );

        configList.push( {
            title: list[ 2 ].title,
            content: getUnicodeContents( list[ 2 ].values )
        } );

        configList.push( {
            title: list[ 3 ].title,
            content: getUnicodeContents( list[ 3 ].values )
        } );

    } )();

    function getUnicodeContents ( keySet ) {

        let result = [];

        each( keySet, function ( key ) {

            let displayKey = key;

            if ( key.length > 1 ) {
                displayKey = "\\" + key;
            }

            const resolved = resolveUnicode(displayKey);
            const item: any = {
                key: displayKey,
                unicode: resolved ? resolved.char : displayKey
            };
            if (resolved?.fontFamily) {
                item.unicodeFont = resolved.fontFamily;
            }
            result.push( item );

        } );

        return result;

    }

export function createToolbarConfig(locale: FormulaXLocale = DEFAULT_FORMULAX_LOCALE): ToolbarCollection {
    return localizeToolbarConfig(
        baseToolbarConfig,
        normalizeFormulaXLocale(locale),
    ) as ToolbarCollection;
}

export default createToolbarConfig;
