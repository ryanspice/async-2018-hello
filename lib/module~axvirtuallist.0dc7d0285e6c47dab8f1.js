(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("axvirtuallist", [], factory);
	else if(typeof exports === 'object')
		exports["axvirtuallist"] = factory();
	else
		root["axvirtuallist"] = factory();
})(window, function() {
return (window["jsonasync2018"] = window["jsonasync2018"] || []).push([["axvirtuallist"],{

/***/ "../async.2018/node_modules/loglevel/lib/loglevel.js":
/*!***********************************************************!*\
  !*** ../async.2018/node_modules/loglevel/lib/loglevel.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (true) {
        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function () {
    "use strict";

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType) return;

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType) return;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    return defaultLogger;
}));


/***/ }),

/***/ "../async.2018/src/core/def/loop.js":
/*!******************************************!*\
  !*** ../async.2018/src/core/def/loop.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global,factory){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports,__webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else { var mod; }})(this,function(_exports,_defineProperty2){"use strict";var _interopRequireDefault=__webpack_require__(/*! ./node_modules/@babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0,_defineProperty2=_interopRequireDefault(_defineProperty2);/*
	self contained, loop
*/let _loop_iterator,_data=[],_length=0,_iterator=0,_iteratorId=0,_action=()=>{};/**/const _dataMap=[];/**/class _template{constructor(id,value){return(0,_defineProperty2.default)(this,"id",void 0),(0,_defineProperty2.default)(this,"value",void 0),this.id=id,this.value=value,this}}/**/const _dataTemplate=async function(i,data){return await(_dataMap[i]=await new _template(i,data))},_layer=async function(){return _iteratorId++,_data[_iterator]=await _dataTemplate(_iterator,_data[_iterator]),_data[_iterator]},_loop=async function(data,action){if(null===_data)for(_loop_iterator=_data.length=0,_loop_iterator;0<=_loop_iterator;_loop_iterator--)_data[_loop_iterator]=_dataTemplate(-1,{});for(_data=data[0],_length=_data.length||0,_action=action,_iterator;_iterator<_length;_iterator++)await _action((await _layer()));_iterator=0};/**/_exports.default=_loop});

/***/ }),

/***/ "../async.2018/src/core/def/pipe.js":
/*!******************************************!*\
  !*** ../async.2018/src/core/def/pipe.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global,factory){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports,__webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js"),__webpack_require__(/*! ./loop */ "../async.2018/src/core/def/loop.js"),__webpack_require__(/*! loglevel */ "../async.2018/node_modules/loglevel/lib/loglevel.js"),__webpack_require__(/*! ../template/empty.data */ "../async.2018/src/core/template/empty.data.js"),__webpack_require__(/*! ./utils */ "../async.2018/src/core/def/utils.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else { var mod; }})(this,function(_exports,_defineProperty2,_loop,_loglevel,_empty,_utils){"use strict";var _interopRequireDefault=__webpack_require__(/*! ./node_modules/@babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");Object.defineProperty(_exports,"__esModule",{value:!0}),Object.defineProperty(_exports,"data",{enumerable:!0,get:function get(){return _empty.default}}),_exports.mvc=_exports.view=_exports.pipe=void 0,_defineProperty2=_interopRequireDefault(_defineProperty2),_loop=_interopRequireDefault(_loop),_loglevel=_interopRequireDefault(_loglevel),_empty=_interopRequireDefault(_empty);let trace=0;const _props=["id","ref","value","class","className","click","mounted","onclick","onresize","oninput","activity","innerHTML"];class pipe{constructor(template=mvc.entry,pre=pipe.pre,post=pipe.post){(0,_defineProperty2.default)(this,"context",document),(0,_defineProperty2.default)(this,"template",_empty.default),(0,_defineProperty2.default)(this,"props",_props),(0,_defineProperty2.default)(this,"elms",[]),(0,_defineProperty2.default)(this,"defer",[]),(0,_defineProperty2.default)(this,"elements",[]),(0,_defineProperty2.default)(this,"trace",0),(0,_defineProperty2.default)(this,"scrollcount",0),(0,_defineProperty2.default)(this,"createTemplateItem",async item=>{const element=await this.createElementOfType(item.value);element&&(this.elms[item.id]=this.elements[item.id]=element,element.template=item.id)}),(0,_defineProperty2.default)(this,"check",async temp=>{const id=temp.id;let elm=this.elms[id];if(elm&&elm.renderTo){switch(typeof elm.renderTo){case"string":let a=this.elms[id];elm=this.elms[id]=await this.createElementOfType(a);}///NOT FOR PROD
if(this.scrollcount++,"scroll"==elm.renderTo.id){if(0==elm.renderTo.children.length)return void elm.renderTo.appendChild(elm,null);//APPEND PLUS ( usually at end ) TAKEOUT
if(elm.renderTo.appendBefore=(element,t)=>{element.parentNode.insertBefore(t,element)},elm.renderTo.appendAfter=(element,t)=>{element.parentNode.insertBefore(t,element.nextSibling)},"plus"==elm.id)return void elm.renderTo.appendBefore(elm.renderTo.children[0],elm);elm.renderTo.insertBefore(elm,elm.renderTo.children[0].nextSibling)}else this.elms[id].renderTo.appendChild(this.elms[id],null);this.elms[id].mounted&&this.elms[id].mounted(temp,this),this.elms[id]=null}}),(0,_defineProperty2.default)(this,"mounted",()=>{//console.log('eh', this, evt)
});const ors=this.context.onreadystatechange;return(this.context.state=0,"complete"===this.context.readyState)?(ors&&ors(),pre&&pre(),post&&post(),this.template[0]=template,void this.init()):void(this.context.onreadystatechange=async()=>{switch(ors&&ors(),this.context.state){case 0:pre&&pre(),this.context.state++;break;case 1:post&&post(),this.context.state++,this.template[0]=template,this.init();}})}a(){trace--}async init(){return this.context=document,await this.iterateTemplate()}async update(){await trace--,this.defer.length=0,this.elms.length=0,this.template[0]=await window["async-2018-mvc"].entry.filter(elm=>elm.id!==+elm.id),await this.init()}/*
        Iterate template data and generate html
    */async iterateTemplate(){//log.info('iterateTemplate' + trace, this.template);
return trace?(_loglevel.default.warn("renderer::"+trace),_loglevel.default.warn("renderer::"+trace),!1):(trace++,await(0,_loop.default)(this.template,this.createTemplateItem),await(0,_loop.default)(this.template,this.check),this.elms=await this.defer,await(0,_loop.default)([this.defer],this.createTemplateItem),await(0,_loop.default)(this.template,this.check),this.elms=this.defer,!(0<(this.defer=await this.elms.filter(elm=>elm?elm.ref:null)).length)||(trace--,this.template=await[this.defer],this.defer=[],this.elms=await[],await this.iterateTemplate()));//trace--;
}/*
        Create a DOM element in memory
    */async createElementOfType(template){const type=template.type;type||_loglevel.default.warn("Async.2018 tried to render an `undefined` element");const target=await this.createRenderTarget(template);target||_loglevel.default.warn("Async.2018 cannot find a target to render to");const elm=await this.context.createElement(template.type);switch(elm||_loglevel.default.warn("Async.2018 could not create element",template),elm.ref=template.ref,elm.afterConstruct=template.afterConstruct,type){case"style":elm.innerHTML=template.value,elm.renderTo=await this.context.head;break;default:elm.oninput=template.oninput,template.onclick&&(elm.onclick=evt=>{evt.stopPropagation(),"function"==typeof template.onclick?template.onclick():(console.warn("eval disabled"),eval(template.onclick))}),elm.setAttribute("style",template.style),elm.value=template.value,elm.renderTo=target;}//Defer template item
return"2430"===target?(await this.defer.push(template),!1):(await this.populateProps(this.props,template,elm),this.afterConstruct(elm),elm);//Populate Props
}/*
        Generate a reference to the target element, or body if none
    */async createRenderTarget(template){//Verify if rendering target exists
return null!=template.renderTo&&null==this.context.querySelectorAll(template.renderTo)[0]?"2430":this.context.querySelectorAll(template.renderTo)[0]||this.context.body;//Return querySelected element, fallback on body
//		if (template.renderTo!=undefined)
}/*
        Populate data props on elements
    */async populateProps(props,template,elm){for(let prop in props){const temp=props[prop];template[temp]&&(elm[temp]=template[temp])}}/*
        Generate elements based on TemplateItem
    */ /*
        HOOKS
    */afterConstruct(elm){elm.afterConstruct?elm.afterConstruct():null}/*
    */}/**
 * controller for the async view
 */_exports.pipe=pipe,(0,_defineProperty2.default)(pipe,"pre",()=>{}),(0,_defineProperty2.default)(pipe,"post",()=>{});class mvcc{constructor(){return(0,_defineProperty2.default)(this,"count",0),(0,_defineProperty2.default)(this,"append",val=>this.entry=val),window["async-2018-mvc"]?(_loglevel.default.warn("DUPLICATE MVC INSTANCES"),this):window["async-2018-mvc"]=this}get entry(){return mvcc.entries}set entry(val){this.count++,mvcc.entries.push(val)}get last(){return mvcc.entries[this.count-1]}//append = (val) => log.debug(`async-2018 :: ./entry.js`, (this.entry = val));
}/**
 * tooling functions
 */(0,_defineProperty2.default)(mvcc,"options",{prefix:!0,prefixName:"ax-"}),(0,_defineProperty2.default)(mvcc,"ref",void 0),(0,_defineProperty2.default)(mvcc,"entries",[]);const _c=new mvcc,_mvc=e=>_c[e],_mvcCmd=e=>_mvc(e),_mvcAppend=e=>_mvcCmd("append")(e),_mvcLast=()=>_mvcCmd("last"),mvc=(()=>_c)();_exports.mvc=mvc;const _mvcId=()=>(mvcc.options.prefix?mvcc.options.prefixName:"")+(0,_utils.MD5)("".concat(_c.count))+"";class view{constructor(val){return(0,_defineProperty2.default)(this,"mvc",_c),this.assign(val)}assign(val){return _mvcAppend(Object.assign({ref:this,type:"template",style:"",id:_mvcId()},val)),_mvcLast()}}_exports.view=view});

/***/ }),

/***/ "../async.2018/src/core/def/utils.js":
/*!*******************************************!*\
  !*** ../async.2018/src/core/def/utils.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global,factory){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else { var mod; }})(this,function(_exports){"use strict";Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.MD5=void 0,Object.prototype.insertAfter=function(newNode){this.parentNode.insertBefore(newNode,this.nextSibling)};_exports.MD5=function MD5(string){function RotateLeft(lValue,iShiftBits){return lValue<<iShiftBits|lValue>>>32-iShiftBits}function AddUnsigned(lX,lY){var lX4,lY4,lX8,lY8,lResult;return lX8=2147483648&lX,lY8=2147483648&lY,lX4=1073741824&lX,lY4=1073741824&lY,lResult=(1073741823&lX)+(1073741823&lY),lX4&lY4?2147483648^lResult^lX8^lY8:lX4|lY4?1073741824&lResult?3221225472^lResult^lX8^lY8:1073741824^lResult^lX8^lY8:lResult^lX8^lY8}function F(x,y,z){return x&y|~x&z}function G(x,y,z){return x&z|y&~z}function H(x,y,z){return x^y^z}function I(x,y,z){return y^(x|~z)}function FF(a,b,c,d,x,s,ac){return a=AddUnsigned(a,AddUnsigned(AddUnsigned(F(b,c,d),x),ac)),AddUnsigned(RotateLeft(a,s),b)}function GG(a,b,c,d,x,s,ac){return a=AddUnsigned(a,AddUnsigned(AddUnsigned(G(b,c,d),x),ac)),AddUnsigned(RotateLeft(a,s),b)}function HH(a,b,c,d,x,s,ac){return a=AddUnsigned(a,AddUnsigned(AddUnsigned(H(b,c,d),x),ac)),AddUnsigned(RotateLeft(a,s),b)}function II(a,b,c,d,x,s,ac){return a=AddUnsigned(a,AddUnsigned(AddUnsigned(I(b,c,d),x),ac)),AddUnsigned(RotateLeft(a,s),b)}function ConvertToWordArray(string){for(var lWordCount,lMessageLength=string.length,lNumberOfWords_temp1=lMessageLength+8,lNumberOfWords=16*((lNumberOfWords_temp1-lNumberOfWords_temp1%64)/64+1),lWordArray=Array(lNumberOfWords-1),lBytePosition=0,lByteCount=0;lByteCount<lMessageLength;)lWordCount=(lByteCount-lByteCount%4)/4,lBytePosition=8*(lByteCount%4),lWordArray[lWordCount]|=string.charCodeAt(lByteCount)<<lBytePosition,lByteCount++;return lWordCount=(lByteCount-lByteCount%4)/4,lBytePosition=8*(lByteCount%4),lWordArray[lWordCount]|=128<<lBytePosition,lWordArray[lNumberOfWords-2]=lMessageLength<<3,lWordArray[lNumberOfWords-1]=lMessageLength>>>29,lWordArray}function WordToHex(lValue){var lByte,lCount,WordToHexValue="",WordToHexValue_temp="";for(lCount=0;3>=lCount;lCount++)lByte=255&lValue>>>8*lCount,WordToHexValue_temp="0"+lByte.toString(16),WordToHexValue+=WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);return WordToHexValue}function Utf8Encode(string){string=string.replace(/\r\n/g,"\n");for(var c,utftext="",n=0;n<string.length;n++)c=string.charCodeAt(n),128>c?utftext+=String.fromCharCode(c):127<c&&2048>c?(utftext+=String.fromCharCode(192|c>>6),utftext+=String.fromCharCode(128|63&c)):(utftext+=String.fromCharCode(224|c>>12),utftext+=String.fromCharCode(128|63&c>>6),utftext+=String.fromCharCode(128|63&c));return utftext}var k,AA,BB,CC,DD,a,b,c,d,x=[],S11=7,S12=12,S13=17,S14=22,S21=5,S22=9,S23=14,S24=20,S31=4,S32=11,S33=16,S34=23,S41=6,S42=10,S43=15,S44=21;for(string=Utf8Encode(string),x=ConvertToWordArray(string),a=1732584193,b=4023233417,c=2562383102,d=271733878,k=0;k<x.length;k+=16)AA=a,BB=b,CC=c,DD=d,a=FF(a,b,c,d,x[k+0],S11,3614090360),d=FF(d,a,b,c,x[k+1],S12,3905402710),c=FF(c,d,a,b,x[k+2],S13,606105819),b=FF(b,c,d,a,x[k+3],S14,3250441966),a=FF(a,b,c,d,x[k+4],S11,4118548399),d=FF(d,a,b,c,x[k+5],S12,1200080426),c=FF(c,d,a,b,x[k+6],S13,2821735955),b=FF(b,c,d,a,x[k+7],S14,4249261313),a=FF(a,b,c,d,x[k+8],S11,1770035416),d=FF(d,a,b,c,x[k+9],S12,2336552879),c=FF(c,d,a,b,x[k+10],S13,4294925233),b=FF(b,c,d,a,x[k+11],S14,2304563134),a=FF(a,b,c,d,x[k+12],S11,1804603682),d=FF(d,a,b,c,x[k+13],S12,4254626195),c=FF(c,d,a,b,x[k+14],S13,2792965006),b=FF(b,c,d,a,x[k+15],S14,1236535329),a=GG(a,b,c,d,x[k+1],S21,4129170786),d=GG(d,a,b,c,x[k+6],S22,3225465664),c=GG(c,d,a,b,x[k+11],S23,643717713),b=GG(b,c,d,a,x[k+0],S24,3921069994),a=GG(a,b,c,d,x[k+5],S21,3593408605),d=GG(d,a,b,c,x[k+10],S22,38016083),c=GG(c,d,a,b,x[k+15],S23,3634488961),b=GG(b,c,d,a,x[k+4],S24,3889429448),a=GG(a,b,c,d,x[k+9],S21,568446438),d=GG(d,a,b,c,x[k+14],S22,3275163606),c=GG(c,d,a,b,x[k+3],S23,4107603335),b=GG(b,c,d,a,x[k+8],S24,1163531501),a=GG(a,b,c,d,x[k+13],S21,2850285829),d=GG(d,a,b,c,x[k+2],S22,4243563512),c=GG(c,d,a,b,x[k+7],S23,1735328473),b=GG(b,c,d,a,x[k+12],S24,2368359562),a=HH(a,b,c,d,x[k+5],S31,4294588738),d=HH(d,a,b,c,x[k+8],S32,2272392833),c=HH(c,d,a,b,x[k+11],S33,1839030562),b=HH(b,c,d,a,x[k+14],S34,4259657740),a=HH(a,b,c,d,x[k+1],S31,2763975236),d=HH(d,a,b,c,x[k+4],S32,1272893353),c=HH(c,d,a,b,x[k+7],S33,4139469664),b=HH(b,c,d,a,x[k+10],S34,3200236656),a=HH(a,b,c,d,x[k+13],S31,681279174),d=HH(d,a,b,c,x[k+0],S32,3936430074),c=HH(c,d,a,b,x[k+3],S33,3572445317),b=HH(b,c,d,a,x[k+6],S34,76029189),a=HH(a,b,c,d,x[k+9],S31,3654602809),d=HH(d,a,b,c,x[k+12],S32,3873151461),c=HH(c,d,a,b,x[k+15],S33,530742520),b=HH(b,c,d,a,x[k+2],S34,3299628645),a=II(a,b,c,d,x[k+0],S41,4096336452),d=II(d,a,b,c,x[k+7],S42,1126891415),c=II(c,d,a,b,x[k+14],S43,2878612391),b=II(b,c,d,a,x[k+5],S44,4237533241),a=II(a,b,c,d,x[k+12],S41,1700485571),d=II(d,a,b,c,x[k+3],S42,2399980690),c=II(c,d,a,b,x[k+10],S43,4293915773),b=II(b,c,d,a,x[k+1],S44,2240044497),a=II(a,b,c,d,x[k+8],S41,1873313359),d=II(d,a,b,c,x[k+15],S42,4264355552),c=II(c,d,a,b,x[k+6],S43,2734768916),b=II(b,c,d,a,x[k+13],S44,1309151649),a=II(a,b,c,d,x[k+4],S41,4149444226),d=II(d,a,b,c,x[k+11],S42,3174756917),c=II(c,d,a,b,x[k+2],S43,718787259),b=II(b,c,d,a,x[k+9],S44,3951481745),a=AddUnsigned(a,AA),b=AddUnsigned(b,BB),c=AddUnsigned(c,CC),d=AddUnsigned(d,DD);var temp=WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);return temp.toLowerCase()}});

/***/ }),

/***/ "../async.2018/src/core/template/empty.data.js":
/*!*****************************************************!*\
  !*** ../async.2018/src/core/template/empty.data.js ***!
  \*****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global,factory){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else { var mod; }})(this,function(_exports){"use strict";Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0;_exports.default=[{type:"section",style:"text-align:center;",innerHTML:"\n\t\t\t<p>No Template Loaded</p>\n\t\t"}]});

/***/ }),

/***/ "../async.2018/src/index.js":
/*!**********************************!*\
  !*** ../async.2018/src/index.js ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global,factory){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports,__webpack_require__(/*! ./core/def/pipe */ "../async.2018/src/core/def/pipe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else { var mod; }})(this,function(_exports,_pipe){"use strict";Object.defineProperty(_exports,"__esModule",{value:!0}),Object.defineProperty(_exports,"data",{enumerable:!0,get:function get(){return _pipe.data}}),Object.defineProperty(_exports,"pipe",{enumerable:!0,get:function get(){return _pipe.pipe}}),Object.defineProperty(_exports,"view",{enumerable:!0,get:function get(){return _pipe.view}}),Object.defineProperty(_exports,"mvc",{enumerable:!0,get:function get(){return _pipe.mvc}})});

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/defineProperty.js ***!
  \*******************************************************************/
/*! exports provided: default */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _defineProperty; });
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \**********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;

/***/ }),

/***/ "./src/entry.js":
/*!**********************!*\
  !*** ./src/entry.js ***!
  \**********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global,factory){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports,__webpack_require__(/*! async.2018/src */ "../async.2018/src/index.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else { var mod; }})(this,function(_exports,_src){"use strict";Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.AsyncController=_exports.AsyncView=_exports.AsyncTemplate=_exports.default=void 0;const AsyncTemplate=_src.pipe;_exports.AsyncTemplate=AsyncTemplate;const AsyncView=_src.view;_exports.AsyncView=AsyncView;const AsyncController=_src.mvc;/**
 * exports
 */_exports.AsyncController=AsyncController;_exports.default=AsyncTemplate});

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global,factory){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports,__webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js"),__webpack_require__(/*! ./utils.js */ "./src/utils.js"),__webpack_require__(/*! ./entry */ "./src/entry.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else { var mod; }})(this,function(_exports,_defineProperty2,_utils,_entry){"use strict";var _interopRequireDefault=__webpack_require__(/*! ./node_modules/@babel/runtime/helpers/interopRequireDefault */ "./node_modules/@babel/runtime/helpers/interopRequireDefault.js");Object.defineProperty(_exports,"__esModule",{value:!0}),Object.defineProperty(_exports,"AsyncTemplate",{enumerable:!0,get:function get(){return _entry.AsyncTemplate}}),_exports.default=_exports.template=void 0,_defineProperty2=_interopRequireDefault(_defineProperty2);const data=[];let index=0;for(var i=0;125>=i;i++)data.push({id:i,tag:Math.random(i*i),time:new Date().getTime()});const template=new _entry.AsyncTemplate;_exports.template=template;let divs;const elementHeight=2*115.88,getHeight=()=>Math.floor(1.2*(window.innerHeight/elementHeight)),getMaxHeight=elementHeight=>window.innerHeight-2*elementHeight+"px";/**
 * asynx VirtualScroll component
 * -appends and prepends elements to limit memory
 * @type {[type]}
 */class VirtualScroll extends _entry.AsyncView{constructor(...args){super(...args),(0,_defineProperty2.default)(this,"type","virtual-scroll"),(0,_defineProperty2.default)(this,"innerHTML","<template></template>"),(0,_defineProperty2.default)(this,"mounted",async function(){this.style.maxHeight=getMaxHeight(elementHeight);//Push Items
for(let i=0;i<=getHeight()+6;i++)data[i]&&(template.a(),template.template[0]=await[await new VirtualItem(data[i])],await template.iterateTemplate());/**
		 * append and prepend on scroll
		 * @param  {[type]}  event [description]
		 * @return {Promise}       [description]
		 */ // RESIZING
//
// Add additional dom elements when resizing the page larger
//  - no compensation for smarller
divs=await this.getElementsByTagName("virtual-item"),this.addEventListener("scroll",async()=>{if(0<index&&0<this.children[1].getClientRects()[0].y+elementHeight)return index--,1>=this.scrollTop&&(this.scrollTop+=1),await VirtualItem.UpdateItem(divs[divs.length-1],data[index]),void(await divs[divs.length-1].appendBefore(divs[0]));if(index<data.length-getHeight()-1&&this.children[divs.length].getClientRects()[0].y+elementHeight<window.innerHeight){index++,await VirtualItem.UpdateItem(divs[0],data[index+getHeight()+1]);let b=this.children[divs.length];return void(await divs[0].appendAfter(b))}this.scrollTop=Math.floor(10*this.scrollTop)/10}),window.addEventListener("optimizedResize",async()=>{this.style.maxHeight=getMaxHeight(elementHeight);for(let i=0;1>i;i++)await template.a(),template.defer=await[],template.template[0]=await[await new VirtualItem(data[i+divs.length])],await index++,await template.iterateTemplate();divs=await this.getElementsByTagName("virtual-item"),index=0})})}}/**
 * Elemented Rendered inside of VirtualList
 * @extends AsyncView
 */_exports.default=VirtualScroll;class VirtualItem extends _entry.AsyncView{/**
	 * updates a given item
	 * @param  {[type]} item [description]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */ //style:string = ``;
/**
	 * element information values are passed through the DATA parameter
	 * @param {[type]} data [description]
	 */constructor(data){var _temp;return _temp=super({innerHTML:"<svg class=\"feather feather-x sc-dnqmqq jxshSx\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" data-reactid=\"1376\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line></svg>\n\t\t\t<img width=\"".concat(elementHeight,"\" height=\"").concat(elementHeight,"\" style=\"float:left;\" src=\"./assets/150.png\" srcs=\"https://picsum.photos/").concat(elementHeight,"/?random").concat(data.time,"\"/> <h3>").concat(data.id,"</h3><p>").concat(data.time,"</p>")}),(0,_defineProperty2.default)(this,"type","virtual-item"),(0,_defineProperty2.default)(this,"renderTo","virtual-scroll"),(0,_defineProperty2.default)(this,"mounted",()=>{//console.log(data);
//console.log(this);
}),_temp}/**
	 * triggers when element is visible on page
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */}(0,_defineProperty2.default)(VirtualItem,"UpdateItem",async function(item,data){item.getElementsByTagName("h3")[0].innerText=data.id,item.getElementsByTagName("p")[0].innerText=data.tag})});

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(global,factory){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else {}})(this,function(){"use strict";Element.prototype.appendAfter=function(element){element.parentNode.insertBefore(this,element.nextSibling)},!1,Element.prototype.appendBefore=function(element){element.parentNode.insertBefore(this,element)},!1,function(){/* init - you can init any event */(function throttle(type,name,obj){obj=obj||window;var running=!1,func=function(){running||(running=!0,requestAnimationFrame(function(){obj.dispatchEvent(new CustomEvent(name)),running=!1}))};obj.addEventListener(type,func)})("resize","optimizedResize")}()});

/***/ })

},[["./src/index.js","axvirtuallist.entry"]]]);
});
//# sourceMappingURL=module~axvirtuallist.0dc7d0285e6c47dab8f1.js.map