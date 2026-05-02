// @ts-nocheck

type KityFormulaRuntimeWindow = Window &
  typeof globalThis & {
    kf?: Record<string, unknown> & {
      ResourceManager?: unknown;
    };
    kity?: unknown;
    __kityFormulaRequire__?: (id: string) => unknown;
    __kityFormulaUse__?: (id: string) => unknown;
  };

let installed = false;
import { createExpressionClass } from './expression';
import { createEmptyExpressionClass } from './empty-expression';
import { createCompoundExpressionClass } from './compound-expression';
import { createBinaryExpressionClass } from './binary-expression';
import { createCombinationExpressionClass } from './combination-expression';
import { createScriptExpressionClass } from './script-expression';
import { createSubscriptExpressionClass } from './subscript-expression';
import { createSuperscriptExpressionClass } from './superscript-expression';
import { createFractionExpressionClass } from './fraction-expression';
import { createFunctionExpressionClass } from './function-expression';
import { createIntegrationExpressionClass } from './integration-expression';
import { createRadicalExpressionClass } from './radical-expression';
import { createSummationExpressionClass } from './summation-expression';
import { createScriptControllerClass } from './script-controller';
import { createBracketsExpressionClass } from './brackets-expression';
import { createBracketsOperatorClass } from './brackets-operator';
import { createCombinationOperatorClass } from './combination-operator';
import { createFractionOperatorClass } from './fraction-operator';
import { createFunctionOperatorClass } from './function-operator';
import { createIntegrationOperatorClass } from './integration-operator';
import { createRadicalOperatorClass } from './radical-operator';
import { createScriptOperatorClass } from './script-operator';
import { createSummationOperatorClass } from './summation-operator';
import { createOperatorClass } from './operator';
import { createSignGroupClass } from './signgroup';
import { createTextExpressionClass } from './text-expression';
import { createFontInstallerClass } from './font-installer';
import { createFPaperClass } from './fpaper';
import { createFormulaClass } from './formula';
import { createResourceManager } from './resource-manager';
import { GTYPE } from './gtype';
import { SCRIPT_TYPE } from './script-type';
import { CHAR_CONF } from './char-conf';
import { CHAR_MAP } from './char-map';
import { createCharClass } from './char';
import { FONT_CHECKER_TEMPLATE } from './font-checker-template';
import { createTextFactory } from './text-factory';
import { createFontManager } from './font-manager';
import { createSysconf } from './sysconf';
import { createTextClass } from './text';
import { createOutputClass } from './output';
import { createCanvgRuntime } from './canvg-runtime';
import { KF_AMS_BB_FONT_MAP } from './font-map-kf-ams-bb';
import { KF_AMS_CAL_FONT_MAP } from './font-map-kf-ams-cal';
import { KF_AMS_FRAK_FONT_MAP } from './font-map-kf-ams-frak';
import { KF_AMS_MAIN_FONT_MAP } from './font-map-kf-ams-main';
import { KF_AMS_ROMAN_FONT_MAP } from './font-map-kf-ams-roman';

export function installLegacyKityFormulaRuntime(target: KityFormulaRuntimeWindow = window) {
  if (installed && target.kf?.ResourceManager && target.__kityFormulaRequire__) {
    return target.kf;
  }

  const window = target as any;
  const kity = window.kity;
/*!
 * ====================================================
 * Kity Formula - v1.0.0 - 2014-06-23
 * https://github.com/kitygraph/formula
 * GitHub: https://github.com/kitygraph/formula.git 
 * Copyright (c) 2014 Baidu Kity Group; Licensed MIT
 * ====================================================
 */
/**
 * cmd 内部定义
 * build�?
 */

// 模块存储
var _modules = {};

function define ( id, deps, factory ) {

    _modules[ id ] = {

        exports: {},
        value: null,
        factory: null

    };

    if ( arguments.length === 2 ) {

        factory = deps;

    }

    if ( _modules.toString.call( factory ) === '[object Object]' ) {

        _modules[ id ][ 'value' ] = factory;

    } else if ( typeof factory === 'function' ) {

        _modules[ id ][ 'factory' ] = factory;

    } else {

        throw new Error( 'define函数未定义的行为' );

    }

}

function require ( id ) {

    var module = _modules[ id ],
        exports = null;

    if ( !module ) {

        return null;

    }

    if ( module.value ) {

        return module.value;

    }

    exports = module.factory.call( null, require, module.exports, module );

    // return 值不为空�?则以return值为最终�?
    if ( exports ) {

        module.exports = exports;

    }

    module.value = module.exports;

    return module.value;

}

function use ( id ) {

    return require( id );

}

window.__kityFormulaRequire__ = require;
window.__kityFormulaUse__ = use;

define("base/canvg", [], function(require) {
    return createCanvgRuntime();
});define("base/output", [ "kity", "base/canvg" ], function(require) {
    var kity = require("kity"), canvg = require("base/canvg");
    return createOutputClass(kity, canvg);
});
define("char/char", [ "kity", "signgroup", "def/gtype" ], function(require, exports, module) {
    var kity = require("kity"), SignGroup = require("signgroup");
    return createCharClass(kity, SignGroup);
});define("char/conf", [], function(require) {
    return CHAR_CONF;
});
define("char/map", [], function(require) {
    return CHAR_MAP;
});define("char/text-factory", [ "kity" ], function(require) {
    var kity = require("kity");
    return createTextFactory(kity);
});
define("char/text", [ "kity", "sysconf", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman", "font/manager", "char/text-factory", "signgroup", "def/gtype" ], function(require, exports, module) {
    var kity = require("kity"), FONT_CONF = require("sysconf").font, FontManager = require("font/manager"), TextFactory = require("char/text-factory"), SignGroup = require("signgroup");
    return createTextClass(kity, FONT_CONF, FontManager, TextFactory, SignGroup);
});
define("def/gtype", [], function() {
    return GTYPE;
});
define("def/script-type", [], function() {
    return SCRIPT_TYPE;
});
define("expression/compound-exp/binary-exp/subscript", [ "kity", "expression/compound-exp/script", "operator/script", "expression/compound" ], function(require, exports, modules) {
    var kity = require("kity"), ScriptExpression = require("expression/compound-exp/script");
    return createSubscriptExpressionClass(kity, ScriptExpression);
});
define("expression/compound-exp/binary-exp/superscript", [ "kity", "expression/compound-exp/script", "operator/script", "expression/compound" ], function(require, exports, modules) {
    var kity = require("kity"), ScriptExpression = require("expression/compound-exp/script");
    return createSuperscriptExpressionClass(kity, ScriptExpression);
});
define("expression/compound-exp/binary", [ "kity", "expression/compound", "def/gtype", "expression/expression" ], function(require, exports, modules) {
    var kity = require("kity"), CompoundExpression = require("expression/compound");
    return createBinaryExpressionClass(kity, CompoundExpression);
});
define("expression/compound-exp/brackets", [ "kity", "operator/brackets", "char/text", "font/manager", "operator/operator", "expression/compound", "def/gtype", "expression/expression" ], function(require, exports, modules) {
    var kity = require("kity"), BracketsOperator = require("operator/brackets"), CompoundExpression = require("expression/compound");
    return createBracketsExpressionClass(kity, CompoundExpression, BracketsOperator);
});
define("expression/compound-exp/combination", [ "kity", "sysconf", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman", "operator/combination", "operator/operator", "expression/compound", "def/gtype", "expression/expression" ], function(require, exports, modules) {
    var kity = require("kity"), FONT_CONF = require("sysconf").font, CombinationOperator = require("operator/combination"), CompoundExpression = require("expression/compound");
    return createCombinationExpressionClass(kity, FONT_CONF, CompoundExpression, CombinationOperator);
});
define("expression/compound-exp/fraction", [ "kity", "operator/fraction", "sysconf", "operator/operator", "expression/compound-exp/binary", "expression/compound" ], function(require, exports, modules) {
    var kity = require("kity"), FractionOperator = require("operator/fraction"), BinaryExpression = require("expression/compound-exp/binary");
    return createFractionExpressionClass(kity, BinaryExpression, FractionOperator);
});
define("expression/compound-exp/func", [ "kity", "sysconf", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman", "operator/func", "char/text", "operator/common/script-controller", "operator/operator", "expression/compound", "def/gtype", "expression/expression" ], function(require, exports, modules) {
    var kity = require("kity"), FUNC_CONF = require("sysconf").func, FunctionOperator = require("operator/func"), CompoundExpression = require("expression/compound");
    return createFunctionExpressionClass(kity, FUNC_CONF, CompoundExpression, FunctionOperator);
});
define("expression/compound-exp/integration", [ "kity", "operator/integration", "operator/common/script-controller", "operator/operator", "expression/compound", "def/gtype", "expression/expression" ], function(require, exports, modules) {
    var kity = require("kity"), IntegrationOperator = require("operator/integration"), CompoundExpression = require("expression/compound");
    return createIntegrationExpressionClass(kity, CompoundExpression, IntegrationOperator);
});
define("expression/compound-exp/radical", [ "kity", "operator/radical", "operator/operator", "expression/compound-exp/binary", "expression/compound" ], function(require, exports, modules) {
    var kity = require("kity"), RadicalOperator = require("operator/radical"), BinaryExpression = require("expression/compound-exp/binary");
    return createRadicalExpressionClass(kity, BinaryExpression, RadicalOperator);
});
define("expression/compound-exp/script", [ "kity", "operator/script", "operator/common/script-controller", "operator/operator", "expression/compound", "def/gtype", "expression/expression" ], function(require, exports, modules) {
    var kity = require("kity"), ScriptOperator = require("operator/script"), CompoundExpression = require("expression/compound");
    return createScriptExpressionClass(kity, CompoundExpression, ScriptOperator);
});
define("expression/compound-exp/summation", [ "kity", "operator/summation", "operator/common/script-controller", "operator/operator", "expression/compound", "def/gtype", "expression/expression" ], function(require, exports, modules) {
    var kity = require("kity"), SummationOperator = require("operator/summation"), CompoundExpression = require("expression/compound");
    return createSummationExpressionClass(kity, CompoundExpression, SummationOperator);
});
define("expression/compound", [ "kity", "def/gtype", "expression/expression", "sysconf", "signgroup" ], function(require, exports, modules) {
    var kity = require("kity"), GTYPE = require("def/gtype"), Expression = require("expression/expression");
    return createCompoundExpressionClass(kity, GTYPE, Expression);
});
define("expression/empty", [ "kity", "sysconf", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman", "expression/expression", "def/gtype", "signgroup" ], function(require, exports, module) {
    var kity = require("kity"), FONT_CONF = require("sysconf").font, Expression = require("expression/expression");
    return createEmptyExpressionClass(kity, FONT_CONF, Expression);
});
define("expression/expression", [ "kity", "def/gtype", "sysconf", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman", "signgroup" ], function(require, exports, module) {
    var kity = require("kity"), GTYPE = require("def/gtype"), FONT_CONF = require("sysconf").font, SignGroup = require("signgroup");
    return createExpressionClass(kity, GTYPE, FONT_CONF, SignGroup);
});
define("expression/text", [ "char/text", "kity", "sysconf", "font/manager", "char/text-factory", "signgroup", "char/conf", "expression/expression", "def/gtype" ], function(require, exports, module) {
    var Text = require("char/text"), kity = require("kity"), FONT_CONF = require("char/conf"), Expression = require("expression/expression");
    return createTextExpressionClass(kity, FONT_CONF, Expression, Text);
});
define("font/checker-tpl", [], function(require) {
    return FONT_CHECKER_TEMPLATE;
});
define("font/installer", [ "kity", "font/manager", "sysconf", "jquery", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman", "font/checker-tpl" ], function(require) {
    var kity = require("kity"), FontManager = require("font/manager"), FONT_CONF = require("sysconf").font, checkerTemplate = require("font/checker-tpl");
    return createFontInstallerClass(kity, FontManager, FONT_CONF, checkerTemplate);
});
define("font/manager", [ "kity", "sysconf", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman" ], function(require) {
    var kity = require("kity"), CONF = require("sysconf").font.list;
    return createFontManager(kity, CONF);
});
define("font/map/kf-ams-bb", [], function(require) {
    return KF_AMS_BB_FONT_MAP;
});
define("font/map/kf-ams-cal", [], function(require) {
    return KF_AMS_CAL_FONT_MAP;
});
define("font/map/kf-ams-frak", [], function(require) {
    return KF_AMS_FRAK_FONT_MAP;
});
define("font/map/kf-ams-main", [], function(require) {
    return KF_AMS_MAIN_FONT_MAP;
});
define("font/map/kf-ams-roman", [], function(require) {
    return KF_AMS_ROMAN_FONT_MAP;
});
define("formula", [ "kity", "def/gtype", "font/manager", "sysconf", "font/installer", "font/checker-tpl", "base/output", "base/canvg", "fpaper" ], function(require, exports, module) {
    var kity = require("kity"), GTYPE = require("def/gtype"), FontManager = require("font/manager"), FontInstaller = require("font/installer"), FPaper = require("fpaper"), Output = require("base/output");
    return createFormulaClass(kity, GTYPE, FontManager, FontInstaller, FPaper, Output);
});
define("fpaper", [ "kity" ], function(require, exports, module) {
    var kity = require("kity");
    return createFPaperClass(kity);
});
define("jquery", [], function(require, exports, module) {
    if (!window.jQuery) {
        throw new Error("Missing jQuery");
    }
    return window.jQuery;
});
define("kity", [], function(require, exports, module) {
    if (!window.kity) {
        throw new Error("Missing Kity Graphic Lib");
    }
    return window.kity;
});
define("operator/brackets", [ "kity", "char/text", "sysconf", "font/manager", "char/text-factory", "signgroup", "operator/operator", "def/gtype" ], function(require, exports, modules) {
    var kity = require("kity"), Text = require("char/text"), Operator = require("operator/operator");
    return createBracketsOperatorClass(kity, Operator, Text);
});
define("operator/combination", [ "kity", "operator/operator", "def/gtype", "signgroup" ], function(require, exports, modules) {
    var kity = require("kity"), Operator = require("operator/operator");
    return createCombinationOperatorClass(kity, Operator);
});
define("operator/common/script-controller", [ "kity", "expression/empty", "sysconf", "expression/expression" ], function(require) {
    var kity = require("kity"), EmptyExpression = require("expression/empty");
    return createScriptControllerClass(kity, EmptyExpression);
});
define("operator/fraction", [ "kity", "sysconf", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman", "operator/operator", "def/gtype", "signgroup" ], function(require, exports, modules) {
    var kity = require("kity"), ZOOM = require("sysconf").zoom, Operator = require("operator/operator");
    return createFractionOperatorClass(kity, ZOOM, Operator);
});
define("operator/func", [ "kity", "char/text", "sysconf", "font/manager", "char/text-factory", "signgroup", "operator/common/script-controller", "expression/empty", "operator/operator", "def/gtype" ], function(require, exports, modules) {
    var kity = require("kity"), Text = require("char/text"), ScriptController = require("operator/common/script-controller"), Operator = require("operator/operator");
    return createFunctionOperatorClass(kity, Operator, Text, ScriptController);
});
define("operator/integration", [ "kity", "operator/common/script-controller", "expression/empty", "operator/operator", "def/gtype", "signgroup" ], function(require, exports, modules) {
    var kity = require("kity"), ScriptController = require("operator/common/script-controller"), Operator = require("operator/operator");
    return createIntegrationOperatorClass(kity, Operator, ScriptController);
});
define("operator/operator", [ "kity", "def/gtype", "signgroup" ], function(require, exports, modules) {
    var kity = require("kity"), GTYPE = require("def/gtype"), SignGroup = require("signgroup");
    return createOperatorClass(kity, GTYPE, SignGroup);
});
define("operator/radical", [ "kity", "operator/operator", "def/gtype", "signgroup" ], function(require, exports, modules) {
    var kity = require("kity"), Operator = require("operator/operator");
    return createRadicalOperatorClass(kity, Operator);
});
define("operator/script", [ "kity", "operator/common/script-controller", "expression/empty", "operator/operator", "def/gtype", "signgroup" ], function(require, exports, module) {
    var kity = require("kity"), ScriptController = require("operator/common/script-controller"), Operator = require("operator/operator");
    return createScriptOperatorClass(kity, Operator, ScriptController);
});
define("operator/summation", [ "kity", "operator/common/script-controller", "expression/empty", "operator/operator", "def/gtype", "signgroup" ], function(require, exports, modules) {
    var kity = require("kity"), ScriptController = require("operator/common/script-controller"), Operator = require("operator/operator");
    return createSummationOperatorClass(kity, Operator, ScriptController);
});
define("resource-manager", [ "kity", "sysconf", "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman", "font/installer", "font/manager", "jquery", "font/checker-tpl", "formula", "def/gtype", "base/output", "fpaper" ], function(require) {
    var kity = require("kity"), RES_CONF = require("sysconf").resource, FontInstall = require("font/installer"), Formula = require("formula");
    return createResourceManager(kity, RES_CONF, FontInstall, Formula);
});
define("signgroup", [ "kity", "def/gtype" ], function(require, exports, module) {
    var kity = require("kity"), GTYPE = require("def/gtype");
    return createSignGroupClass(kity, GTYPE);
});
define("sysconf", [ "font/map/kf-ams-main", "font/map/kf-ams-cal", "font/map/kf-ams-frak", "font/map/kf-ams-bb", "font/map/kf-ams-roman" ], function(require) {
    return createSysconf([ require("font/map/kf-ams-main"), require("font/map/kf-ams-cal"), require("font/map/kf-ams-frak"), require("font/map/kf-ams-bb"), require("font/map/kf-ams-roman") ]);
});

/**
 * 模块暴露
 */

( function ( global ) {

    var oldGetRenderBox = kity.Shape.getRenderBox;

    kity.extendClass(kity.Shape, {
        getFixRenderBox: function () {
            return this.getRenderBox( this.container.container );
        },

        getTranslate: function () {
            return this.transform.translate;
        }
    });

    define( 'kf.start', function ( require ) {

        global.kf = {

            // base
            ResourceManager: require( "resource-manager" ),
            Operator: require( "operator/operator" ),

            // expression
            Expression: require( "expression/expression" ),
            CompoundExpression: require( "expression/compound" ),
            TextExpression: require( "expression/text" ),
            EmptyExpression: require( "expression/empty" ),
            CombinationExpression: require( "expression/compound-exp/combination" ),
            FunctionExpression: require( "expression/compound-exp/func" ),

            FractionExpression: require( "expression/compound-exp/fraction" ),
            IntegrationExpression: require( "expression/compound-exp/integration" ),
            RadicalExpression: require( "expression/compound-exp/radical" ),
            ScriptExpression: require( "expression/compound-exp/script" ),
            SuperscriptExpression: require( "expression/compound-exp/binary-exp/superscript" ),
            SubscriptExpression: require( "expression/compound-exp/binary-exp/subscript" ),
            SummationExpression: require( "expression/compound-exp/summation" ),

            // Brackets expressoin
            BracketsExpression: require( "expression/compound-exp/brackets" )

        };

    } );

    // build环境中才含有use
    try {
        use( 'kf.start' );
    } catch ( e ) {
    }

})( target );
  installed = true;
  return target.kf;
}

export default installLegacyKityFormulaRuntime;
