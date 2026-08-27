(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) =>
    function __require() {
      return (
        mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
        mod.exports
      );
    };
  var __export = (target, all) => {
    for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === 'object') || typeof from === 'function') {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (
    (target = mod != null ? __create(__getProtoOf(mod)) : {}),
    __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule
        ? __defProp(target, 'default', { value: mod, enumerable: true })
        : target,
      mod
    )
  );

  // packages/core/node_modules/ajv/dist/compile/codegen/code.js
  var require_code = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/codegen/code.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.regexpCode =
        exports.getEsmExportName =
        exports.getProperty =
        exports.safeStringify =
        exports.stringify =
        exports.strConcat =
        exports.addCodeArg =
        exports.str =
        exports._ =
        exports.nil =
        exports._Code =
        exports.Name =
        exports.IDENTIFIER =
        exports._CodeOrName =
          void 0;
      var _CodeOrName = class {};
      exports._CodeOrName = _CodeOrName;
      exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
      var Name = class extends _CodeOrName {
        constructor(s) {
          super();
          if (!exports.IDENTIFIER.test(s))
            throw new Error('CodeGen: name must be a valid identifier');
          this.str = s;
        }
        toString() {
          return this.str;
        }
        emptyStr() {
          return false;
        }
        get names() {
          return { [this.str]: 1 };
        }
      };
      exports.Name = Name;
      var _Code = class extends _CodeOrName {
        constructor(code) {
          super();
          this._items = typeof code === 'string' ? [code] : code;
        }
        toString() {
          return this.str;
        }
        emptyStr() {
          if (this._items.length > 1) return false;
          const item = this._items[0];
          return item === '' || item === '""';
        }
        get str() {
          var _a;
          return (_a = this._str) !== null && _a !== void 0
            ? _a
            : (this._str = this._items.reduce((s, c) => `${s}${c}`, ''));
        }
        get names() {
          var _a;
          return (_a = this._names) !== null && _a !== void 0
            ? _a
            : (this._names = this._items.reduce((names, c) => {
                if (c instanceof Name) names[c.str] = (names[c.str] || 0) + 1;
                return names;
              }, {}));
        }
      };
      exports._Code = _Code;
      exports.nil = new _Code('');
      function _(strs, ...args) {
        const code = [strs[0]];
        let i = 0;
        while (i < args.length) {
          addCodeArg(code, args[i]);
          code.push(strs[++i]);
        }
        return new _Code(code);
      }
      exports._ = _;
      var plus = new _Code('+');
      function str(strs, ...args) {
        const expr = [safeStringify(strs[0])];
        let i = 0;
        while (i < args.length) {
          expr.push(plus);
          addCodeArg(expr, args[i]);
          expr.push(plus, safeStringify(strs[++i]));
        }
        optimize(expr);
        return new _Code(expr);
      }
      exports.str = str;
      function addCodeArg(code, arg) {
        if (arg instanceof _Code) code.push(...arg._items);
        else if (arg instanceof Name) code.push(arg);
        else code.push(interpolate(arg));
      }
      exports.addCodeArg = addCodeArg;
      function optimize(expr) {
        let i = 1;
        while (i < expr.length - 1) {
          if (expr[i] === plus) {
            const res = mergeExprItems(expr[i - 1], expr[i + 1]);
            if (res !== void 0) {
              expr.splice(i - 1, 3, res);
              continue;
            }
            expr[i++] = '+';
          }
          i++;
        }
      }
      function mergeExprItems(a, b) {
        if (b === '""') return a;
        if (a === '""') return b;
        if (typeof a == 'string') {
          if (b instanceof Name || a[a.length - 1] !== '"') return;
          if (typeof b != 'string') return `${a.slice(0, -1)}${b}"`;
          if (b[0] === '"') return a.slice(0, -1) + b.slice(1);
          return;
        }
        if (typeof b == 'string' && b[0] === '"' && !(a instanceof Name))
          return `"${a}${b.slice(1)}`;
        return;
      }
      function strConcat(c1, c2) {
        return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
      }
      exports.strConcat = strConcat;
      function interpolate(x) {
        return typeof x == 'number' || typeof x == 'boolean' || x === null
          ? x
          : safeStringify(Array.isArray(x) ? x.join(',') : x);
      }
      function stringify(x) {
        return new _Code(safeStringify(x));
      }
      exports.stringify = stringify;
      function safeStringify(x) {
        return JSON.stringify(x)
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029');
      }
      exports.safeStringify = safeStringify;
      function getProperty(key) {
        return typeof key == 'string' && exports.IDENTIFIER.test(key)
          ? new _Code(`.${key}`)
          : _`[${key}]`;
      }
      exports.getProperty = getProperty;
      function getEsmExportName(key) {
        if (typeof key == 'string' && exports.IDENTIFIER.test(key)) {
          return new _Code(`${key}`);
        }
        throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
      }
      exports.getEsmExportName = getEsmExportName;
      function regexpCode(rx) {
        return new _Code(rx.toString());
      }
      exports.regexpCode = regexpCode;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/codegen/scope.js
  var require_scope = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/codegen/scope.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.ValueScope =
        exports.ValueScopeName =
        exports.Scope =
        exports.varKinds =
        exports.UsedValueState =
          void 0;
      var code_1 = require_code();
      var ValueError = class extends Error {
        constructor(name) {
          super(`CodeGen: "code" for ${name} not defined`);
          this.value = name.value;
        }
      };
      var UsedValueState;
      (function (UsedValueState2) {
        UsedValueState2[(UsedValueState2['Started'] = 0)] = 'Started';
        UsedValueState2[(UsedValueState2['Completed'] = 1)] = 'Completed';
      })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
      exports.varKinds = {
        const: new code_1.Name('const'),
        let: new code_1.Name('let'),
        var: new code_1.Name('var'),
      };
      var Scope = class {
        constructor({ prefixes, parent } = {}) {
          this._names = {};
          this._prefixes = prefixes;
          this._parent = parent;
        }
        toName(nameOrPrefix) {
          return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
        }
        name(prefix) {
          return new code_1.Name(this._newName(prefix));
        }
        _newName(prefix) {
          const ng = this._names[prefix] || this._nameGroup(prefix);
          return `${prefix}${ng.index++}`;
        }
        _nameGroup(prefix) {
          var _a, _b;
          if (
            ((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) ===
              null || _b === void 0
              ? void 0
              : _b.has(prefix)) ||
            (this._prefixes && !this._prefixes.has(prefix))
          ) {
            throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
          }
          return (this._names[prefix] = { prefix, index: 0 });
        }
      };
      exports.Scope = Scope;
      var ValueScopeName = class extends code_1.Name {
        constructor(prefix, nameStr) {
          super(nameStr);
          this.prefix = prefix;
        }
        setValue(value, { property, itemIndex }) {
          this.value = value;
          this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
        }
      };
      exports.ValueScopeName = ValueScopeName;
      var line = (0, code_1._)`\n`;
      var ValueScope = class extends Scope {
        constructor(opts) {
          super(opts);
          this._values = {};
          this._scope = opts.scope;
          this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
        }
        get() {
          return this._scope;
        }
        name(prefix) {
          return new ValueScopeName(prefix, this._newName(prefix));
        }
        value(nameOrPrefix, value) {
          var _a;
          if (value.ref === void 0) throw new Error('CodeGen: ref must be passed in value');
          const name = this.toName(nameOrPrefix);
          const { prefix } = name;
          const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
          let vs = this._values[prefix];
          if (vs) {
            const _name = vs.get(valueKey);
            if (_name) return _name;
          } else {
            vs = this._values[prefix] = /* @__PURE__ */ new Map();
          }
          vs.set(valueKey, name);
          const s = this._scope[prefix] || (this._scope[prefix] = []);
          const itemIndex = s.length;
          s[itemIndex] = value.ref;
          name.setValue(value, { property: prefix, itemIndex });
          return name;
        }
        getValue(prefix, keyOrRef) {
          const vs = this._values[prefix];
          if (!vs) return;
          return vs.get(keyOrRef);
        }
        scopeRefs(scopeName, values = this._values) {
          return this._reduceValues(values, name => {
            if (name.scopePath === void 0) throw new Error(`CodeGen: name "${name}" has no value`);
            return (0, code_1._)`${scopeName}${name.scopePath}`;
          });
        }
        scopeCode(values = this._values, usedValues, getCode) {
          return this._reduceValues(
            values,
            name => {
              if (name.value === void 0) throw new Error(`CodeGen: name "${name}" has no value`);
              return name.value.code;
            },
            usedValues,
            getCode
          );
        }
        _reduceValues(values, valueCode, usedValues = {}, getCode) {
          let code = code_1.nil;
          for (const prefix in values) {
            const vs = values[prefix];
            if (!vs) continue;
            const nameSet = (usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map());
            vs.forEach(name => {
              if (nameSet.has(name)) return;
              nameSet.set(name, UsedValueState.Started);
              let c = valueCode(name);
              if (c) {
                const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
                code = (0, code_1._)`${code}${def} ${name} = ${c};${this.opts._n}`;
              } else if ((c = getCode === null || getCode === void 0 ? void 0 : getCode(name))) {
                code = (0, code_1._)`${code}${c}${this.opts._n}`;
              } else {
                throw new ValueError(name);
              }
              nameSet.set(name, UsedValueState.Completed);
            });
          }
          return code;
        }
      };
      exports.ValueScope = ValueScope;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/codegen/index.js
  var require_codegen = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/codegen/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.or =
        exports.and =
        exports.not =
        exports.CodeGen =
        exports.operators =
        exports.varKinds =
        exports.ValueScopeName =
        exports.ValueScope =
        exports.Scope =
        exports.Name =
        exports.regexpCode =
        exports.stringify =
        exports.getProperty =
        exports.nil =
        exports.strConcat =
        exports.str =
        exports._ =
          void 0;
      var code_1 = require_code();
      var scope_1 = require_scope();
      var code_2 = require_code();
      Object.defineProperty(exports, '_', {
        enumerable: true,
        get: function () {
          return code_2._;
        },
      });
      Object.defineProperty(exports, 'str', {
        enumerable: true,
        get: function () {
          return code_2.str;
        },
      });
      Object.defineProperty(exports, 'strConcat', {
        enumerable: true,
        get: function () {
          return code_2.strConcat;
        },
      });
      Object.defineProperty(exports, 'nil', {
        enumerable: true,
        get: function () {
          return code_2.nil;
        },
      });
      Object.defineProperty(exports, 'getProperty', {
        enumerable: true,
        get: function () {
          return code_2.getProperty;
        },
      });
      Object.defineProperty(exports, 'stringify', {
        enumerable: true,
        get: function () {
          return code_2.stringify;
        },
      });
      Object.defineProperty(exports, 'regexpCode', {
        enumerable: true,
        get: function () {
          return code_2.regexpCode;
        },
      });
      Object.defineProperty(exports, 'Name', {
        enumerable: true,
        get: function () {
          return code_2.Name;
        },
      });
      var scope_2 = require_scope();
      Object.defineProperty(exports, 'Scope', {
        enumerable: true,
        get: function () {
          return scope_2.Scope;
        },
      });
      Object.defineProperty(exports, 'ValueScope', {
        enumerable: true,
        get: function () {
          return scope_2.ValueScope;
        },
      });
      Object.defineProperty(exports, 'ValueScopeName', {
        enumerable: true,
        get: function () {
          return scope_2.ValueScopeName;
        },
      });
      Object.defineProperty(exports, 'varKinds', {
        enumerable: true,
        get: function () {
          return scope_2.varKinds;
        },
      });
      exports.operators = {
        GT: new code_1._Code('>'),
        GTE: new code_1._Code('>='),
        LT: new code_1._Code('<'),
        LTE: new code_1._Code('<='),
        EQ: new code_1._Code('==='),
        NEQ: new code_1._Code('!=='),
        NOT: new code_1._Code('!'),
        OR: new code_1._Code('||'),
        AND: new code_1._Code('&&'),
        ADD: new code_1._Code('+'),
      };
      var Node = class {
        optimizeNodes() {
          return this;
        }
        optimizeNames(_names, _constants) {
          return this;
        }
      };
      var Def = class extends Node {
        constructor(varKind, name, rhs) {
          super();
          this.varKind = varKind;
          this.name = name;
          this.rhs = rhs;
        }
        render({ es5, _n }) {
          const varKind = es5 ? scope_1.varKinds.var : this.varKind;
          const rhs = this.rhs === void 0 ? '' : ` = ${this.rhs}`;
          return `${varKind} ${this.name}${rhs};` + _n;
        }
        optimizeNames(names, constants) {
          if (!names[this.name.str]) return;
          if (this.rhs) this.rhs = optimizeExpr(this.rhs, names, constants);
          return this;
        }
        get names() {
          return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
        }
      };
      var Assign = class extends Node {
        constructor(lhs, rhs, sideEffects) {
          super();
          this.lhs = lhs;
          this.rhs = rhs;
          this.sideEffects = sideEffects;
        }
        render({ _n }) {
          return `${this.lhs} = ${this.rhs};` + _n;
        }
        optimizeNames(names, constants) {
          if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects) return;
          this.rhs = optimizeExpr(this.rhs, names, constants);
          return this;
        }
        get names() {
          const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
          return addExprNames(names, this.rhs);
        }
      };
      var AssignOp = class extends Assign {
        constructor(lhs, op, rhs, sideEffects) {
          super(lhs, rhs, sideEffects);
          this.op = op;
        }
        render({ _n }) {
          return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
        }
      };
      var Label = class extends Node {
        constructor(label) {
          super();
          this.label = label;
          this.names = {};
        }
        render({ _n }) {
          return `${this.label}:` + _n;
        }
      };
      var Break = class extends Node {
        constructor(label) {
          super();
          this.label = label;
          this.names = {};
        }
        render({ _n }) {
          const label = this.label ? ` ${this.label}` : '';
          return `break${label};` + _n;
        }
      };
      var Throw = class extends Node {
        constructor(error) {
          super();
          this.error = error;
        }
        render({ _n }) {
          return `throw ${this.error};` + _n;
        }
        get names() {
          return this.error.names;
        }
      };
      var AnyCode = class extends Node {
        constructor(code) {
          super();
          this.code = code;
        }
        render({ _n }) {
          return `${this.code};` + _n;
        }
        optimizeNodes() {
          return `${this.code}` ? this : void 0;
        }
        optimizeNames(names, constants) {
          this.code = optimizeExpr(this.code, names, constants);
          return this;
        }
        get names() {
          return this.code instanceof code_1._CodeOrName ? this.code.names : {};
        }
      };
      var ParentNode = class extends Node {
        constructor(nodes = []) {
          super();
          this.nodes = nodes;
        }
        render(opts) {
          return this.nodes.reduce((code, n) => code + n.render(opts), '');
        }
        optimizeNodes() {
          const { nodes } = this;
          let i = nodes.length;
          while (i--) {
            const n = nodes[i].optimizeNodes();
            if (Array.isArray(n)) nodes.splice(i, 1, ...n);
            else if (n) nodes[i] = n;
            else nodes.splice(i, 1);
          }
          return nodes.length > 0 ? this : void 0;
        }
        optimizeNames(names, constants) {
          const { nodes } = this;
          let i = nodes.length;
          while (i--) {
            const n = nodes[i];
            if (n.optimizeNames(names, constants)) continue;
            subtractNames(names, n.names);
            nodes.splice(i, 1);
          }
          return nodes.length > 0 ? this : void 0;
        }
        get names() {
          return this.nodes.reduce((names, n) => addNames(names, n.names), {});
        }
      };
      var BlockNode = class extends ParentNode {
        render(opts) {
          return '{' + opts._n + super.render(opts) + '}' + opts._n;
        }
      };
      var Root = class extends ParentNode {};
      var Else = class extends BlockNode {};
      Else.kind = 'else';
      var If = class _If extends BlockNode {
        constructor(condition, nodes) {
          super(nodes);
          this.condition = condition;
        }
        render(opts) {
          let code = `if(${this.condition})` + super.render(opts);
          if (this.else) code += 'else ' + this.else.render(opts);
          return code;
        }
        optimizeNodes() {
          super.optimizeNodes();
          const cond = this.condition;
          if (cond === true) return this.nodes;
          let e = this.else;
          if (e) {
            const ns = e.optimizeNodes();
            e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
          }
          if (e) {
            if (cond === false) return e instanceof _If ? e : e.nodes;
            if (this.nodes.length) return this;
            return new _If(not(cond), e instanceof _If ? [e] : e.nodes);
          }
          if (cond === false || !this.nodes.length) return void 0;
          return this;
        }
        optimizeNames(names, constants) {
          var _a;
          this.else =
            (_a = this.else) === null || _a === void 0
              ? void 0
              : _a.optimizeNames(names, constants);
          if (!(super.optimizeNames(names, constants) || this.else)) return;
          this.condition = optimizeExpr(this.condition, names, constants);
          return this;
        }
        get names() {
          const names = super.names;
          addExprNames(names, this.condition);
          if (this.else) addNames(names, this.else.names);
          return names;
        }
      };
      If.kind = 'if';
      var For = class extends BlockNode {};
      For.kind = 'for';
      var ForLoop = class extends For {
        constructor(iteration) {
          super();
          this.iteration = iteration;
        }
        render(opts) {
          return `for(${this.iteration})` + super.render(opts);
        }
        optimizeNames(names, constants) {
          if (!super.optimizeNames(names, constants)) return;
          this.iteration = optimizeExpr(this.iteration, names, constants);
          return this;
        }
        get names() {
          return addNames(super.names, this.iteration.names);
        }
      };
      var ForRange = class extends For {
        constructor(varKind, name, from, to) {
          super();
          this.varKind = varKind;
          this.name = name;
          this.from = from;
          this.to = to;
        }
        render(opts) {
          const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
          const { name, from, to } = this;
          return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
        }
        get names() {
          const names = addExprNames(super.names, this.from);
          return addExprNames(names, this.to);
        }
      };
      var ForIter = class extends For {
        constructor(loop, varKind, name, iterable) {
          super();
          this.loop = loop;
          this.varKind = varKind;
          this.name = name;
          this.iterable = iterable;
        }
        render(opts) {
          return (
            `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts)
          );
        }
        optimizeNames(names, constants) {
          if (!super.optimizeNames(names, constants)) return;
          this.iterable = optimizeExpr(this.iterable, names, constants);
          return this;
        }
        get names() {
          return addNames(super.names, this.iterable.names);
        }
      };
      var Func = class extends BlockNode {
        constructor(name, args, async) {
          super();
          this.name = name;
          this.args = args;
          this.async = async;
        }
        render(opts) {
          const _async = this.async ? 'async ' : '';
          return `${_async}function ${this.name}(${this.args})` + super.render(opts);
        }
      };
      Func.kind = 'func';
      var Return = class extends ParentNode {
        render(opts) {
          return 'return ' + super.render(opts);
        }
      };
      Return.kind = 'return';
      var Try = class extends BlockNode {
        render(opts) {
          let code = 'try' + super.render(opts);
          if (this.catch) code += this.catch.render(opts);
          if (this.finally) code += this.finally.render(opts);
          return code;
        }
        optimizeNodes() {
          var _a, _b;
          super.optimizeNodes();
          (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
          (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
          return this;
        }
        optimizeNames(names, constants) {
          var _a, _b;
          super.optimizeNames(names, constants);
          (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
          (_b = this.finally) === null || _b === void 0
            ? void 0
            : _b.optimizeNames(names, constants);
          return this;
        }
        get names() {
          const names = super.names;
          if (this.catch) addNames(names, this.catch.names);
          if (this.finally) addNames(names, this.finally.names);
          return names;
        }
      };
      var Catch = class extends BlockNode {
        constructor(error) {
          super();
          this.error = error;
        }
        render(opts) {
          return `catch(${this.error})` + super.render(opts);
        }
      };
      Catch.kind = 'catch';
      var Finally = class extends BlockNode {
        render(opts) {
          return 'finally' + super.render(opts);
        }
      };
      Finally.kind = 'finally';
      var CodeGen = class {
        constructor(extScope, opts = {}) {
          this._values = {};
          this._blockStarts = [];
          this._constants = {};
          this.opts = { ...opts, _n: opts.lines ? '\n' : '' };
          this._extScope = extScope;
          this._scope = new scope_1.Scope({ parent: extScope });
          this._nodes = [new Root()];
        }
        toString() {
          return this._root.render(this.opts);
        }
        // returns unique name in the internal scope
        name(prefix) {
          return this._scope.name(prefix);
        }
        // reserves unique name in the external scope
        scopeName(prefix) {
          return this._extScope.name(prefix);
        }
        // reserves unique name in the external scope and assigns value to it
        scopeValue(prefixOrName, value) {
          const name = this._extScope.value(prefixOrName, value);
          const vs =
            this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
          vs.add(name);
          return name;
        }
        getScopeValue(prefix, keyOrRef) {
          return this._extScope.getValue(prefix, keyOrRef);
        }
        // return code that assigns values in the external scope to the names that are used internally
        // (same names that were returned by gen.scopeName or gen.scopeValue)
        scopeRefs(scopeName) {
          return this._extScope.scopeRefs(scopeName, this._values);
        }
        scopeCode() {
          return this._extScope.scopeCode(this._values);
        }
        _def(varKind, nameOrPrefix, rhs, constant) {
          const name = this._scope.toName(nameOrPrefix);
          if (rhs !== void 0 && constant) this._constants[name.str] = rhs;
          this._leafNode(new Def(varKind, name, rhs));
          return name;
        }
        // `const` declaration (`var` in es5 mode)
        const(nameOrPrefix, rhs, _constant) {
          return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
        }
        // `let` declaration with optional assignment (`var` in es5 mode)
        let(nameOrPrefix, rhs, _constant) {
          return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
        }
        // `var` declaration with optional assignment
        var(nameOrPrefix, rhs, _constant) {
          return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
        }
        // assignment code
        assign(lhs, rhs, sideEffects) {
          return this._leafNode(new Assign(lhs, rhs, sideEffects));
        }
        // `+=` code
        add(lhs, rhs) {
          return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
        }
        // appends passed SafeExpr to code or executes Block
        code(c) {
          if (typeof c == 'function') c();
          else if (c !== code_1.nil) this._leafNode(new AnyCode(c));
          return this;
        }
        // returns code for object literal for the passed argument list of key-value pairs
        object(...keyValues) {
          const code = ['{'];
          for (const [key, value] of keyValues) {
            if (code.length > 1) code.push(',');
            code.push(key);
            if (key !== value || this.opts.es5) {
              code.push(':');
              (0, code_1.addCodeArg)(code, value);
            }
          }
          code.push('}');
          return new code_1._Code(code);
        }
        // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
        if(condition, thenBody, elseBody) {
          this._blockNode(new If(condition));
          if (thenBody && elseBody) {
            this.code(thenBody).else().code(elseBody).endIf();
          } else if (thenBody) {
            this.code(thenBody).endIf();
          } else if (elseBody) {
            throw new Error('CodeGen: "else" body without "then" body');
          }
          return this;
        }
        // `else if` clause - invalid without `if` or after `else` clauses
        elseIf(condition) {
          return this._elseNode(new If(condition));
        }
        // `else` clause - only valid after `if` or `else if` clauses
        else() {
          return this._elseNode(new Else());
        }
        // end `if` statement (needed if gen.if was used only with condition)
        endIf() {
          return this._endBlockNode(If, Else);
        }
        _for(node, forBody) {
          this._blockNode(node);
          if (forBody) this.code(forBody).endFor();
          return this;
        }
        // a generic `for` clause (or statement if `forBody` is passed)
        for(iteration, forBody) {
          return this._for(new ForLoop(iteration), forBody);
        }
        // `for` statement for a range of values
        forRange(
          nameOrPrefix,
          from,
          to,
          forBody,
          varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let
        ) {
          const name = this._scope.toName(nameOrPrefix);
          return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
        }
        // `for-of` statement (in es5 mode replace with a normal for loop)
        forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
          const name = this._scope.toName(nameOrPrefix);
          if (this.opts.es5) {
            const arr = iterable instanceof code_1.Name ? iterable : this.var('_arr', iterable);
            return this.forRange('_i', 0, (0, code_1._)`${arr}.length`, i => {
              this.var(name, (0, code_1._)`${arr}[${i}]`);
              forBody(name);
            });
          }
          return this._for(new ForIter('of', varKind, name, iterable), () => forBody(name));
        }
        // `for-in` statement.
        // With option `ownProperties` replaced with a `for-of` loop for object keys
        forIn(
          nameOrPrefix,
          obj,
          forBody,
          varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const
        ) {
          if (this.opts.ownProperties) {
            return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
          }
          const name = this._scope.toName(nameOrPrefix);
          return this._for(new ForIter('in', varKind, name, obj), () => forBody(name));
        }
        // end `for` loop
        endFor() {
          return this._endBlockNode(For);
        }
        // `label` statement
        label(label) {
          return this._leafNode(new Label(label));
        }
        // `break` statement
        break(label) {
          return this._leafNode(new Break(label));
        }
        // `return` statement
        return(value) {
          const node = new Return();
          this._blockNode(node);
          this.code(value);
          if (node.nodes.length !== 1) throw new Error('CodeGen: "return" should have one node');
          return this._endBlockNode(Return);
        }
        // `try` statement
        try(tryBody, catchCode, finallyCode) {
          if (!catchCode && !finallyCode)
            throw new Error('CodeGen: "try" without "catch" and "finally"');
          const node = new Try();
          this._blockNode(node);
          this.code(tryBody);
          if (catchCode) {
            const error = this.name('e');
            this._currNode = node.catch = new Catch(error);
            catchCode(error);
          }
          if (finallyCode) {
            this._currNode = node.finally = new Finally();
            this.code(finallyCode);
          }
          return this._endBlockNode(Catch, Finally);
        }
        // `throw` statement
        throw(error) {
          return this._leafNode(new Throw(error));
        }
        // start self-balancing block
        block(body, nodeCount) {
          this._blockStarts.push(this._nodes.length);
          if (body) this.code(body).endBlock(nodeCount);
          return this;
        }
        // end the current self-balancing block
        endBlock(nodeCount) {
          const len = this._blockStarts.pop();
          if (len === void 0) throw new Error('CodeGen: not in self-balancing block');
          const toClose = this._nodes.length - len;
          if (toClose < 0 || (nodeCount !== void 0 && toClose !== nodeCount)) {
            throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
          }
          this._nodes.length = len;
          return this;
        }
        // `function` heading (or definition if funcBody is passed)
        func(name, args = code_1.nil, async, funcBody) {
          this._blockNode(new Func(name, args, async));
          if (funcBody) this.code(funcBody).endFunc();
          return this;
        }
        // end function definition
        endFunc() {
          return this._endBlockNode(Func);
        }
        optimize(n = 1) {
          while (n-- > 0) {
            this._root.optimizeNodes();
            this._root.optimizeNames(this._root.names, this._constants);
          }
        }
        _leafNode(node) {
          this._currNode.nodes.push(node);
          return this;
        }
        _blockNode(node) {
          this._currNode.nodes.push(node);
          this._nodes.push(node);
        }
        _endBlockNode(N1, N2) {
          const n = this._currNode;
          if (n instanceof N1 || (N2 && n instanceof N2)) {
            this._nodes.pop();
            return this;
          }
          throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
        }
        _elseNode(node) {
          const n = this._currNode;
          if (!(n instanceof If)) {
            throw new Error('CodeGen: "else" without "if"');
          }
          this._currNode = n.else = node;
          return this;
        }
        get _root() {
          return this._nodes[0];
        }
        get _currNode() {
          const ns = this._nodes;
          return ns[ns.length - 1];
        }
        set _currNode(node) {
          const ns = this._nodes;
          ns[ns.length - 1] = node;
        }
      };
      exports.CodeGen = CodeGen;
      function addNames(names, from) {
        for (const n in from) names[n] = (names[n] || 0) + (from[n] || 0);
        return names;
      }
      function addExprNames(names, from) {
        return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
      }
      function optimizeExpr(expr, names, constants) {
        if (expr instanceof code_1.Name) return replaceName(expr);
        if (!canOptimize(expr)) return expr;
        return new code_1._Code(
          expr._items.reduce((items, c) => {
            if (c instanceof code_1.Name) c = replaceName(c);
            if (c instanceof code_1._Code) items.push(...c._items);
            else items.push(c);
            return items;
          }, [])
        );
        function replaceName(n) {
          const c = constants[n.str];
          if (c === void 0 || names[n.str] !== 1) return n;
          delete names[n.str];
          return c;
        }
        function canOptimize(e) {
          return (
            e instanceof code_1._Code &&
            e._items.some(
              c => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== void 0
            )
          );
        }
      }
      function subtractNames(names, from) {
        for (const n in from) names[n] = (names[n] || 0) - (from[n] || 0);
      }
      function not(x) {
        return typeof x == 'boolean' || typeof x == 'number' || x === null
          ? !x
          : (0, code_1._)`!${par(x)}`;
      }
      exports.not = not;
      var andCode = mappend(exports.operators.AND);
      function and(...args) {
        return args.reduce(andCode);
      }
      exports.and = and;
      var orCode = mappend(exports.operators.OR);
      function or(...args) {
        return args.reduce(orCode);
      }
      exports.or = or;
      function mappend(op) {
        return (x, y) =>
          x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
      }
      function par(x) {
        return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
      }
    },
  });

  // packages/core/node_modules/ajv/dist/compile/util.js
  var require_util = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/util.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.checkStrictMode =
        exports.getErrorPath =
        exports.Type =
        exports.useFunc =
        exports.setEvaluated =
        exports.evaluatedPropsToName =
        exports.mergeEvaluated =
        exports.eachItem =
        exports.unescapeJsonPointer =
        exports.escapeJsonPointer =
        exports.escapeFragment =
        exports.unescapeFragment =
        exports.schemaRefOrVal =
        exports.schemaHasRulesButRef =
        exports.schemaHasRules =
        exports.checkUnknownRules =
        exports.alwaysValidSchema =
        exports.toHash =
          void 0;
      var codegen_1 = require_codegen();
      var code_1 = require_code();
      function toHash(arr) {
        const hash = {};
        for (const item of arr) hash[item] = true;
        return hash;
      }
      exports.toHash = toHash;
      function alwaysValidSchema(it, schema) {
        if (typeof schema == 'boolean') return schema;
        if (Object.keys(schema).length === 0) return true;
        checkUnknownRules(it, schema);
        return !schemaHasRules(schema, it.self.RULES.all);
      }
      exports.alwaysValidSchema = alwaysValidSchema;
      function checkUnknownRules(it, schema = it.schema) {
        const { opts, self: self2 } = it;
        if (!opts.strictSchema) return;
        if (typeof schema === 'boolean') return;
        const rules = self2.RULES.keywords;
        for (const key in schema) {
          if (!rules[key]) checkStrictMode(it, `unknown keyword: "${key}"`);
        }
      }
      exports.checkUnknownRules = checkUnknownRules;
      function schemaHasRules(schema, rules) {
        if (typeof schema == 'boolean') return !schema;
        for (const key in schema) if (rules[key]) return true;
        return false;
      }
      exports.schemaHasRules = schemaHasRules;
      function schemaHasRulesButRef(schema, RULES) {
        if (typeof schema == 'boolean') return !schema;
        for (const key in schema) if (key !== '$ref' && RULES.all[key]) return true;
        return false;
      }
      exports.schemaHasRulesButRef = schemaHasRulesButRef;
      function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
        if (!$data) {
          if (typeof schema == 'number' || typeof schema == 'boolean') return schema;
          if (typeof schema == 'string') return (0, codegen_1._)`${schema}`;
        }
        return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
      }
      exports.schemaRefOrVal = schemaRefOrVal;
      function unescapeFragment(str) {
        return unescapeJsonPointer(decodeURIComponent(str));
      }
      exports.unescapeFragment = unescapeFragment;
      function escapeFragment(str) {
        return encodeURIComponent(escapeJsonPointer(str));
      }
      exports.escapeFragment = escapeFragment;
      function escapeJsonPointer(str) {
        if (typeof str == 'number') return `${str}`;
        return str.replace(/~/g, '~0').replace(/\//g, '~1');
      }
      exports.escapeJsonPointer = escapeJsonPointer;
      function unescapeJsonPointer(str) {
        return str.replace(/~1/g, '/').replace(/~0/g, '~');
      }
      exports.unescapeJsonPointer = unescapeJsonPointer;
      function eachItem(xs, f) {
        if (Array.isArray(xs)) {
          for (const x of xs) f(x);
        } else {
          f(xs);
        }
      }
      exports.eachItem = eachItem;
      function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
        return (gen, from, to, toName) => {
          const res =
            to === void 0
              ? from
              : to instanceof codegen_1.Name
                ? (from instanceof codegen_1.Name
                    ? mergeNames(gen, from, to)
                    : mergeToName(gen, from, to),
                  to)
                : from instanceof codegen_1.Name
                  ? (mergeToName(gen, to, from), from)
                  : mergeValues(from, to);
          return toName === codegen_1.Name && !(res instanceof codegen_1.Name)
            ? resultToName(gen, res)
            : res;
        };
      }
      exports.mergeEvaluated = {
        props: makeMergeEvaluated({
          mergeNames: (gen, from, to) =>
            gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
              gen.if(
                (0, codegen_1._)`${from} === true`,
                () => gen.assign(to, true),
                () =>
                  gen
                    .assign(to, (0, codegen_1._)`${to} || {}`)
                    .code((0, codegen_1._)`Object.assign(${to}, ${from})`)
              );
            }),
          mergeToName: (gen, from, to) =>
            gen.if((0, codegen_1._)`${to} !== true`, () => {
              if (from === true) {
                gen.assign(to, true);
              } else {
                gen.assign(to, (0, codegen_1._)`${to} || {}`);
                setEvaluated(gen, to, from);
              }
            }),
          mergeValues: (from, to) => (from === true ? true : { ...from, ...to }),
          resultToName: evaluatedPropsToName,
        }),
        items: makeMergeEvaluated({
          mergeNames: (gen, from, to) =>
            gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () =>
              gen.assign(
                to,
                (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`
              )
            ),
          mergeToName: (gen, from, to) =>
            gen.if((0, codegen_1._)`${to} !== true`, () =>
              gen.assign(
                to,
                from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`
              )
            ),
          mergeValues: (from, to) => (from === true ? true : Math.max(from, to)),
          resultToName: (gen, items) => gen.var('items', items),
        }),
      };
      function evaluatedPropsToName(gen, ps) {
        if (ps === true) return gen.var('props', true);
        const props = gen.var('props', (0, codegen_1._)`{}`);
        if (ps !== void 0) setEvaluated(gen, props, ps);
        return props;
      }
      exports.evaluatedPropsToName = evaluatedPropsToName;
      function setEvaluated(gen, props, ps) {
        Object.keys(ps).forEach(p =>
          gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p)}`, true)
        );
      }
      exports.setEvaluated = setEvaluated;
      var snippets = {};
      function useFunc(gen, f) {
        return gen.scopeValue('func', {
          ref: f,
          code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code)),
        });
      }
      exports.useFunc = useFunc;
      var Type;
      (function (Type2) {
        Type2[(Type2['Num'] = 0)] = 'Num';
        Type2[(Type2['Str'] = 1)] = 'Str';
      })(Type || (exports.Type = Type = {}));
      function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
        if (dataProp instanceof codegen_1.Name) {
          const isNumber = dataPropType === Type.Num;
          return jsPropertySyntax
            ? isNumber
              ? (0, codegen_1._)`"[" + ${dataProp} + "]"`
              : (0, codegen_1._)`"['" + ${dataProp} + "']"`
            : isNumber
              ? (0, codegen_1._)`"/" + ${dataProp}`
              : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
        }
        return jsPropertySyntax
          ? (0, codegen_1.getProperty)(dataProp).toString()
          : '/' + escapeJsonPointer(dataProp);
      }
      exports.getErrorPath = getErrorPath;
      function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
        if (!mode) return;
        msg = `strict mode: ${msg}`;
        if (mode === true) throw new Error(msg);
        it.self.logger.warn(msg);
      }
      exports.checkStrictMode = checkStrictMode;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/names.js
  var require_names = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/names.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var names = {
        // validation function arguments
        data: new codegen_1.Name('data'),
        // data passed to validation function
        // args passed from referencing schema
        valCxt: new codegen_1.Name('valCxt'),
        // validation/data context - should not be used directly, it is destructured to the names below
        instancePath: new codegen_1.Name('instancePath'),
        parentData: new codegen_1.Name('parentData'),
        parentDataProperty: new codegen_1.Name('parentDataProperty'),
        rootData: new codegen_1.Name('rootData'),
        // root data - same as the data passed to the first/top validation function
        dynamicAnchors: new codegen_1.Name('dynamicAnchors'),
        // used to support recursiveRef and dynamicRef
        // function scoped variables
        vErrors: new codegen_1.Name('vErrors'),
        // null or array of validation errors
        errors: new codegen_1.Name('errors'),
        // counter of validation errors
        this: new codegen_1.Name('this'),
        // "globals"
        self: new codegen_1.Name('self'),
        scope: new codegen_1.Name('scope'),
        // JTD serialize/parse name for JSON string and position
        json: new codegen_1.Name('json'),
        jsonPos: new codegen_1.Name('jsonPos'),
        jsonLen: new codegen_1.Name('jsonLen'),
        jsonPart: new codegen_1.Name('jsonPart'),
      };
      exports.default = names;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/errors.js
  var require_errors = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/errors.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.extendErrors =
        exports.resetErrorsCount =
        exports.reportExtraError =
        exports.reportError =
        exports.keyword$DataError =
        exports.keywordError =
          void 0;
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var names_1 = require_names();
      exports.keywordError = {
        message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`,
      };
      exports.keyword$DataError = {
        message: ({ keyword, schemaType }) =>
          schemaType
            ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)`
            : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`,
      };
      function reportError(cxt, error = exports.keywordError, errorPaths, overrideAllErrors) {
        const { it } = cxt;
        const { gen, compositeRule, allErrors } = it;
        const errObj = errorObjectCode(cxt, error, errorPaths);
        if (
          overrideAllErrors !== null && overrideAllErrors !== void 0
            ? overrideAllErrors
            : compositeRule || allErrors
        ) {
          addError(gen, errObj);
        } else {
          returnErrors(it, (0, codegen_1._)`[${errObj}]`);
        }
      }
      exports.reportError = reportError;
      function reportExtraError(cxt, error = exports.keywordError, errorPaths) {
        const { it } = cxt;
        const { gen, compositeRule, allErrors } = it;
        const errObj = errorObjectCode(cxt, error, errorPaths);
        addError(gen, errObj);
        if (!(compositeRule || allErrors)) {
          returnErrors(it, names_1.default.vErrors);
        }
      }
      exports.reportExtraError = reportExtraError;
      function resetErrorsCount(gen, errsCount) {
        gen.assign(names_1.default.errors, errsCount);
        gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () =>
          gen.if(
            errsCount,
            () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount),
            () => gen.assign(names_1.default.vErrors, null)
          )
        );
      }
      exports.resetErrorsCount = resetErrorsCount;
      function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
        if (errsCount === void 0) throw new Error('ajv implementation error');
        const err = gen.name('err');
        gen.forRange('i', errsCount, names_1.default.errors, i => {
          gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
          gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () =>
            gen.assign(
              (0, codegen_1._)`${err}.instancePath`,
              (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)
            )
          );
          gen.assign(
            (0, codegen_1._)`${err}.schemaPath`,
            (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`
          );
          if (it.opts.verbose) {
            gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
            gen.assign((0, codegen_1._)`${err}.data`, data);
          }
        });
      }
      exports.extendErrors = extendErrors;
      function addError(gen, errObj) {
        const err = gen.const('err', errObj);
        gen.if(
          (0, codegen_1._)`${names_1.default.vErrors} === null`,
          () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`),
          (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`
        );
        gen.code((0, codegen_1._)`${names_1.default.errors}++`);
      }
      function returnErrors(it, errs) {
        const { gen, validateName, schemaEnv } = it;
        if (schemaEnv.$async) {
          gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
        } else {
          gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
          gen.return(false);
        }
      }
      var E = {
        keyword: new codegen_1.Name('keyword'),
        schemaPath: new codegen_1.Name('schemaPath'),
        // also used in JTD errors
        params: new codegen_1.Name('params'),
        propertyName: new codegen_1.Name('propertyName'),
        message: new codegen_1.Name('message'),
        schema: new codegen_1.Name('schema'),
        parentSchema: new codegen_1.Name('parentSchema'),
      };
      function errorObjectCode(cxt, error, errorPaths) {
        const { createErrors } = cxt.it;
        if (createErrors === false) return (0, codegen_1._)`{}`;
        return errorObject(cxt, error, errorPaths);
      }
      function errorObject(cxt, error, errorPaths = {}) {
        const { gen, it } = cxt;
        const keyValues = [errorInstancePath(it, errorPaths), errorSchemaPath(cxt, errorPaths)];
        extraErrorProps(cxt, error, keyValues);
        return gen.object(...keyValues);
      }
      function errorInstancePath({ errorPath }, { instancePath }) {
        const instPath = instancePath
          ? (0,
            codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}`
          : errorPath;
        return [
          names_1.default.instancePath,
          (0, codegen_1.strConcat)(names_1.default.instancePath, instPath),
        ];
      }
      function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
        let schPath = parentSchema
          ? errSchemaPath
          : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
        if (schemaPath) {
          schPath = (0,
          codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
        }
        return [E.schemaPath, schPath];
      }
      function extraErrorProps(cxt, { params, message }, keyValues) {
        const { keyword, data, schemaValue, it } = cxt;
        const { opts, propertyName, topSchemaRef, schemaPath } = it;
        keyValues.push(
          [E.keyword, keyword],
          [E.params, typeof params == 'function' ? params(cxt) : params || (0, codegen_1._)`{}`]
        );
        if (opts.messages) {
          keyValues.push([E.message, typeof message == 'function' ? message(cxt) : message]);
        }
        if (opts.verbose) {
          keyValues.push(
            [E.schema, schemaValue],
            [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`],
            [names_1.default.data, data]
          );
        }
        if (propertyName) keyValues.push([E.propertyName, propertyName]);
      }
    },
  });

  // packages/core/node_modules/ajv/dist/compile/validate/boolSchema.js
  var require_boolSchema = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/validate/boolSchema.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
      var errors_1 = require_errors();
      var codegen_1 = require_codegen();
      var names_1 = require_names();
      var boolError = {
        message: 'boolean schema is false',
      };
      function topBoolOrEmptySchema(it) {
        const { gen, schema, validateName } = it;
        if (schema === false) {
          falseSchemaError(it, false);
        } else if (typeof schema == 'object' && schema.$async === true) {
          gen.return(names_1.default.data);
        } else {
          gen.assign((0, codegen_1._)`${validateName}.errors`, null);
          gen.return(true);
        }
      }
      exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
      function boolOrEmptySchema(it, valid2) {
        const { gen, schema } = it;
        if (schema === false) {
          gen.var(valid2, false);
          falseSchemaError(it);
        } else {
          gen.var(valid2, true);
        }
      }
      exports.boolOrEmptySchema = boolOrEmptySchema;
      function falseSchemaError(it, overrideAllErrors) {
        const { gen, data } = it;
        const cxt = {
          gen,
          keyword: 'false schema',
          data,
          schema: false,
          schemaCode: false,
          schemaValue: false,
          params: {},
          it,
        };
        (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
      }
    },
  });

  // packages/core/node_modules/ajv/dist/compile/rules.js
  var require_rules = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/rules.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.getRules = exports.isJSONType = void 0;
      var _jsonTypes = ['string', 'number', 'integer', 'boolean', 'null', 'object', 'array'];
      var jsonTypes = new Set(_jsonTypes);
      function isJSONType(x) {
        return typeof x == 'string' && jsonTypes.has(x);
      }
      exports.isJSONType = isJSONType;
      function getRules() {
        const groups = {
          number: { type: 'number', rules: [] },
          string: { type: 'string', rules: [] },
          array: { type: 'array', rules: [] },
          object: { type: 'object', rules: [] },
        };
        return {
          types: { ...groups, integer: true, boolean: true, null: true },
          rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
          post: { rules: [] },
          all: {},
          keywords: {},
        };
      }
      exports.getRules = getRules;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/validate/applicability.js
  var require_applicability = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/validate/applicability.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
      function schemaHasRulesForType({ schema, self: self2 }, type7) {
        const group = self2.RULES.types[type7];
        return group && group !== true && shouldUseGroup(schema, group);
      }
      exports.schemaHasRulesForType = schemaHasRulesForType;
      function shouldUseGroup(schema, group) {
        return group.rules.some(rule => shouldUseRule(schema, rule));
      }
      exports.shouldUseGroup = shouldUseGroup;
      function shouldUseRule(schema, rule) {
        var _a;
        return (
          schema[rule.keyword] !== void 0 ||
          ((_a = rule.definition.implements) === null || _a === void 0
            ? void 0
            : _a.some(kwd => schema[kwd] !== void 0))
        );
      }
      exports.shouldUseRule = shouldUseRule;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/validate/dataType.js
  var require_dataType = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/validate/dataType.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.reportTypeError =
        exports.checkDataTypes =
        exports.checkDataType =
        exports.coerceAndCheckDataType =
        exports.getJSONTypes =
        exports.getSchemaTypes =
        exports.DataType =
          void 0;
      var rules_1 = require_rules();
      var applicability_1 = require_applicability();
      var errors_1 = require_errors();
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var DataType;
      (function (DataType2) {
        DataType2[(DataType2['Correct'] = 0)] = 'Correct';
        DataType2[(DataType2['Wrong'] = 1)] = 'Wrong';
      })(DataType || (exports.DataType = DataType = {}));
      function getSchemaTypes(schema) {
        const types = getJSONTypes(schema.type);
        const hasNull = types.includes('null');
        if (hasNull) {
          if (schema.nullable === false) throw new Error('type: null contradicts nullable: false');
        } else {
          if (!types.length && schema.nullable !== void 0) {
            throw new Error('"nullable" cannot be used without "type"');
          }
          if (schema.nullable === true) types.push('null');
        }
        return types;
      }
      exports.getSchemaTypes = getSchemaTypes;
      function getJSONTypes(ts) {
        const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
        if (types.every(rules_1.isJSONType)) return types;
        throw new Error('type must be JSONType or JSONType[]: ' + types.join(','));
      }
      exports.getJSONTypes = getJSONTypes;
      function coerceAndCheckDataType(it, types) {
        const { gen, data, opts } = it;
        const coerceTo = coerceToTypes(types, opts.coerceTypes);
        const checkTypes =
          types.length > 0 &&
          !(
            coerceTo.length === 0 &&
            types.length === 1 &&
            (0, applicability_1.schemaHasRulesForType)(it, types[0])
          );
        if (checkTypes) {
          const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
          gen.if(wrongType, () => {
            if (coerceTo.length) coerceData(it, types, coerceTo);
            else reportTypeError(it);
          });
        }
        return checkTypes;
      }
      exports.coerceAndCheckDataType = coerceAndCheckDataType;
      var COERCIBLE = /* @__PURE__ */ new Set(['string', 'number', 'integer', 'boolean', 'null']);
      function coerceToTypes(types, coerceTypes) {
        return coerceTypes
          ? types.filter(t => COERCIBLE.has(t) || (coerceTypes === 'array' && t === 'array'))
          : [];
      }
      function coerceData(it, types, coerceTo) {
        const { gen, data, opts } = it;
        const dataType = gen.let('dataType', (0, codegen_1._)`typeof ${data}`);
        const coerced = gen.let('coerced', (0, codegen_1._)`undefined`);
        if (opts.coerceTypes === 'array') {
          gen.if(
            (0,
            codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`,
            () =>
              gen
                .assign(data, (0, codegen_1._)`${data}[0]`)
                .assign(dataType, (0, codegen_1._)`typeof ${data}`)
                .if(checkDataTypes(types, data, opts.strictNumbers), () =>
                  gen.assign(coerced, data)
                )
          );
        }
        gen.if((0, codegen_1._)`${coerced} !== undefined`);
        for (const t of coerceTo) {
          if (COERCIBLE.has(t) || (t === 'array' && opts.coerceTypes === 'array')) {
            coerceSpecificType(t);
          }
        }
        gen.else();
        reportTypeError(it);
        gen.endIf();
        gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
          gen.assign(data, coerced);
          assignParentData(it, coerced);
        });
        function coerceSpecificType(t) {
          switch (t) {
            case 'string':
              gen
                .elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`)
                .assign(coerced, (0, codegen_1._)`"" + ${data}`)
                .elseIf((0, codegen_1._)`${data} === null`)
                .assign(coerced, (0, codegen_1._)`""`);
              return;
            case 'number':
              gen
                .elseIf(
                  (0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`
                )
                .assign(coerced, (0, codegen_1._)`+${data}`);
              return;
            case 'integer':
              gen
                .elseIf(
                  (0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`
                )
                .assign(coerced, (0, codegen_1._)`+${data}`);
              return;
            case 'boolean':
              gen
                .elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`)
                .assign(coerced, false)
                .elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`)
                .assign(coerced, true);
              return;
            case 'null':
              gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
              gen.assign(coerced, null);
              return;
            case 'array':
              gen
                .elseIf(
                  (0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`
                )
                .assign(coerced, (0, codegen_1._)`[${data}]`);
          }
        }
      }
      function assignParentData({ gen, parentData, parentDataProperty }, expr) {
        gen.if((0, codegen_1._)`${parentData} !== undefined`, () =>
          gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr)
        );
      }
      function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
        const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
        let cond;
        switch (dataType) {
          case 'null':
            return (0, codegen_1._)`${data} ${EQ} null`;
          case 'array':
            cond = (0, codegen_1._)`Array.isArray(${data})`;
            break;
          case 'object':
            cond = (0,
            codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
            break;
          case 'integer':
            cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
            break;
          case 'number':
            cond = numCond();
            break;
          default:
            return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
        }
        return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
        function numCond(_cond = codegen_1.nil) {
          return (0, codegen_1.and)(
            (0, codegen_1._)`typeof ${data} == "number"`,
            _cond,
            strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil
          );
        }
      }
      exports.checkDataType = checkDataType;
      function checkDataTypes(dataTypes, data, strictNums, correct) {
        if (dataTypes.length === 1) {
          return checkDataType(dataTypes[0], data, strictNums, correct);
        }
        let cond;
        const types = (0, util_1.toHash)(dataTypes);
        if (types.array && types.object) {
          const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
          cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
          delete types.null;
          delete types.array;
          delete types.object;
        } else {
          cond = codegen_1.nil;
        }
        if (types.number) delete types.integer;
        for (const t in types)
          cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
        return cond;
      }
      exports.checkDataTypes = checkDataTypes;
      var typeError = {
        message: ({ schema }) => `must be ${schema}`,
        params: ({ schema, schemaValue }) =>
          typeof schema == 'string'
            ? (0, codegen_1._)`{type: ${schema}}`
            : (0, codegen_1._)`{type: ${schemaValue}}`,
      };
      function reportTypeError(it) {
        const cxt = getTypeErrorContext(it);
        (0, errors_1.reportError)(cxt, typeError);
      }
      exports.reportTypeError = reportTypeError;
      function getTypeErrorContext(it) {
        const { gen, data, schema } = it;
        const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, 'type');
        return {
          gen,
          keyword: 'type',
          data,
          schema: schema.type,
          schemaCode,
          schemaValue: schemaCode,
          parentSchema: schema,
          params: {},
          it,
        };
      }
    },
  });

  // packages/core/node_modules/ajv/dist/compile/validate/defaults.js
  var require_defaults = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/validate/defaults.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.assignDefaults = void 0;
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      function assignDefaults(it, ty) {
        const { properties: properties7, items } = it.schema;
        if (ty === 'object' && properties7) {
          for (const key in properties7) {
            assignDefault(it, key, properties7[key].default);
          }
        } else if (ty === 'array' && Array.isArray(items)) {
          items.forEach((sch, i) => assignDefault(it, i, sch.default));
        }
      }
      exports.assignDefaults = assignDefaults;
      function assignDefault(it, prop, defaultValue) {
        const { gen, compositeRule, data, opts } = it;
        if (defaultValue === void 0) return;
        const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
        if (compositeRule) {
          (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
          return;
        }
        let condition = (0, codegen_1._)`${childData} === undefined`;
        if (opts.useDefaults === 'empty') {
          condition = (0,
          codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
        }
        gen.if(
          condition,
          (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`
        );
      }
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/code.js
  var require_code2 = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/code.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.validateUnion =
        exports.validateArray =
        exports.usePattern =
        exports.callValidateCode =
        exports.schemaProperties =
        exports.allSchemaProperties =
        exports.noPropertyInData =
        exports.propertyInData =
        exports.isOwnProperty =
        exports.hasPropFunc =
        exports.reportMissingProp =
        exports.checkMissingProp =
        exports.checkReportMissingProp =
          void 0;
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var names_1 = require_names();
      var util_2 = require_util();
      function checkReportMissingProp(cxt, prop) {
        const { gen, data, it } = cxt;
        gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
          cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
          cxt.error();
        });
      }
      exports.checkReportMissingProp = checkReportMissingProp;
      function checkMissingProp({ gen, data, it: { opts } }, properties7, missing) {
        return (0, codegen_1.or)(
          ...properties7.map(prop =>
            (0, codegen_1.and)(
              noPropertyInData(gen, data, prop, opts.ownProperties),
              (0, codegen_1._)`${missing} = ${prop}`
            )
          )
        );
      }
      exports.checkMissingProp = checkMissingProp;
      function reportMissingProp(cxt, missing) {
        cxt.setParams({ missingProperty: missing }, true);
        cxt.error();
      }
      exports.reportMissingProp = reportMissingProp;
      function hasPropFunc(gen) {
        return gen.scopeValue('func', {
          // eslint-disable-next-line @typescript-eslint/unbound-method
          ref: Object.prototype.hasOwnProperty,
          code: (0, codegen_1._)`Object.prototype.hasOwnProperty`,
        });
      }
      exports.hasPropFunc = hasPropFunc;
      function isOwnProperty(gen, data, property) {
        return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
      }
      exports.isOwnProperty = isOwnProperty;
      function propertyInData(gen, data, property, ownProperties) {
        const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
        return ownProperties
          ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}`
          : cond;
      }
      exports.propertyInData = propertyInData;
      function noPropertyInData(gen, data, property, ownProperties) {
        const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
        return ownProperties
          ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property)))
          : cond;
      }
      exports.noPropertyInData = noPropertyInData;
      function allSchemaProperties(schemaMap) {
        return schemaMap ? Object.keys(schemaMap).filter(p => p !== '__proto__') : [];
      }
      exports.allSchemaProperties = allSchemaProperties;
      function schemaProperties(it, schemaMap) {
        return allSchemaProperties(schemaMap).filter(
          p => !(0, util_1.alwaysValidSchema)(it, schemaMap[p])
        );
      }
      exports.schemaProperties = schemaProperties;
      function callValidateCode(
        { schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it },
        func,
        context,
        passSchema
      ) {
        const dataAndSchema = passSchema
          ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}`
          : data;
        const valCxt = [
          [
            names_1.default.instancePath,
            (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath),
          ],
          [names_1.default.parentData, it.parentData],
          [names_1.default.parentDataProperty, it.parentDataProperty],
          [names_1.default.rootData, names_1.default.rootData],
        ];
        if (it.opts.dynamicRef)
          valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
        const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
        return context !== codegen_1.nil
          ? (0, codegen_1._)`${func}.call(${context}, ${args})`
          : (0, codegen_1._)`${func}(${args})`;
      }
      exports.callValidateCode = callValidateCode;
      var newRegExp = (0, codegen_1._)`new RegExp`;
      function usePattern({ gen, it: { opts } }, pattern) {
        const u = opts.unicodeRegExp ? 'u' : '';
        const { regExp } = opts.code;
        const rx = regExp(pattern, u);
        return gen.scopeValue('pattern', {
          key: rx.toString(),
          ref: rx,
          code: (0,
          codegen_1._)`${regExp.code === 'new RegExp' ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`,
        });
      }
      exports.usePattern = usePattern;
      function validateArray(cxt) {
        const { gen, data, keyword, it } = cxt;
        const valid2 = gen.name('valid');
        if (it.allErrors) {
          const validArr = gen.let('valid', true);
          validateItems(() => gen.assign(validArr, false));
          return validArr;
        }
        gen.var(valid2, true);
        validateItems(() => gen.break());
        return valid2;
        function validateItems(notValid) {
          const len = gen.const('len', (0, codegen_1._)`${data}.length`);
          gen.forRange('i', 0, len, i => {
            cxt.subschema(
              {
                keyword,
                dataProp: i,
                dataPropType: util_1.Type.Num,
              },
              valid2
            );
            gen.if((0, codegen_1.not)(valid2), notValid);
          });
        }
      }
      exports.validateArray = validateArray;
      function validateUnion(cxt) {
        const { gen, schema, keyword, it } = cxt;
        if (!Array.isArray(schema)) throw new Error('ajv implementation error');
        const alwaysValid = schema.some(sch => (0, util_1.alwaysValidSchema)(it, sch));
        if (alwaysValid && !it.opts.unevaluated) return;
        const valid2 = gen.let('valid', false);
        const schValid = gen.name('_valid');
        gen.block(() =>
          schema.forEach((_sch, i) => {
            const schCxt = cxt.subschema(
              {
                keyword,
                schemaProp: i,
                compositeRule: true,
              },
              schValid
            );
            gen.assign(valid2, (0, codegen_1._)`${valid2} || ${schValid}`);
            const merged = cxt.mergeValidEvaluated(schCxt, schValid);
            if (!merged) gen.if((0, codegen_1.not)(valid2));
          })
        );
        cxt.result(
          valid2,
          () => cxt.reset(),
          () => cxt.error(true)
        );
      }
      exports.validateUnion = validateUnion;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/validate/keyword.js
  var require_keyword = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/validate/keyword.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.validateKeywordUsage =
        exports.validSchemaType =
        exports.funcKeywordCode =
        exports.macroKeywordCode =
          void 0;
      var codegen_1 = require_codegen();
      var names_1 = require_names();
      var code_1 = require_code2();
      var errors_1 = require_errors();
      function macroKeywordCode(cxt, def) {
        const { gen, keyword, schema, parentSchema, it } = cxt;
        const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
        const schemaRef = useKeyword(gen, keyword, macroSchema);
        if (it.opts.validateSchema !== false) it.self.validateSchema(macroSchema, true);
        const valid2 = gen.name('valid');
        cxt.subschema(
          {
            schema: macroSchema,
            schemaPath: codegen_1.nil,
            errSchemaPath: `${it.errSchemaPath}/${keyword}`,
            topSchemaRef: schemaRef,
            compositeRule: true,
          },
          valid2
        );
        cxt.pass(valid2, () => cxt.error(true));
      }
      exports.macroKeywordCode = macroKeywordCode;
      function funcKeywordCode(cxt, def) {
        var _a;
        const { gen, keyword, schema, parentSchema, $data, it } = cxt;
        checkAsyncKeyword(it, def);
        const validate =
          !$data && def.compile
            ? def.compile.call(it.self, schema, parentSchema, it)
            : def.validate;
        const validateRef = useKeyword(gen, keyword, validate);
        const valid2 = gen.let('valid');
        cxt.block$data(valid2, validateKeyword);
        cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid2);
        function validateKeyword() {
          if (def.errors === false) {
            assignValid();
            if (def.modifying) modifyData(cxt);
            reportErrs(() => cxt.error());
          } else {
            const ruleErrs = def.async ? validateAsync() : validateSync();
            if (def.modifying) modifyData(cxt);
            reportErrs(() => addErrs(cxt, ruleErrs));
          }
        }
        function validateAsync() {
          const ruleErrs = gen.let('ruleErrs', null);
          gen.try(
            () => assignValid((0, codegen_1._)`await `),
            e =>
              gen.assign(valid2, false).if(
                (0, codegen_1._)`${e} instanceof ${it.ValidationError}`,
                () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`),
                () => gen.throw(e)
              )
          );
          return ruleErrs;
        }
        function validateSync() {
          const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
          gen.assign(validateErrs, null);
          assignValid(codegen_1.nil);
          return validateErrs;
        }
        function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
          const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
          const passSchema = !(('compile' in def && !$data) || def.schema === false);
          gen.assign(
            valid2,
            (0,
            codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`,
            def.modifying
          );
        }
        function reportErrs(errors) {
          var _a2;
          gen.if(
            (0, codegen_1.not)((_a2 = def.valid) !== null && _a2 !== void 0 ? _a2 : valid2),
            errors
          );
        }
      }
      exports.funcKeywordCode = funcKeywordCode;
      function modifyData(cxt) {
        const { gen, data, it } = cxt;
        gen.if(it.parentData, () =>
          gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`)
        );
      }
      function addErrs(cxt, errs) {
        const { gen } = cxt;
        gen.if(
          (0, codegen_1._)`Array.isArray(${errs})`,
          () => {
            gen
              .assign(
                names_1.default.vErrors,
                (0,
                codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`
              )
              .assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
            (0, errors_1.extendErrors)(cxt);
          },
          () => cxt.error()
        );
      }
      function checkAsyncKeyword({ schemaEnv }, def) {
        if (def.async && !schemaEnv.$async) throw new Error('async keyword in sync schema');
      }
      function useKeyword(gen, keyword, result) {
        if (result === void 0) throw new Error(`keyword "${keyword}" failed to compile`);
        return gen.scopeValue(
          'keyword',
          typeof result == 'function'
            ? { ref: result }
            : { ref: result, code: (0, codegen_1.stringify)(result) }
        );
      }
      function validSchemaType(schema, schemaType, allowUndefined = false) {
        return (
          !schemaType.length ||
          schemaType.some(st =>
            st === 'array'
              ? Array.isArray(schema)
              : st === 'object'
                ? schema && typeof schema == 'object' && !Array.isArray(schema)
                : typeof schema == st || (allowUndefined && typeof schema == 'undefined')
          )
        );
      }
      exports.validSchemaType = validSchemaType;
      function validateKeywordUsage({ schema, opts, self: self2, errSchemaPath }, def, keyword) {
        if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
          throw new Error('ajv implementation error');
        }
        const deps = def.dependencies;
        if (
          deps === null || deps === void 0
            ? void 0
            : deps.some(kwd => !Object.prototype.hasOwnProperty.call(schema, kwd))
        ) {
          throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(',')}`);
        }
        if (def.validateSchema) {
          const valid2 = def.validateSchema(schema[keyword]);
          if (!valid2) {
            const msg =
              `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` +
              self2.errorsText(def.validateSchema.errors);
            if (opts.validateSchema === 'log') self2.logger.error(msg);
            else throw new Error(msg);
          }
        }
      }
      exports.validateKeywordUsage = validateKeywordUsage;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/validate/subschema.js
  var require_subschema = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/validate/subschema.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      function getSubschema(
        it,
        { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }
      ) {
        if (keyword !== void 0 && schema !== void 0) {
          throw new Error('both "keyword" and "schema" passed, only one allowed');
        }
        if (keyword !== void 0) {
          const sch = it.schema[keyword];
          return schemaProp === void 0
            ? {
                schema: sch,
                schemaPath: (0,
                codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
                errSchemaPath: `${it.errSchemaPath}/${keyword}`,
              }
            : {
                schema: sch[schemaProp],
                schemaPath: (0,
                codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
                errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`,
              };
        }
        if (schema !== void 0) {
          if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
            throw new Error(
              '"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"'
            );
          }
          return {
            schema,
            schemaPath,
            topSchemaRef,
            errSchemaPath,
          };
        }
        throw new Error('either "keyword" or "schema" must be passed');
      }
      exports.getSubschema = getSubschema;
      function extendSubschemaData(
        subschema,
        it,
        { dataProp, dataPropType: dpType, data, dataTypes, propertyName }
      ) {
        if (data !== void 0 && dataProp !== void 0) {
          throw new Error('both "data" and "dataProp" passed, only one allowed');
        }
        const { gen } = it;
        if (dataProp !== void 0) {
          const { errorPath, dataPathArr, opts } = it;
          const nextData = gen.let(
            'data',
            (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`,
            true
          );
          dataContextProps(nextData);
          subschema.errorPath = (0,
          codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
          subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
          subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
        }
        if (data !== void 0) {
          const nextData = data instanceof codegen_1.Name ? data : gen.let('data', data, true);
          dataContextProps(nextData);
          if (propertyName !== void 0) subschema.propertyName = propertyName;
        }
        if (dataTypes) subschema.dataTypes = dataTypes;
        function dataContextProps(_nextData) {
          subschema.data = _nextData;
          subschema.dataLevel = it.dataLevel + 1;
          subschema.dataTypes = [];
          it.definedProperties = /* @__PURE__ */ new Set();
          subschema.parentData = it.data;
          subschema.dataNames = [...it.dataNames, _nextData];
        }
      }
      exports.extendSubschemaData = extendSubschemaData;
      function extendSubschemaMode(
        subschema,
        { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }
      ) {
        if (compositeRule !== void 0) subschema.compositeRule = compositeRule;
        if (createErrors !== void 0) subschema.createErrors = createErrors;
        if (allErrors !== void 0) subschema.allErrors = allErrors;
        subschema.jtdDiscriminator = jtdDiscriminator;
        subschema.jtdMetadata = jtdMetadata;
      }
      exports.extendSubschemaMode = extendSubschemaMode;
    },
  });

  // packages/core/node_modules/fast-deep-equal/index.js
  var require_fast_deep_equal = __commonJS({
    'packages/core/node_modules/fast-deep-equal/index.js'(exports, module) {
      'use strict';
      module.exports = function equal(a, b) {
        if (a === b) return true;
        if (a && b && typeof a == 'object' && typeof b == 'object') {
          if (a.constructor !== b.constructor) return false;
          var length, i, keys;
          if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
            return true;
          }
          if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
          if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
          if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
          keys = Object.keys(a);
          length = keys.length;
          if (length !== Object.keys(b).length) return false;
          for (i = length; i-- !== 0; )
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
          for (i = length; i-- !== 0; ) {
            var key = keys[i];
            if (!equal(a[key], b[key])) return false;
          }
          return true;
        }
        return a !== a && b !== b;
      };
    },
  });

  // packages/core/node_modules/json-schema-traverse/index.js
  var require_json_schema_traverse = __commonJS({
    'packages/core/node_modules/json-schema-traverse/index.js'(exports, module) {
      'use strict';
      var traverse = (module.exports = function (schema, opts, cb) {
        if (typeof opts == 'function') {
          cb = opts;
          opts = {};
        }
        cb = opts.cb || cb;
        var pre = typeof cb == 'function' ? cb : cb.pre || function () {};
        var post = cb.post || function () {};
        _traverse(opts, pre, post, schema, '', schema);
      });
      traverse.keywords = {
        additionalItems: true,
        items: true,
        contains: true,
        additionalProperties: true,
        propertyNames: true,
        not: true,
        if: true,
        then: true,
        else: true,
      };
      traverse.arrayKeywords = {
        items: true,
        allOf: true,
        anyOf: true,
        oneOf: true,
      };
      traverse.propsKeywords = {
        $defs: true,
        definitions: true,
        properties: true,
        patternProperties: true,
        dependencies: true,
      };
      traverse.skipKeywords = {
        default: true,
        enum: true,
        const: true,
        required: true,
        maximum: true,
        minimum: true,
        exclusiveMaximum: true,
        exclusiveMinimum: true,
        multipleOf: true,
        maxLength: true,
        minLength: true,
        pattern: true,
        format: true,
        maxItems: true,
        minItems: true,
        uniqueItems: true,
        maxProperties: true,
        minProperties: true,
      };
      function _traverse(
        opts,
        pre,
        post,
        schema,
        jsonPtr,
        rootSchema,
        parentJsonPtr,
        parentKeyword,
        parentSchema,
        keyIndex
      ) {
        if (schema && typeof schema == 'object' && !Array.isArray(schema)) {
          pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
          for (var key in schema) {
            var sch = schema[key];
            if (Array.isArray(sch)) {
              if (key in traverse.arrayKeywords) {
                for (var i = 0; i < sch.length; i++)
                  _traverse(
                    opts,
                    pre,
                    post,
                    sch[i],
                    jsonPtr + '/' + key + '/' + i,
                    rootSchema,
                    jsonPtr,
                    key,
                    schema,
                    i
                  );
              }
            } else if (key in traverse.propsKeywords) {
              if (sch && typeof sch == 'object') {
                for (var prop in sch)
                  _traverse(
                    opts,
                    pre,
                    post,
                    sch[prop],
                    jsonPtr + '/' + key + '/' + escapeJsonPtr(prop),
                    rootSchema,
                    jsonPtr,
                    key,
                    schema,
                    prop
                  );
              }
            } else if (
              key in traverse.keywords ||
              (opts.allKeys && !(key in traverse.skipKeywords))
            ) {
              _traverse(
                opts,
                pre,
                post,
                sch,
                jsonPtr + '/' + key,
                rootSchema,
                jsonPtr,
                key,
                schema
              );
            }
          }
          post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        }
      }
      function escapeJsonPtr(str) {
        return str.replace(/~/g, '~0').replace(/\//g, '~1');
      }
    },
  });

  // packages/core/node_modules/ajv/dist/compile/resolve.js
  var require_resolve = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/resolve.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.getSchemaRefs =
        exports.resolveUrl =
        exports.normalizeId =
        exports._getFullPath =
        exports.getFullPath =
        exports.inlineRef =
          void 0;
      var util_1 = require_util();
      var equal = require_fast_deep_equal();
      var traverse = require_json_schema_traverse();
      var SIMPLE_INLINED = /* @__PURE__ */ new Set([
        'type',
        'format',
        'pattern',
        'maxLength',
        'minLength',
        'maxProperties',
        'minProperties',
        'maxItems',
        'minItems',
        'maximum',
        'minimum',
        'uniqueItems',
        'multipleOf',
        'required',
        'enum',
        'const',
      ]);
      function inlineRef(schema, limit = true) {
        if (typeof schema == 'boolean') return true;
        if (limit === true) return !hasRef(schema);
        if (!limit) return false;
        return countKeys(schema) <= limit;
      }
      exports.inlineRef = inlineRef;
      var REF_KEYWORDS = /* @__PURE__ */ new Set([
        '$ref',
        '$recursiveRef',
        '$recursiveAnchor',
        '$dynamicRef',
        '$dynamicAnchor',
      ]);
      function hasRef(schema) {
        for (const key in schema) {
          if (REF_KEYWORDS.has(key)) return true;
          const sch = schema[key];
          if (Array.isArray(sch) && sch.some(hasRef)) return true;
          if (typeof sch == 'object' && hasRef(sch)) return true;
        }
        return false;
      }
      function countKeys(schema) {
        let count = 0;
        for (const key in schema) {
          if (key === '$ref') return Infinity;
          count++;
          if (SIMPLE_INLINED.has(key)) continue;
          if (typeof schema[key] == 'object') {
            (0, util_1.eachItem)(schema[key], sch => (count += countKeys(sch)));
          }
          if (count === Infinity) return Infinity;
        }
        return count;
      }
      function getFullPath(resolver, id = '', normalize) {
        if (normalize !== false) id = normalizeId(id);
        const p = resolver.parse(id);
        return _getFullPath(resolver, p);
      }
      exports.getFullPath = getFullPath;
      function _getFullPath(resolver, p) {
        const serialized = resolver.serialize(p);
        return serialized.split('#')[0] + '#';
      }
      exports._getFullPath = _getFullPath;
      var TRAILING_SLASH_HASH = /#\/?$/;
      function normalizeId(id) {
        return id ? id.replace(TRAILING_SLASH_HASH, '') : '';
      }
      exports.normalizeId = normalizeId;
      function resolveUrl(resolver, baseId, id) {
        id = normalizeId(id);
        return resolver.resolve(baseId, id);
      }
      exports.resolveUrl = resolveUrl;
      var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
      function getSchemaRefs(schema, baseId) {
        if (typeof schema == 'boolean') return {};
        const { schemaId, uriResolver } = this.opts;
        const schId = normalizeId(schema[schemaId] || baseId);
        const baseIds = { '': schId };
        const pathPrefix = getFullPath(uriResolver, schId, false);
        const localRefs = {};
        const schemaRefs = /* @__PURE__ */ new Set();
        traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
          if (parentJsonPtr === void 0) return;
          const fullPath = pathPrefix + jsonPtr;
          let innerBaseId = baseIds[parentJsonPtr];
          if (typeof sch[schemaId] == 'string') innerBaseId = addRef.call(this, sch[schemaId]);
          addAnchor.call(this, sch.$anchor);
          addAnchor.call(this, sch.$dynamicAnchor);
          baseIds[jsonPtr] = innerBaseId;
          function addRef(ref) {
            const _resolve = this.opts.uriResolver.resolve;
            ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
            if (schemaRefs.has(ref)) throw ambiguos(ref);
            schemaRefs.add(ref);
            let schOrRef = this.refs[ref];
            if (typeof schOrRef == 'string') schOrRef = this.refs[schOrRef];
            if (typeof schOrRef == 'object') {
              checkAmbiguosRef(sch, schOrRef.schema, ref);
            } else if (ref !== normalizeId(fullPath)) {
              if (ref[0] === '#') {
                checkAmbiguosRef(sch, localRefs[ref], ref);
                localRefs[ref] = sch;
              } else {
                this.refs[ref] = fullPath;
              }
            }
            return ref;
          }
          function addAnchor(anchor) {
            if (typeof anchor == 'string') {
              if (!ANCHOR.test(anchor)) throw new Error(`invalid anchor "${anchor}"`);
              addRef.call(this, `#${anchor}`);
            }
          }
        });
        return localRefs;
        function checkAmbiguosRef(sch1, sch2, ref) {
          if (sch2 !== void 0 && !equal(sch1, sch2)) throw ambiguos(ref);
        }
        function ambiguos(ref) {
          return new Error(`reference "${ref}" resolves to more than one schema`);
        }
      }
      exports.getSchemaRefs = getSchemaRefs;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/validate/index.js
  var require_validate = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/validate/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
      var boolSchema_1 = require_boolSchema();
      var dataType_1 = require_dataType();
      var applicability_1 = require_applicability();
      var dataType_2 = require_dataType();
      var defaults_1 = require_defaults();
      var keyword_1 = require_keyword();
      var subschema_1 = require_subschema();
      var codegen_1 = require_codegen();
      var names_1 = require_names();
      var resolve_1 = require_resolve();
      var util_1 = require_util();
      var errors_1 = require_errors();
      function validateFunctionCode(it) {
        if (isSchemaObj(it)) {
          checkKeywords(it);
          if (schemaCxtHasRules(it)) {
            topSchemaObjCode(it);
            return;
          }
        }
        validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
      }
      exports.validateFunctionCode = validateFunctionCode;
      function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
        if (opts.code.es5) {
          gen.func(
            validateName,
            (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`,
            schemaEnv.$async,
            () => {
              gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
              destructureValCxtES5(gen, opts);
              gen.code(body);
            }
          );
        } else {
          gen.func(
            validateName,
            (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`,
            schemaEnv.$async,
            () => gen.code(funcSourceUrl(schema, opts)).code(body)
          );
        }
      }
      function destructureValCxt(opts) {
        return (0,
        codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
      }
      function destructureValCxtES5(gen, opts) {
        gen.if(
          names_1.default.valCxt,
          () => {
            gen.var(
              names_1.default.instancePath,
              (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`
            );
            gen.var(
              names_1.default.parentData,
              (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`
            );
            gen.var(
              names_1.default.parentDataProperty,
              (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`
            );
            gen.var(
              names_1.default.rootData,
              (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`
            );
            if (opts.dynamicRef)
              gen.var(
                names_1.default.dynamicAnchors,
                (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`
              );
          },
          () => {
            gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
            gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
            gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
            gen.var(names_1.default.rootData, names_1.default.data);
            if (opts.dynamicRef) gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
          }
        );
      }
      function topSchemaObjCode(it) {
        const { schema, opts, gen } = it;
        validateFunction(it, () => {
          if (opts.$comment && schema.$comment) commentKeyword(it);
          checkNoDefault(it);
          gen.let(names_1.default.vErrors, null);
          gen.let(names_1.default.errors, 0);
          if (opts.unevaluated) resetEvaluated(it);
          typeAndKeywords(it);
          returnResults(it);
        });
        return;
      }
      function resetEvaluated(it) {
        const { gen, validateName } = it;
        it.evaluated = gen.const('evaluated', (0, codegen_1._)`${validateName}.evaluated`);
        gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () =>
          gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`)
        );
        gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () =>
          gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`)
        );
      }
      function funcSourceUrl(schema, opts) {
        const schId = typeof schema == 'object' && schema[opts.schemaId];
        return schId && (opts.code.source || opts.code.process)
          ? (0, codegen_1._)`/*# sourceURL=${schId} */`
          : codegen_1.nil;
      }
      function subschemaCode(it, valid2) {
        if (isSchemaObj(it)) {
          checkKeywords(it);
          if (schemaCxtHasRules(it)) {
            subSchemaObjCode(it, valid2);
            return;
          }
        }
        (0, boolSchema_1.boolOrEmptySchema)(it, valid2);
      }
      function schemaCxtHasRules({ schema, self: self2 }) {
        if (typeof schema == 'boolean') return !schema;
        for (const key in schema) if (self2.RULES.all[key]) return true;
        return false;
      }
      function isSchemaObj(it) {
        return typeof it.schema != 'boolean';
      }
      function subSchemaObjCode(it, valid2) {
        const { schema, gen, opts } = it;
        if (opts.$comment && schema.$comment) commentKeyword(it);
        updateContext(it);
        checkAsyncSchema(it);
        const errsCount = gen.const('_errs', names_1.default.errors);
        typeAndKeywords(it, errsCount);
        gen.var(valid2, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
      }
      function checkKeywords(it) {
        (0, util_1.checkUnknownRules)(it);
        checkRefsAndKeywords(it);
      }
      function typeAndKeywords(it, errsCount) {
        if (it.opts.jtd) return schemaKeywords(it, [], false, errsCount);
        const types = (0, dataType_1.getSchemaTypes)(it.schema);
        const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
        schemaKeywords(it, types, !checkedTypes, errsCount);
      }
      function checkRefsAndKeywords(it) {
        const { schema, errSchemaPath, opts, self: self2 } = it;
        if (
          schema.$ref &&
          opts.ignoreKeywordsWithRef &&
          (0, util_1.schemaHasRulesButRef)(schema, self2.RULES)
        ) {
          self2.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
        }
      }
      function checkNoDefault(it) {
        const { schema, opts } = it;
        if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
          (0, util_1.checkStrictMode)(it, 'default is ignored in the schema root');
        }
      }
      function updateContext(it) {
        const schId = it.schema[it.opts.schemaId];
        if (schId) it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
      }
      function checkAsyncSchema(it) {
        if (it.schema.$async && !it.schemaEnv.$async)
          throw new Error('async schema in sync schema');
      }
      function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
        const msg = schema.$comment;
        if (opts.$comment === true) {
          gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
        } else if (typeof opts.$comment == 'function') {
          const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
          const rootName = gen.scopeValue('root', { ref: schemaEnv.root });
          gen.code(
            (0,
            codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`
          );
        }
      }
      function returnResults(it) {
        const { gen, schemaEnv, validateName, ValidationError, opts } = it;
        if (schemaEnv.$async) {
          gen.if(
            (0, codegen_1._)`${names_1.default.errors} === 0`,
            () => gen.return(names_1.default.data),
            () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`)
          );
        } else {
          gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
          if (opts.unevaluated) assignEvaluated(it);
          gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
        }
      }
      function assignEvaluated({ gen, evaluated, props, items }) {
        if (props instanceof codegen_1.Name)
          gen.assign((0, codegen_1._)`${evaluated}.props`, props);
        if (items instanceof codegen_1.Name)
          gen.assign((0, codegen_1._)`${evaluated}.items`, items);
      }
      function schemaKeywords(it, types, typeErrors, errsCount) {
        const { gen, schema, data, allErrors, opts, self: self2 } = it;
        const { RULES } = self2;
        if (
          schema.$ref &&
          (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))
        ) {
          gen.block(() => keywordCode(it, '$ref', RULES.all.$ref.definition));
          return;
        }
        if (!opts.jtd) checkStrictTypes(it, types);
        gen.block(() => {
          for (const group of RULES.rules) groupKeywords(group);
          groupKeywords(RULES.post);
        });
        function groupKeywords(group) {
          if (!(0, applicability_1.shouldUseGroup)(schema, group)) return;
          if (group.type) {
            gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
            iterateKeywords(it, group);
            if (types.length === 1 && types[0] === group.type && typeErrors) {
              gen.else();
              (0, dataType_2.reportTypeError)(it);
            }
            gen.endIf();
          } else {
            iterateKeywords(it, group);
          }
          if (!allErrors) gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
        }
      }
      function iterateKeywords(it, group) {
        const {
          gen,
          schema,
          opts: { useDefaults },
        } = it;
        if (useDefaults) (0, defaults_1.assignDefaults)(it, group.type);
        gen.block(() => {
          for (const rule of group.rules) {
            if ((0, applicability_1.shouldUseRule)(schema, rule)) {
              keywordCode(it, rule.keyword, rule.definition, group.type);
            }
          }
        });
      }
      function checkStrictTypes(it, types) {
        if (it.schemaEnv.meta || !it.opts.strictTypes) return;
        checkContextTypes(it, types);
        if (!it.opts.allowUnionTypes) checkMultipleTypes(it, types);
        checkKeywordTypes(it, it.dataTypes);
      }
      function checkContextTypes(it, types) {
        if (!types.length) return;
        if (!it.dataTypes.length) {
          it.dataTypes = types;
          return;
        }
        types.forEach(t => {
          if (!includesType(it.dataTypes, t)) {
            strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(',')}"`);
          }
        });
        narrowSchemaTypes(it, types);
      }
      function checkMultipleTypes(it, ts) {
        if (ts.length > 1 && !(ts.length === 2 && ts.includes('null'))) {
          strictTypesError(it, 'use allowUnionTypes to allow union type keyword');
        }
      }
      function checkKeywordTypes(it, ts) {
        const rules = it.self.RULES.all;
        for (const keyword in rules) {
          const rule = rules[keyword];
          if (typeof rule == 'object' && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
            const { type: type7 } = rule.definition;
            if (type7.length && !type7.some(t => hasApplicableType(ts, t))) {
              strictTypesError(it, `missing type "${type7.join(',')}" for keyword "${keyword}"`);
            }
          }
        }
      }
      function hasApplicableType(schTs, kwdT) {
        return schTs.includes(kwdT) || (kwdT === 'number' && schTs.includes('integer'));
      }
      function includesType(ts, t) {
        return ts.includes(t) || (t === 'integer' && ts.includes('number'));
      }
      function narrowSchemaTypes(it, withTypes) {
        const ts = [];
        for (const t of it.dataTypes) {
          if (includesType(withTypes, t)) ts.push(t);
          else if (withTypes.includes('integer') && t === 'number') ts.push('integer');
        }
        it.dataTypes = ts;
      }
      function strictTypesError(it, msg) {
        const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
        msg += ` at "${schemaPath}" (strictTypes)`;
        (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
      }
      var KeywordCxt = class {
        constructor(it, def, keyword) {
          (0, keyword_1.validateKeywordUsage)(it, def, keyword);
          this.gen = it.gen;
          this.allErrors = it.allErrors;
          this.keyword = keyword;
          this.data = it.data;
          this.schema = it.schema[keyword];
          this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
          this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
          this.schemaType = def.schemaType;
          this.parentSchema = it.schema;
          this.params = {};
          this.it = it;
          this.def = def;
          if (this.$data) {
            this.schemaCode = it.gen.const('vSchema', getData(this.$data, it));
          } else {
            this.schemaCode = this.schemaValue;
            if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
              throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
            }
          }
          if ('code' in def ? def.trackErrors : def.errors !== false) {
            this.errsCount = it.gen.const('_errs', names_1.default.errors);
          }
        }
        result(condition, successAction, failAction) {
          this.failResult((0, codegen_1.not)(condition), successAction, failAction);
        }
        failResult(condition, successAction, failAction) {
          this.gen.if(condition);
          if (failAction) failAction();
          else this.error();
          if (successAction) {
            this.gen.else();
            successAction();
            if (this.allErrors) this.gen.endIf();
          } else {
            if (this.allErrors) this.gen.endIf();
            else this.gen.else();
          }
        }
        pass(condition, failAction) {
          this.failResult((0, codegen_1.not)(condition), void 0, failAction);
        }
        fail(condition) {
          if (condition === void 0) {
            this.error();
            if (!this.allErrors) this.gen.if(false);
            return;
          }
          this.gen.if(condition);
          this.error();
          if (this.allErrors) this.gen.endIf();
          else this.gen.else();
        }
        fail$data(condition) {
          if (!this.$data) return this.fail(condition);
          const { schemaCode } = this;
          this.fail(
            (0,
            codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`
          );
        }
        error(append, errorParams, errorPaths) {
          if (errorParams) {
            this.setParams(errorParams);
            this._error(append, errorPaths);
            this.setParams({});
            return;
          }
          this._error(append, errorPaths);
        }
        _error(append, errorPaths) {
          (append ? errors_1.reportExtraError : errors_1.reportError)(
            this,
            this.def.error,
            errorPaths
          );
        }
        $dataError() {
          (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
        }
        reset() {
          if (this.errsCount === void 0) throw new Error('add "trackErrors" to keyword definition');
          (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
        }
        ok(cond) {
          if (!this.allErrors) this.gen.if(cond);
        }
        setParams(obj, assign) {
          if (assign) Object.assign(this.params, obj);
          else this.params = obj;
        }
        block$data(valid2, codeBlock, $dataValid = codegen_1.nil) {
          this.gen.block(() => {
            this.check$data(valid2, $dataValid);
            codeBlock();
          });
        }
        check$data(valid2 = codegen_1.nil, $dataValid = codegen_1.nil) {
          if (!this.$data) return;
          const { gen, schemaCode, schemaType, def } = this;
          gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
          if (valid2 !== codegen_1.nil) gen.assign(valid2, true);
          if (schemaType.length || def.validateSchema) {
            gen.elseIf(this.invalid$data());
            this.$dataError();
            if (valid2 !== codegen_1.nil) gen.assign(valid2, false);
          }
          gen.else();
        }
        invalid$data() {
          const { gen, schemaCode, schemaType, def, it } = this;
          return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
          function wrong$DataType() {
            if (schemaType.length) {
              if (!(schemaCode instanceof codegen_1.Name))
                throw new Error('ajv implementation error');
              const st = Array.isArray(schemaType) ? schemaType : [schemaType];
              return (0,
              codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
            }
            return codegen_1.nil;
          }
          function invalid$DataSchema() {
            if (def.validateSchema) {
              const validateSchemaRef = gen.scopeValue('validate$data', {
                ref: def.validateSchema,
              });
              return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
            }
            return codegen_1.nil;
          }
        }
        subschema(appl, valid2) {
          const subschema = (0, subschema_1.getSubschema)(this.it, appl);
          (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
          (0, subschema_1.extendSubschemaMode)(subschema, appl);
          const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
          subschemaCode(nextContext, valid2);
          return nextContext;
        }
        mergeEvaluated(schemaCxt, toName) {
          const { it, gen } = this;
          if (!it.opts.unevaluated) return;
          if (it.props !== true && schemaCxt.props !== void 0) {
            it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
          }
          if (it.items !== true && schemaCxt.items !== void 0) {
            it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
          }
        }
        mergeValidEvaluated(schemaCxt, valid2) {
          const { it, gen } = this;
          if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
            gen.if(valid2, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
            return true;
          }
        }
      };
      exports.KeywordCxt = KeywordCxt;
      function keywordCode(it, keyword, def, ruleType) {
        const cxt = new KeywordCxt(it, def, keyword);
        if ('code' in def) {
          def.code(cxt, ruleType);
        } else if (cxt.$data && def.validate) {
          (0, keyword_1.funcKeywordCode)(cxt, def);
        } else if ('macro' in def) {
          (0, keyword_1.macroKeywordCode)(cxt, def);
        } else if (def.compile || def.validate) {
          (0, keyword_1.funcKeywordCode)(cxt, def);
        }
      }
      var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
      var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
      function getData($data, { dataLevel, dataNames, dataPathArr }) {
        let jsonPointer;
        let data;
        if ($data === '') return names_1.default.rootData;
        if ($data[0] === '/') {
          if (!JSON_POINTER.test($data)) throw new Error(`Invalid JSON-pointer: ${$data}`);
          jsonPointer = $data;
          data = names_1.default.rootData;
        } else {
          const matches = RELATIVE_JSON_POINTER.exec($data);
          if (!matches) throw new Error(`Invalid JSON-pointer: ${$data}`);
          const up = +matches[1];
          jsonPointer = matches[2];
          if (jsonPointer === '#') {
            if (up >= dataLevel) throw new Error(errorMsg('property/index', up));
            return dataPathArr[dataLevel - up];
          }
          if (up > dataLevel) throw new Error(errorMsg('data', up));
          data = dataNames[dataLevel - up];
          if (!jsonPointer) return data;
        }
        let expr = data;
        const segments = jsonPointer.split('/');
        for (const segment of segments) {
          if (segment) {
            data = (0,
            codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
            expr = (0, codegen_1._)`${expr} && ${data}`;
          }
        }
        return expr;
        function errorMsg(pointerType, up) {
          return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
        }
      }
      exports.getData = getData;
    },
  });

  // packages/core/node_modules/ajv/dist/runtime/validation_error.js
  var require_validation_error = __commonJS({
    'packages/core/node_modules/ajv/dist/runtime/validation_error.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var ValidationError = class extends Error {
        constructor(errors) {
          super('validation failed');
          this.errors = errors;
          this.ajv = this.validation = true;
        }
      };
      exports.default = ValidationError;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/ref_error.js
  var require_ref_error = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/ref_error.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var resolve_1 = require_resolve();
      var MissingRefError = class extends Error {
        constructor(resolver, baseId, ref, msg) {
          super(msg || `can't resolve reference ${ref} from id ${baseId}`);
          this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
          this.missingSchema = (0, resolve_1.normalizeId)(
            (0, resolve_1.getFullPath)(resolver, this.missingRef)
          );
        }
      };
      exports.default = MissingRefError;
    },
  });

  // packages/core/node_modules/ajv/dist/compile/index.js
  var require_compile = __commonJS({
    'packages/core/node_modules/ajv/dist/compile/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.resolveSchema =
        exports.getCompilingSchema =
        exports.resolveRef =
        exports.compileSchema =
        exports.SchemaEnv =
          void 0;
      var codegen_1 = require_codegen();
      var validation_error_1 = require_validation_error();
      var names_1 = require_names();
      var resolve_1 = require_resolve();
      var util_1 = require_util();
      var validate_1 = require_validate();
      var SchemaEnv = class {
        constructor(env) {
          var _a;
          this.refs = {};
          this.dynamicAnchors = {};
          let schema;
          if (typeof env.schema == 'object') schema = env.schema;
          this.schema = env.schema;
          this.schemaId = env.schemaId;
          this.root = env.root || this;
          this.baseId =
            (_a = env.baseId) !== null && _a !== void 0
              ? _a
              : (0, resolve_1.normalizeId)(
                  schema === null || schema === void 0 ? void 0 : schema[env.schemaId || '$id']
                );
          this.schemaPath = env.schemaPath;
          this.localRefs = env.localRefs;
          this.meta = env.meta;
          this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
          this.refs = {};
        }
      };
      exports.SchemaEnv = SchemaEnv;
      function compileSchema(sch) {
        const _sch = getCompilingSchema.call(this, sch);
        if (_sch) return _sch;
        const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
        const { es5, lines } = this.opts.code;
        const { ownProperties } = this.opts;
        const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
        let _ValidationError;
        if (sch.$async) {
          _ValidationError = gen.scopeValue('Error', {
            ref: validation_error_1.default,
            code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`,
          });
        }
        const validateName = gen.scopeName('validate');
        sch.validateName = validateName;
        const schemaCxt = {
          gen,
          allErrors: this.opts.allErrors,
          data: names_1.default.data,
          parentData: names_1.default.parentData,
          parentDataProperty: names_1.default.parentDataProperty,
          dataNames: [names_1.default.data],
          dataPathArr: [codegen_1.nil],
          // TODO can its length be used as dataLevel if nil is removed?
          dataLevel: 0,
          dataTypes: [],
          definedProperties: /* @__PURE__ */ new Set(),
          topSchemaRef: gen.scopeValue(
            'schema',
            this.opts.code.source === true
              ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) }
              : { ref: sch.schema }
          ),
          validateName,
          ValidationError: _ValidationError,
          schema: sch.schema,
          schemaEnv: sch,
          rootId,
          baseId: sch.baseId || rootId,
          schemaPath: codegen_1.nil,
          errSchemaPath: sch.schemaPath || (this.opts.jtd ? '' : '#'),
          errorPath: (0, codegen_1._)`""`,
          opts: this.opts,
          self: this,
        };
        let sourceCode;
        try {
          this._compilations.add(sch);
          (0, validate_1.validateFunctionCode)(schemaCxt);
          gen.optimize(this.opts.code.optimize);
          const validateCode = gen.toString();
          sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
          if (this.opts.code.process) sourceCode = this.opts.code.process(sourceCode, sch);
          const makeValidate = new Function(
            `${names_1.default.self}`,
            `${names_1.default.scope}`,
            sourceCode
          );
          const validate = makeValidate(this, this.scope.get());
          this.scope.value(validateName, { ref: validate });
          validate.errors = null;
          validate.schema = sch.schema;
          validate.schemaEnv = sch;
          if (sch.$async) validate.$async = true;
          if (this.opts.code.source === true) {
            validate.source = { validateName, validateCode, scopeValues: gen._values };
          }
          if (this.opts.unevaluated) {
            const { props, items } = schemaCxt;
            validate.evaluated = {
              props: props instanceof codegen_1.Name ? void 0 : props,
              items: items instanceof codegen_1.Name ? void 0 : items,
              dynamicProps: props instanceof codegen_1.Name,
              dynamicItems: items instanceof codegen_1.Name,
            };
            if (validate.source)
              validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
          }
          sch.validate = validate;
          return sch;
        } catch (e) {
          delete sch.validate;
          delete sch.validateName;
          if (sourceCode) this.logger.error('Error compiling schema, function code:', sourceCode);
          throw e;
        } finally {
          this._compilations.delete(sch);
        }
      }
      exports.compileSchema = compileSchema;
      function resolveRef(root, baseId, ref) {
        var _a;
        ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
        const schOrFunc = root.refs[ref];
        if (schOrFunc) return schOrFunc;
        let _sch = resolve.call(this, root, ref);
        if (_sch === void 0) {
          const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref];
          const { schemaId } = this.opts;
          if (schema) _sch = new SchemaEnv({ schema, schemaId, root, baseId });
        }
        if (_sch === void 0) return;
        return (root.refs[ref] = inlineOrCompile.call(this, _sch));
      }
      exports.resolveRef = resolveRef;
      function inlineOrCompile(sch) {
        if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs)) return sch.schema;
        return sch.validate ? sch : compileSchema.call(this, sch);
      }
      function getCompilingSchema(schEnv) {
        for (const sch of this._compilations) {
          if (sameSchemaEnv(sch, schEnv)) return sch;
        }
      }
      exports.getCompilingSchema = getCompilingSchema;
      function sameSchemaEnv(s1, s2) {
        return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
      }
      function resolve(root, ref) {
        let sch;
        while (typeof (sch = this.refs[ref]) == 'string') ref = sch;
        return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
      }
      function resolveSchema(root, ref) {
        const p = this.opts.uriResolver.parse(ref);
        const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
        let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
        if (Object.keys(root.schema).length > 0 && refPath === baseId) {
          return getJsonPointer.call(this, p, root);
        }
        const id = (0, resolve_1.normalizeId)(refPath);
        const schOrRef = this.refs[id] || this.schemas[id];
        if (typeof schOrRef == 'string') {
          const sch = resolveSchema.call(this, root, schOrRef);
          if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== 'object') return;
          return getJsonPointer.call(this, p, sch);
        }
        if (
          typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== 'object'
        )
          return;
        if (!schOrRef.validate) compileSchema.call(this, schOrRef);
        if (id === (0, resolve_1.normalizeId)(ref)) {
          const { schema } = schOrRef;
          const { schemaId } = this.opts;
          const schId = schema[schemaId];
          if (schId) baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
          return new SchemaEnv({ schema, schemaId, root, baseId });
        }
        return getJsonPointer.call(this, p, schOrRef);
      }
      exports.resolveSchema = resolveSchema;
      var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
        'properties',
        'patternProperties',
        'enum',
        'dependencies',
        'definitions',
      ]);
      function getJsonPointer(parsedRef, { baseId, schema, root }) {
        var _a;
        if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== '/') return;
        for (const part of parsedRef.fragment.slice(1).split('/')) {
          if (typeof schema === 'boolean') return;
          const partSchema = schema[(0, util_1.unescapeFragment)(part)];
          if (partSchema === void 0) return;
          schema = partSchema;
          const schId = typeof schema === 'object' && schema[this.opts.schemaId];
          if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
            baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
          }
        }
        let env;
        if (
          typeof schema != 'boolean' &&
          schema.$ref &&
          !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)
        ) {
          const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
          env = resolveSchema.call(this, root, $ref);
        }
        const { schemaId } = this.opts;
        env = env || new SchemaEnv({ schema, schemaId, root, baseId });
        if (env.schema !== env.root.schema) return env;
        return void 0;
      }
    },
  });

  // packages/core/node_modules/ajv/dist/refs/data.json
  var require_data = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/data.json'(exports, module) {
      module.exports = {
        $id: 'https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#',
        description: 'Meta-schema for $data reference (JSON AnySchema extension proposal)',
        type: 'object',
        required: ['$data'],
        properties: {
          $data: {
            type: 'string',
            anyOf: [{ format: 'relative-json-pointer' }, { format: 'json-pointer' }],
          },
        },
        additionalProperties: false,
      };
    },
  });

  // packages/core/node_modules/fast-uri/lib/utils.js
  var require_utils = __commonJS({
    'packages/core/node_modules/fast-uri/lib/utils.js'(exports, module) {
      'use strict';
      var isUUID = RegExp.prototype.test.bind(
        /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu
      );
      var isIPv4 = RegExp.prototype.test.bind(
        /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u
      );
      var isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
      var isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
      var isPathCharacter = RegExp.prototype.test.bind(/^[\da-z\-._~!$&'()*+,;=:@/]$/iu);
      function stringArrayToHexStripped(input) {
        let acc = '';
        let code = 0;
        let i = 0;
        for (i = 0; i < input.length; i++) {
          code = input[i].charCodeAt(0);
          if (code === 48) {
            continue;
          }
          if (
            !(
              (code >= 48 && code <= 57) ||
              (code >= 65 && code <= 70) ||
              (code >= 97 && code <= 102)
            )
          ) {
            return '';
          }
          acc += input[i];
          break;
        }
        for (i += 1; i < input.length; i++) {
          code = input[i].charCodeAt(0);
          if (
            !(
              (code >= 48 && code <= 57) ||
              (code >= 65 && code <= 70) ||
              (code >= 97 && code <= 102)
            )
          ) {
            return '';
          }
          acc += input[i];
        }
        return acc;
      }
      var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
      function consumeIsZone(buffer) {
        buffer.length = 0;
        return true;
      }
      function consumeHextets(buffer, address, output) {
        if (buffer.length) {
          const hex = stringArrayToHexStripped(buffer);
          if (hex !== '') {
            address.push(hex);
          } else {
            output.error = true;
            return false;
          }
          buffer.length = 0;
        }
        return true;
      }
      function getIPV6(input) {
        let tokenCount = 0;
        const output = { error: false, address: '', zone: '' };
        const address = [];
        const buffer = [];
        let endipv6Encountered = false;
        let endIpv6 = false;
        let consume = consumeHextets;
        for (let i = 0; i < input.length; i++) {
          const cursor = input[i];
          if (cursor === '[' || cursor === ']') {
            continue;
          }
          if (cursor === ':') {
            if (endipv6Encountered === true) {
              endIpv6 = true;
            }
            if (!consume(buffer, address, output)) {
              break;
            }
            if (++tokenCount > 7) {
              output.error = true;
              break;
            }
            if (i > 0 && input[i - 1] === ':') {
              endipv6Encountered = true;
            }
            address.push(':');
            continue;
          } else if (cursor === '%') {
            if (!consume(buffer, address, output)) {
              break;
            }
            consume = consumeIsZone;
          } else {
            buffer.push(cursor);
            continue;
          }
        }
        if (buffer.length) {
          if (consume === consumeIsZone) {
            output.zone = buffer.join('');
          } else if (endIpv6) {
            address.push(buffer.join(''));
          } else {
            address.push(stringArrayToHexStripped(buffer));
          }
        }
        output.address = address.join('');
        return output;
      }
      function normalizeIPv6(host) {
        if (findToken(host, ':') < 2) {
          return { host, isIPV6: false };
        }
        const ipv6 = getIPV6(host);
        if (!ipv6.error) {
          let newHost = ipv6.address;
          let escapedHost = ipv6.address;
          if (ipv6.zone) {
            newHost += '%' + ipv6.zone;
            escapedHost += '%25' + ipv6.zone;
          }
          return { host: newHost, isIPV6: true, escapedHost };
        } else {
          return { host, isIPV6: false };
        }
      }
      function findToken(str, token) {
        let ind = 0;
        for (let i = 0; i < str.length; i++) {
          if (str[i] === token) ind++;
        }
        return ind;
      }
      function removeDotSegments(path) {
        let input = path;
        const output = [];
        let nextSlash = -1;
        let len = 0;
        while ((len = input.length)) {
          if (len === 1) {
            if (input === '.') {
              break;
            } else if (input === '/') {
              output.push('/');
              break;
            } else {
              output.push(input);
              break;
            }
          } else if (len === 2) {
            if (input[0] === '.') {
              if (input[1] === '.') {
                break;
              } else if (input[1] === '/') {
                input = input.slice(2);
                continue;
              }
            } else if (input[0] === '/') {
              if (input[1] === '.' || input[1] === '/') {
                output.push('/');
                break;
              }
            }
          } else if (len === 3) {
            if (input === '/..') {
              if (output.length !== 0) {
                output.pop();
              }
              output.push('/');
              break;
            }
          }
          if (input[0] === '.') {
            if (input[1] === '.') {
              if (input[2] === '/') {
                input = input.slice(3);
                continue;
              }
            } else if (input[1] === '/') {
              input = input.slice(2);
              continue;
            }
          } else if (input[0] === '/') {
            if (input[1] === '.') {
              if (input[2] === '/') {
                input = input.slice(2);
                continue;
              } else if (input[2] === '.') {
                if (input[3] === '/') {
                  input = input.slice(3);
                  if (output.length !== 0) {
                    output.pop();
                  }
                  continue;
                }
              }
            }
          }
          if ((nextSlash = input.indexOf('/', 1)) === -1) {
            output.push(input);
            break;
          } else {
            output.push(input.slice(0, nextSlash));
            input = input.slice(nextSlash);
          }
        }
        return output.join('');
      }
      var HOST_DELIMS = { '@': '%40', '/': '%2F', '?': '%3F', '#': '%23', ':': '%3A' };
      var HOST_DELIM_RE = /[@/?#:]/g;
      var HOST_DELIM_NO_COLON_RE = /[@/?#]/g;
      function reescapeHostDelimiters(host, isIP) {
        const re = isIP ? HOST_DELIM_NO_COLON_RE : HOST_DELIM_RE;
        re.lastIndex = 0;
        return host.replace(re, ch => HOST_DELIMS[ch]);
      }
      function normalizePercentEncoding(input, decodeUnreserved = false) {
        if (input.indexOf('%') === -1) {
          return input;
        }
        let output = '';
        for (let i = 0; i < input.length; i++) {
          if (input[i] === '%' && i + 2 < input.length) {
            const hex = input.slice(i + 1, i + 3);
            if (isHexPair(hex)) {
              const normalizedHex = hex.toUpperCase();
              const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
              if (decodeUnreserved && isUnreserved(decoded)) {
                output += decoded;
              } else {
                output += '%' + normalizedHex;
              }
              i += 2;
              continue;
            }
          }
          output += input[i];
        }
        return output;
      }
      function normalizePathEncoding(input) {
        let output = '';
        for (let i = 0; i < input.length; i++) {
          if (input[i] === '%' && i + 2 < input.length) {
            const hex = input.slice(i + 1, i + 3);
            if (isHexPair(hex)) {
              const normalizedHex = hex.toUpperCase();
              const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
              if (decoded !== '.' && isUnreserved(decoded)) {
                output += decoded;
              } else {
                output += '%' + normalizedHex;
              }
              i += 2;
              continue;
            }
          }
          if (isPathCharacter(input[i])) {
            output += input[i];
          } else {
            output += escape(input[i]);
          }
        }
        return output;
      }
      function escapePreservingEscapes(input) {
        let output = '';
        for (let i = 0; i < input.length; i++) {
          if (input[i] === '%' && i + 2 < input.length) {
            const hex = input.slice(i + 1, i + 3);
            if (isHexPair(hex)) {
              output += '%' + hex.toUpperCase();
              i += 2;
              continue;
            }
          }
          output += escape(input[i]);
        }
        return output;
      }
      function recomposeAuthority(component) {
        const uriTokens = [];
        if (component.userinfo !== void 0) {
          uriTokens.push(component.userinfo);
          uriTokens.push('@');
        }
        if (component.host !== void 0) {
          let host = unescape(component.host);
          if (!isIPv4(host)) {
            const ipV6res = normalizeIPv6(host);
            if (ipV6res.isIPV6 === true) {
              host = `[${ipV6res.escapedHost}]`;
            } else {
              host = reescapeHostDelimiters(host, false);
            }
          }
          uriTokens.push(host);
        }
        if (typeof component.port === 'number' || typeof component.port === 'string') {
          uriTokens.push(':');
          uriTokens.push(String(component.port));
        }
        return uriTokens.length ? uriTokens.join('') : void 0;
      }
      module.exports = {
        nonSimpleDomain,
        recomposeAuthority,
        reescapeHostDelimiters,
        normalizePercentEncoding,
        normalizePathEncoding,
        escapePreservingEscapes,
        removeDotSegments,
        isIPv4,
        isUUID,
        normalizeIPv6,
        stringArrayToHexStripped,
      };
    },
  });

  // packages/core/node_modules/fast-uri/lib/schemes.js
  var require_schemes = __commonJS({
    'packages/core/node_modules/fast-uri/lib/schemes.js'(exports, module) {
      'use strict';
      var { isUUID } = require_utils();
      var URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
      var supportedSchemeNames =
        /** @type {const} */
        ['http', 'https', 'ws', 'wss', 'urn', 'urn:uuid'];
      function isValidSchemeName(name) {
        return (
          supportedSchemeNames.indexOf(
            /** @type {*} */
            name
          ) !== -1
        );
      }
      function wsIsSecure(wsComponent) {
        if (wsComponent.secure === true) {
          return true;
        } else if (wsComponent.secure === false) {
          return false;
        } else if (wsComponent.scheme) {
          return (
            wsComponent.scheme.length === 3 &&
            (wsComponent.scheme[0] === 'w' || wsComponent.scheme[0] === 'W') &&
            (wsComponent.scheme[1] === 's' || wsComponent.scheme[1] === 'S') &&
            (wsComponent.scheme[2] === 's' || wsComponent.scheme[2] === 'S')
          );
        } else {
          return false;
        }
      }
      function httpParse(component) {
        if (!component.host) {
          component.error = component.error || 'HTTP URIs must have a host.';
        }
        return component;
      }
      function httpSerialize(component) {
        const secure = String(component.scheme).toLowerCase() === 'https';
        if (component.port === (secure ? 443 : 80) || component.port === '') {
          component.port = void 0;
        }
        if (!component.path) {
          component.path = '/';
        }
        return component;
      }
      function wsParse(wsComponent) {
        wsComponent.secure = wsIsSecure(wsComponent);
        wsComponent.resourceName =
          (wsComponent.path || '/') + (wsComponent.query ? '?' + wsComponent.query : '');
        wsComponent.path = void 0;
        wsComponent.query = void 0;
        return wsComponent;
      }
      function wsSerialize(wsComponent) {
        if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === '') {
          wsComponent.port = void 0;
        }
        if (typeof wsComponent.secure === 'boolean') {
          wsComponent.scheme = wsComponent.secure ? 'wss' : 'ws';
          wsComponent.secure = void 0;
        }
        if (wsComponent.resourceName) {
          const [path, query] = wsComponent.resourceName.split('?');
          wsComponent.path = path && path !== '/' ? path : void 0;
          wsComponent.query = query;
          wsComponent.resourceName = void 0;
        }
        wsComponent.fragment = void 0;
        return wsComponent;
      }
      function urnParse(urnComponent, options) {
        if (!urnComponent.path) {
          urnComponent.error = 'URN can not be parsed';
          return urnComponent;
        }
        const matches = urnComponent.path.match(URN_REG);
        if (matches) {
          const scheme = options.scheme || urnComponent.scheme || 'urn';
          urnComponent.nid = matches[1].toLowerCase();
          urnComponent.nss = matches[2];
          const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
          const schemeHandler = getSchemeHandler(urnScheme);
          urnComponent.path = void 0;
          if (schemeHandler) {
            urnComponent = schemeHandler.parse(urnComponent, options);
          }
        } else {
          urnComponent.error = urnComponent.error || 'URN can not be parsed.';
        }
        return urnComponent;
      }
      function urnSerialize(urnComponent, options) {
        if (urnComponent.nid === void 0) {
          throw new Error('URN without nid cannot be serialized');
        }
        const scheme = options.scheme || urnComponent.scheme || 'urn';
        const nid = urnComponent.nid.toLowerCase();
        const urnScheme = `${scheme}:${options.nid || nid}`;
        const schemeHandler = getSchemeHandler(urnScheme);
        if (schemeHandler) {
          urnComponent = schemeHandler.serialize(urnComponent, options);
        }
        const uriComponent = urnComponent;
        const nss = urnComponent.nss;
        uriComponent.path = `${nid || options.nid}:${nss}`;
        options.skipEscape = true;
        return uriComponent;
      }
      function urnuuidParse(urnComponent, options) {
        const uuidComponent = urnComponent;
        uuidComponent.uuid = uuidComponent.nss;
        uuidComponent.nss = void 0;
        if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
          uuidComponent.error = uuidComponent.error || 'UUID is not valid.';
        }
        return uuidComponent;
      }
      function urnuuidSerialize(uuidComponent) {
        const urnComponent = uuidComponent;
        urnComponent.nss = (uuidComponent.uuid || '').toLowerCase();
        return urnComponent;
      }
      var http =
        /** @type {SchemeHandler} */
        {
          scheme: 'http',
          domainHost: true,
          parse: httpParse,
          serialize: httpSerialize,
        };
      var https =
        /** @type {SchemeHandler} */
        {
          scheme: 'https',
          domainHost: http.domainHost,
          parse: httpParse,
          serialize: httpSerialize,
        };
      var ws =
        /** @type {SchemeHandler} */
        {
          scheme: 'ws',
          domainHost: true,
          parse: wsParse,
          serialize: wsSerialize,
        };
      var wss =
        /** @type {SchemeHandler} */
        {
          scheme: 'wss',
          domainHost: ws.domainHost,
          parse: ws.parse,
          serialize: ws.serialize,
        };
      var urn =
        /** @type {SchemeHandler} */
        {
          scheme: 'urn',
          parse: urnParse,
          serialize: urnSerialize,
          skipNormalize: true,
        };
      var urnuuid =
        /** @type {SchemeHandler} */
        {
          scheme: 'urn:uuid',
          parse: urnuuidParse,
          serialize: urnuuidSerialize,
          skipNormalize: true,
        };
      var SCHEMES =
        /** @type {Record<SchemeName, SchemeHandler>} */
        {
          http,
          https,
          ws,
          wss,
          urn,
          'urn:uuid': urnuuid,
        };
      Object.setPrototypeOf(SCHEMES, null);
      function getSchemeHandler(scheme) {
        return (
          (scheme &&
            /** @type {SchemeName} */
            (
              SCHEMES[scheme] ||
                SCHEMES[
                  /** @type {SchemeName} */
                  scheme.toLowerCase()
                ]
            )) ||
          void 0
        );
      }
      module.exports = {
        wsIsSecure,
        SCHEMES,
        isValidSchemeName,
        getSchemeHandler,
      };
    },
  });

  // packages/core/node_modules/fast-uri/index.js
  var require_fast_uri = __commonJS({
    'packages/core/node_modules/fast-uri/index.js'(exports, module) {
      'use strict';
      var {
        normalizeIPv6,
        removeDotSegments,
        recomposeAuthority,
        normalizePercentEncoding,
        normalizePathEncoding,
        escapePreservingEscapes,
        reescapeHostDelimiters,
        isIPv4,
        nonSimpleDomain,
      } = require_utils();
      var { SCHEMES, getSchemeHandler } = require_schemes();
      function normalize(uri, options) {
        if (typeof uri === 'string') {
          uri = /** @type {T} */ normalizeString(uri, options);
        } else if (typeof uri === 'object') {
          uri = /** @type {T} */ parse(serialize(uri, options), options);
        }
        return uri;
      }
      function resolve(baseURI, relativeURI, options) {
        const schemelessOptions = options
          ? Object.assign({ scheme: 'null' }, options)
          : { scheme: 'null' };
        const { parsed: baseParsed, malformedAuthorityOrPort: baseMalformed } = parseWithStatus(
          baseURI,
          schemelessOptions
        );
        const { parsed: relativeParsed, malformedAuthorityOrPort: relativeMalformed } =
          parseWithStatus(relativeURI, schemelessOptions);
        if (baseMalformed || relativeMalformed) {
          throw new Error(baseParsed.error || relativeParsed.error || 'URI is malformed.');
        }
        const resolved = resolveComponent(baseParsed, relativeParsed, schemelessOptions, true);
        schemelessOptions.skipEscape = true;
        return serialize(resolved, schemelessOptions);
      }
      function resolveComponent(base, relative, options, skipNormalization) {
        const target = {};
        if (!skipNormalization) {
          base = parse(serialize(base, options), options);
          relative = parse(serialize(relative, options), options);
        }
        options = options || {};
        if (!options.tolerant && relative.scheme) {
          target.scheme = relative.scheme;
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || '');
          target.query = relative.query;
        } else {
          if (
            relative.userinfo !== void 0 ||
            relative.host !== void 0 ||
            relative.port !== void 0
          ) {
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || '');
            target.query = relative.query;
          } else {
            if (!relative.path) {
              target.path = base.path;
              if (relative.query !== void 0) {
                target.query = relative.query;
              } else {
                target.query = base.query;
              }
            } else {
              if (relative.path[0] === '/') {
                target.path = removeDotSegments(relative.path);
              } else {
                if (
                  (base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) &&
                  !base.path
                ) {
                  target.path = '/' + relative.path;
                } else if (!base.path) {
                  target.path = relative.path;
                } else {
                  target.path = base.path.slice(0, base.path.lastIndexOf('/') + 1) + relative.path;
                }
                target.path = removeDotSegments(target.path);
              }
              target.query = relative.query;
            }
            target.userinfo = base.userinfo;
            target.host = base.host;
            target.port = base.port;
          }
          target.scheme = base.scheme;
        }
        target.fragment = relative.fragment;
        return target;
      }
      function equal(uriA, uriB, options) {
        const normalizedA = normalizeComparableURI(uriA, options);
        const normalizedB = normalizeComparableURI(uriB, options);
        return (
          normalizedA !== void 0 &&
          normalizedB !== void 0 &&
          normalizedA.toLowerCase() === normalizedB.toLowerCase()
        );
      }
      function serialize(cmpts, opts) {
        const component = {
          host: cmpts.host,
          scheme: cmpts.scheme,
          userinfo: cmpts.userinfo,
          port: cmpts.port,
          path: cmpts.path,
          query: cmpts.query,
          nid: cmpts.nid,
          nss: cmpts.nss,
          uuid: cmpts.uuid,
          fragment: cmpts.fragment,
          reference: cmpts.reference,
          resourceName: cmpts.resourceName,
          secure: cmpts.secure,
          error: '',
        };
        const options = Object.assign({}, opts);
        const uriTokens = [];
        const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
        if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
        if (component.path !== void 0) {
          if (!options.skipEscape) {
            component.path = escapePreservingEscapes(component.path);
            if (component.scheme !== void 0) {
              component.path = component.path.split('%3A').join(':');
            }
          } else {
            component.path = normalizePercentEncoding(component.path);
          }
        }
        if (options.reference !== 'suffix' && component.scheme) {
          uriTokens.push(component.scheme, ':');
        }
        const authority = recomposeAuthority(component);
        if (authority !== void 0) {
          if (options.reference !== 'suffix') {
            uriTokens.push('//');
          }
          uriTokens.push(authority);
          if (component.path && component.path[0] !== '/') {
            uriTokens.push('/');
          }
        }
        if (component.path !== void 0) {
          let s = component.path;
          if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
            s = removeDotSegments(s);
          }
          if (authority === void 0 && s[0] === '/' && s[1] === '/') {
            s = '/%2F' + s.slice(2);
          }
          uriTokens.push(s);
        }
        if (component.query !== void 0) {
          uriTokens.push('?', component.query);
        }
        if (component.fragment !== void 0) {
          uriTokens.push('#', component.fragment);
        }
        return uriTokens.join('');
      }
      var URI_PARSE =
        /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
      var AUTHORITY_PREFIX = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
      var AUTHORITY_INTRODUCER_REGION = /^(?:[^#/:?]+:)?([/\\\t\n\r]*)/;
      function getParseError(parsed, matches) {
        if (matches[2] !== void 0 && parsed.path && parsed.path[0] !== '/') {
          return 'URI path must start with "/" when authority is present.';
        }
        if (typeof parsed.port === 'number' && (parsed.port < 0 || parsed.port > 65535)) {
          return 'URI port is malformed.';
        }
        return void 0;
      }
      function parseWithStatus(uri, opts) {
        const options = Object.assign({}, opts);
        const parsed = {
          scheme: void 0,
          userinfo: void 0,
          host: '',
          port: void 0,
          path: '',
          query: void 0,
          fragment: void 0,
        };
        let malformedAuthorityOrPort = false;
        let isIP = false;
        if (options.reference === 'suffix') {
          if (options.scheme) {
            uri = options.scheme + ':' + uri;
          } else {
            uri = '//' + uri;
          }
        }
        const authorityMatch = uri.match(AUTHORITY_PREFIX);
        if (authorityMatch !== null && authorityMatch[1].indexOf('\\') !== -1) {
          parsed.error = 'URI authority must not contain a literal backslash.';
          malformedAuthorityOrPort = true;
        }
        const introducerMatch = uri.match(AUTHORITY_INTRODUCER_REGION);
        if (introducerMatch !== null) {
          const region = introducerMatch[1];
          const normalizedRegion = region.replace(/[\t\n\r]/g, '');
          if (normalizedRegion.length >= 2) {
            if (normalizedRegion.slice(0, 2) !== '//') {
              parsed.error = parsed.error || 'URI authority must not contain a literal backslash.';
              malformedAuthorityOrPort = true;
            } else if (region.length !== normalizedRegion.length) {
              parsed.error =
                parsed.error || 'URI authority introducer must not contain whitespace.';
              malformedAuthorityOrPort = true;
            }
          }
        }
        const matches = uri.match(URI_PARSE);
        if (matches) {
          parsed.scheme = matches[1];
          parsed.userinfo = matches[3];
          parsed.host = matches[4];
          parsed.port = parseInt(matches[5], 10);
          parsed.path = matches[6] || '';
          parsed.query = matches[7];
          parsed.fragment = matches[8];
          if (isNaN(parsed.port)) {
            parsed.port = matches[5];
          }
          const parseError = getParseError(parsed, matches);
          if (parseError !== void 0) {
            parsed.error = parsed.error || parseError;
            malformedAuthorityOrPort = true;
          }
          if (parsed.host) {
            const ipv4result = isIPv4(parsed.host);
            if (ipv4result === false) {
              const ipv6result = normalizeIPv6(parsed.host);
              parsed.host = ipv6result.host.toLowerCase();
              isIP = ipv6result.isIPV6;
            } else {
              isIP = true;
            }
          }
          if (
            parsed.scheme === void 0 &&
            parsed.userinfo === void 0 &&
            parsed.host === void 0 &&
            parsed.port === void 0 &&
            parsed.query === void 0 &&
            !parsed.path
          ) {
            parsed.reference = 'same-document';
          } else if (parsed.scheme === void 0) {
            parsed.reference = 'relative';
          } else if (parsed.fragment === void 0) {
            parsed.reference = 'absolute';
          } else {
            parsed.reference = 'uri';
          }
          if (
            options.reference &&
            options.reference !== 'suffix' &&
            options.reference !== parsed.reference
          ) {
            parsed.error = parsed.error || 'URI is not a ' + options.reference + ' reference.';
          }
          const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
          if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
            if (
              parsed.host &&
              (options.domainHost || (schemeHandler && schemeHandler.domainHost)) &&
              isIP === false &&
              nonSimpleDomain(parsed.host)
            ) {
              try {
                parsed.host = new URL('http://' + parsed.host).hostname;
              } catch (e) {
                parsed.error =
                  parsed.error || "Host's domain name can not be converted to ASCII: " + e;
              }
            }
          }
          if (!schemeHandler || (schemeHandler && !schemeHandler.skipNormalize)) {
            if (uri.indexOf('%') !== -1) {
              if (parsed.scheme !== void 0) {
                parsed.scheme = unescape(parsed.scheme);
              }
              if (parsed.host !== void 0) {
                parsed.host = reescapeHostDelimiters(unescape(parsed.host), isIP);
              }
            }
            if (parsed.path) {
              parsed.path = normalizePathEncoding(parsed.path);
            }
            if (parsed.fragment) {
              try {
                parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
              } catch {
                parsed.error = parsed.error || 'URI malformed';
              }
            }
          }
          if (schemeHandler && schemeHandler.parse) {
            schemeHandler.parse(parsed, options);
          }
        } else {
          parsed.error = parsed.error || 'URI can not be parsed.';
        }
        return { parsed, malformedAuthorityOrPort };
      }
      function parse(uri, opts) {
        return parseWithStatus(uri, opts).parsed;
      }
      function normalizeString(uri, opts) {
        return normalizeStringWithStatus(uri, opts).normalized;
      }
      function normalizeStringWithStatus(uri, opts) {
        const { parsed, malformedAuthorityOrPort } = parseWithStatus(uri, opts);
        return {
          normalized: malformedAuthorityOrPort ? uri : serialize(parsed, opts),
          malformedAuthorityOrPort,
        };
      }
      function normalizeComparableURI(uri, opts) {
        if (typeof uri === 'string') {
          const { normalized, malformedAuthorityOrPort } = normalizeStringWithStatus(uri, opts);
          return malformedAuthorityOrPort ? void 0 : normalized;
        }
        if (typeof uri === 'object') {
          return serialize(uri, opts);
        }
      }
      var fastUri = {
        SCHEMES,
        normalize,
        resolve,
        resolveComponent,
        equal,
        serialize,
        parse,
      };
      module.exports = fastUri;
      module.exports.default = fastUri;
      module.exports.fastUri = fastUri;
    },
  });

  // packages/core/node_modules/ajv/dist/runtime/uri.js
  var require_uri = __commonJS({
    'packages/core/node_modules/ajv/dist/runtime/uri.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var uri = require_fast_uri();
      uri.code = 'require("ajv/dist/runtime/uri").default';
      exports.default = uri;
    },
  });

  // packages/core/node_modules/ajv/dist/core.js
  var require_core = __commonJS({
    'packages/core/node_modules/ajv/dist/core.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.CodeGen =
        exports.Name =
        exports.nil =
        exports.stringify =
        exports.str =
        exports._ =
        exports.KeywordCxt =
          void 0;
      var validate_1 = require_validate();
      Object.defineProperty(exports, 'KeywordCxt', {
        enumerable: true,
        get: function () {
          return validate_1.KeywordCxt;
        },
      });
      var codegen_1 = require_codegen();
      Object.defineProperty(exports, '_', {
        enumerable: true,
        get: function () {
          return codegen_1._;
        },
      });
      Object.defineProperty(exports, 'str', {
        enumerable: true,
        get: function () {
          return codegen_1.str;
        },
      });
      Object.defineProperty(exports, 'stringify', {
        enumerable: true,
        get: function () {
          return codegen_1.stringify;
        },
      });
      Object.defineProperty(exports, 'nil', {
        enumerable: true,
        get: function () {
          return codegen_1.nil;
        },
      });
      Object.defineProperty(exports, 'Name', {
        enumerable: true,
        get: function () {
          return codegen_1.Name;
        },
      });
      Object.defineProperty(exports, 'CodeGen', {
        enumerable: true,
        get: function () {
          return codegen_1.CodeGen;
        },
      });
      var validation_error_1 = require_validation_error();
      var ref_error_1 = require_ref_error();
      var rules_1 = require_rules();
      var compile_1 = require_compile();
      var codegen_2 = require_codegen();
      var resolve_1 = require_resolve();
      var dataType_1 = require_dataType();
      var util_1 = require_util();
      var $dataRefSchema = require_data();
      var uri_1 = require_uri();
      var defaultRegExp = (str, flags) => new RegExp(str, flags);
      defaultRegExp.code = 'new RegExp';
      var META_IGNORE_OPTIONS = ['removeAdditional', 'useDefaults', 'coerceTypes'];
      var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
        'validate',
        'serialize',
        'parse',
        'wrapper',
        'root',
        'schema',
        'keyword',
        'pattern',
        'formats',
        'validate$data',
        'func',
        'obj',
        'Error',
      ]);
      var removedOptions = {
        errorDataPath: '',
        format: '`validateFormats: false` can be used instead.',
        nullable: '"nullable" keyword is supported by default.',
        jsonPointers: 'Deprecated jsPropertySyntax can be used instead.',
        extendRefs: 'Deprecated ignoreKeywordsWithRef can be used instead.',
        missingRefs: 'Pass empty schema with $id that should be ignored to ajv.addSchema.',
        processCode: 'Use option `code: {process: (code, schemaEnv: object) => string}`',
        sourceCode: 'Use option `code: {source: true}`',
        strictDefaults: 'It is default now, see option `strict`.',
        strictKeywords: 'It is default now, see option `strict`.',
        uniqueItems: '"uniqueItems" keyword is always validated.',
        unknownFormats:
          'Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).',
        cache: 'Map is used as cache, schema object as key.',
        serialize: 'Map is used as cache, schema object as key.',
        ajvErrors: 'It is default now.',
      };
      var deprecatedOptions = {
        ignoreKeywordsWithRef: '',
        jsPropertySyntax: '',
        unicode: '"minLength"/"maxLength" account for unicode characters by default.',
      };
      var MAX_EXPRESSION = 200;
      function requiredOptions(o) {
        var _a,
          _b,
          _c,
          _d,
          _e,
          _f,
          _g,
          _h,
          _j,
          _k,
          _l,
          _m,
          _o,
          _p,
          _q,
          _r,
          _s,
          _t,
          _u,
          _v,
          _w,
          _x,
          _y,
          _z,
          _0;
        const s = o.strict;
        const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
        const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
        const regExp =
          (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null &&
          _c !== void 0
            ? _c
            : defaultRegExp;
        const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
        return {
          strictSchema:
            (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null &&
            _f !== void 0
              ? _f
              : true,
          strictNumbers:
            (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null &&
            _h !== void 0
              ? _h
              : true,
          strictTypes:
            (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0
              ? _k
              : 'log',
          strictTuples:
            (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null &&
            _m !== void 0
              ? _m
              : 'log',
          strictRequired:
            (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null &&
            _p !== void 0
              ? _p
              : false,
          code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
          loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
          loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
          meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
          messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
          inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
          schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : '$id',
          addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
          validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
          validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
          unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
          int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
          uriResolver,
        };
      }
      var Ajv2 = class {
        constructor(opts = {}) {
          this.schemas = {};
          this.refs = {};
          this.formats = /* @__PURE__ */ Object.create(null);
          this._compilations = /* @__PURE__ */ new Set();
          this._loading = {};
          this._cache = /* @__PURE__ */ new Map();
          opts = this.opts = { ...opts, ...requiredOptions(opts) };
          const { es5, lines } = this.opts.code;
          this.scope = new codegen_2.ValueScope({
            scope: {},
            prefixes: EXT_SCOPE_NAMES,
            es5,
            lines,
          });
          this.logger = getLogger(opts.logger);
          const formatOpt = opts.validateFormats;
          opts.validateFormats = false;
          this.RULES = (0, rules_1.getRules)();
          checkOptions.call(this, removedOptions, opts, 'NOT SUPPORTED');
          checkOptions.call(this, deprecatedOptions, opts, 'DEPRECATED', 'warn');
          this._metaOpts = getMetaSchemaOptions.call(this);
          if (opts.formats) addInitialFormats.call(this);
          this._addVocabularies();
          this._addDefaultMetaSchema();
          if (opts.keywords) addInitialKeywords.call(this, opts.keywords);
          if (typeof opts.meta == 'object') this.addMetaSchema(opts.meta);
          addInitialSchemas.call(this);
          opts.validateFormats = formatOpt;
        }
        _addVocabularies() {
          this.addKeyword('$async');
        }
        _addDefaultMetaSchema() {
          const { $data, meta, schemaId } = this.opts;
          let _dataRefSchema = $dataRefSchema;
          if (schemaId === 'id') {
            _dataRefSchema = { ...$dataRefSchema };
            _dataRefSchema.id = _dataRefSchema.$id;
            delete _dataRefSchema.$id;
          }
          if (meta && $data) this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
        }
        defaultMeta() {
          const { meta, schemaId } = this.opts;
          return (this.opts.defaultMeta =
            typeof meta == 'object' ? meta[schemaId] || meta : void 0);
        }
        validate(schemaKeyRef, data) {
          let v;
          if (typeof schemaKeyRef == 'string') {
            v = this.getSchema(schemaKeyRef);
            if (!v) throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
          } else {
            v = this.compile(schemaKeyRef);
          }
          const valid2 = v(data);
          if (!('$async' in v)) this.errors = v.errors;
          return valid2;
        }
        compile(schema, _meta) {
          const sch = this._addSchema(schema, _meta);
          return sch.validate || this._compileSchemaEnv(sch);
        }
        compileAsync(schema, meta) {
          if (typeof this.opts.loadSchema != 'function') {
            throw new Error('options.loadSchema should be a function');
          }
          const { loadSchema } = this.opts;
          return runCompileAsync.call(this, schema, meta);
          async function runCompileAsync(_schema, _meta) {
            await loadMetaSchema.call(this, _schema.$schema);
            const sch = this._addSchema(_schema, _meta);
            return sch.validate || _compileAsync.call(this, sch);
          }
          async function loadMetaSchema($ref) {
            if ($ref && !this.getSchema($ref)) {
              await runCompileAsync.call(this, { $ref }, true);
            }
          }
          async function _compileAsync(sch) {
            try {
              return this._compileSchemaEnv(sch);
            } catch (e) {
              if (!(e instanceof ref_error_1.default)) throw e;
              checkLoaded.call(this, e);
              await loadMissingSchema.call(this, e.missingSchema);
              return _compileAsync.call(this, sch);
            }
          }
          function checkLoaded({ missingSchema: ref, missingRef }) {
            if (this.refs[ref]) {
              throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
            }
          }
          async function loadMissingSchema(ref) {
            const _schema = await _loadSchema.call(this, ref);
            if (!this.refs[ref]) await loadMetaSchema.call(this, _schema.$schema);
            if (!this.refs[ref]) this.addSchema(_schema, ref, meta);
          }
          async function _loadSchema(ref) {
            const p = this._loading[ref];
            if (p) return p;
            try {
              return await (this._loading[ref] = loadSchema(ref));
            } finally {
              delete this._loading[ref];
            }
          }
        }
        // Adds schema to the instance
        addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
          if (Array.isArray(schema)) {
            for (const sch of schema) this.addSchema(sch, void 0, _meta, _validateSchema);
            return this;
          }
          let id;
          if (typeof schema === 'object') {
            const { schemaId } = this.opts;
            id = schema[schemaId];
            if (id !== void 0 && typeof id != 'string') {
              throw new Error(`schema ${schemaId} must be string`);
            }
          }
          key = (0, resolve_1.normalizeId)(key || id);
          this._checkUnique(key);
          this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
          return this;
        }
        // Add schema that will be used to validate other schemas
        // options in META_IGNORE_OPTIONS are alway set to false
        addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
          this.addSchema(schema, key, true, _validateSchema);
          return this;
        }
        //  Validate schema against its meta-schema
        validateSchema(schema, throwOrLogError) {
          if (typeof schema == 'boolean') return true;
          let $schema7;
          $schema7 = schema.$schema;
          if ($schema7 !== void 0 && typeof $schema7 != 'string') {
            throw new Error('$schema must be a string');
          }
          $schema7 = $schema7 || this.opts.defaultMeta || this.defaultMeta();
          if (!$schema7) {
            this.logger.warn('meta-schema not available');
            this.errors = null;
            return true;
          }
          const valid2 = this.validate($schema7, schema);
          if (!valid2 && throwOrLogError) {
            const message = 'schema is invalid: ' + this.errorsText();
            if (this.opts.validateSchema === 'log') this.logger.error(message);
            else throw new Error(message);
          }
          return valid2;
        }
        // Get compiled schema by `key` or `ref`.
        // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
        getSchema(keyRef) {
          let sch;
          while (typeof (sch = getSchEnv.call(this, keyRef)) == 'string') keyRef = sch;
          if (sch === void 0) {
            const { schemaId } = this.opts;
            const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
            sch = compile_1.resolveSchema.call(this, root, keyRef);
            if (!sch) return;
            this.refs[keyRef] = sch;
          }
          return sch.validate || this._compileSchemaEnv(sch);
        }
        // Remove cached schema(s).
        // If no parameter is passed all schemas but meta-schemas are removed.
        // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
        // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
        removeSchema(schemaKeyRef) {
          if (schemaKeyRef instanceof RegExp) {
            this._removeAllSchemas(this.schemas, schemaKeyRef);
            this._removeAllSchemas(this.refs, schemaKeyRef);
            return this;
          }
          switch (typeof schemaKeyRef) {
            case 'undefined':
              this._removeAllSchemas(this.schemas);
              this._removeAllSchemas(this.refs);
              this._cache.clear();
              return this;
            case 'string': {
              const sch = getSchEnv.call(this, schemaKeyRef);
              if (typeof sch == 'object') this._cache.delete(sch.schema);
              delete this.schemas[schemaKeyRef];
              delete this.refs[schemaKeyRef];
              return this;
            }
            case 'object': {
              const cacheKey = schemaKeyRef;
              this._cache.delete(cacheKey);
              let id = schemaKeyRef[this.opts.schemaId];
              if (id) {
                id = (0, resolve_1.normalizeId)(id);
                delete this.schemas[id];
                delete this.refs[id];
              }
              return this;
            }
            default:
              throw new Error('ajv.removeSchema: invalid parameter');
          }
        }
        // add "vocabulary" - a collection of keywords
        addVocabulary(definitions) {
          for (const def of definitions) this.addKeyword(def);
          return this;
        }
        addKeyword(kwdOrDef, def) {
          let keyword;
          if (typeof kwdOrDef == 'string') {
            keyword = kwdOrDef;
            if (typeof def == 'object') {
              this.logger.warn('these parameters are deprecated, see docs for addKeyword');
              def.keyword = keyword;
            }
          } else if (typeof kwdOrDef == 'object' && def === void 0) {
            def = kwdOrDef;
            keyword = def.keyword;
            if (Array.isArray(keyword) && !keyword.length) {
              throw new Error('addKeywords: keyword must be string or non-empty array');
            }
          } else {
            throw new Error('invalid addKeywords parameters');
          }
          checkKeyword.call(this, keyword, def);
          if (!def) {
            (0, util_1.eachItem)(keyword, kwd => addRule.call(this, kwd));
            return this;
          }
          keywordMetaschema.call(this, def);
          const definition = {
            ...def,
            type: (0, dataType_1.getJSONTypes)(def.type),
            schemaType: (0, dataType_1.getJSONTypes)(def.schemaType),
          };
          (0, util_1.eachItem)(
            keyword,
            definition.type.length === 0
              ? k => addRule.call(this, k, definition)
              : k => definition.type.forEach(t => addRule.call(this, k, definition, t))
          );
          return this;
        }
        getKeyword(keyword) {
          const rule = this.RULES.all[keyword];
          return typeof rule == 'object' ? rule.definition : !!rule;
        }
        // Remove keyword
        removeKeyword(keyword) {
          const { RULES } = this;
          delete RULES.keywords[keyword];
          delete RULES.all[keyword];
          for (const group of RULES.rules) {
            const i = group.rules.findIndex(rule => rule.keyword === keyword);
            if (i >= 0) group.rules.splice(i, 1);
          }
          return this;
        }
        // Add format
        addFormat(name, format) {
          if (typeof format == 'string') format = new RegExp(format);
          this.formats[name] = format;
          return this;
        }
        errorsText(errors = this.errors, { separator = ', ', dataVar = 'data' } = {}) {
          if (!errors || errors.length === 0) return 'No errors';
          return errors
            .map(e => `${dataVar}${e.instancePath} ${e.message}`)
            .reduce((text, msg) => text + separator + msg);
        }
        $dataMetaSchema(metaSchema, keywordsJsonPointers) {
          const rules = this.RULES.all;
          metaSchema = JSON.parse(JSON.stringify(metaSchema));
          for (const jsonPointer of keywordsJsonPointers) {
            const segments = jsonPointer.split('/').slice(1);
            let keywords = metaSchema;
            for (const seg of segments) keywords = keywords[seg];
            for (const key in rules) {
              const rule = rules[key];
              if (typeof rule != 'object') continue;
              const { $data } = rule.definition;
              const schema = keywords[key];
              if ($data && schema) keywords[key] = schemaOrData(schema);
            }
          }
          return metaSchema;
        }
        _removeAllSchemas(schemas, regex) {
          for (const keyRef in schemas) {
            const sch = schemas[keyRef];
            if (!regex || regex.test(keyRef)) {
              if (typeof sch == 'string') {
                delete schemas[keyRef];
              } else if (sch && !sch.meta) {
                this._cache.delete(sch.schema);
                delete schemas[keyRef];
              }
            }
          }
        }
        _addSchema(
          schema,
          meta,
          baseId,
          validateSchema = this.opts.validateSchema,
          addSchema = this.opts.addUsedSchema
        ) {
          let id;
          const { schemaId } = this.opts;
          if (typeof schema == 'object') {
            id = schema[schemaId];
          } else {
            if (this.opts.jtd) throw new Error('schema must be object');
            else if (typeof schema != 'boolean')
              throw new Error('schema must be object or boolean');
          }
          let sch = this._cache.get(schema);
          if (sch !== void 0) return sch;
          baseId = (0, resolve_1.normalizeId)(id || baseId);
          const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
          sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
          this._cache.set(sch.schema, sch);
          if (addSchema && !baseId.startsWith('#')) {
            if (baseId) this._checkUnique(baseId);
            this.refs[baseId] = sch;
          }
          if (validateSchema) this.validateSchema(schema, true);
          return sch;
        }
        _checkUnique(id) {
          if (this.schemas[id] || this.refs[id]) {
            throw new Error(`schema with key or id "${id}" already exists`);
          }
        }
        _compileSchemaEnv(sch) {
          if (sch.meta) this._compileMetaSchema(sch);
          else compile_1.compileSchema.call(this, sch);
          if (!sch.validate) throw new Error('ajv implementation error');
          return sch.validate;
        }
        _compileMetaSchema(sch) {
          const currentOpts = this.opts;
          this.opts = this._metaOpts;
          try {
            compile_1.compileSchema.call(this, sch);
          } finally {
            this.opts = currentOpts;
          }
        }
      };
      Ajv2.ValidationError = validation_error_1.default;
      Ajv2.MissingRefError = ref_error_1.default;
      exports.default = Ajv2;
      function checkOptions(checkOpts, options, msg, log = 'error') {
        for (const key in checkOpts) {
          const opt = key;
          if (opt in options) this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
        }
      }
      function getSchEnv(keyRef) {
        keyRef = (0, resolve_1.normalizeId)(keyRef);
        return this.schemas[keyRef] || this.refs[keyRef];
      }
      function addInitialSchemas() {
        const optsSchemas = this.opts.schemas;
        if (!optsSchemas) return;
        if (Array.isArray(optsSchemas)) this.addSchema(optsSchemas);
        else for (const key in optsSchemas) this.addSchema(optsSchemas[key], key);
      }
      function addInitialFormats() {
        for (const name in this.opts.formats) {
          const format = this.opts.formats[name];
          if (format) this.addFormat(name, format);
        }
      }
      function addInitialKeywords(defs) {
        if (Array.isArray(defs)) {
          this.addVocabulary(defs);
          return;
        }
        this.logger.warn('keywords option as map is deprecated, pass array');
        for (const keyword in defs) {
          const def = defs[keyword];
          if (!def.keyword) def.keyword = keyword;
          this.addKeyword(def);
        }
      }
      function getMetaSchemaOptions() {
        const metaOpts = { ...this.opts };
        for (const opt of META_IGNORE_OPTIONS) delete metaOpts[opt];
        return metaOpts;
      }
      var noLogs = { log() {}, warn() {}, error() {} };
      function getLogger(logger) {
        if (logger === false) return noLogs;
        if (logger === void 0) return console;
        if (logger.log && logger.warn && logger.error) return logger;
        throw new Error('logger must implement log, warn and error methods');
      }
      var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
      function checkKeyword(keyword, def) {
        const { RULES } = this;
        (0, util_1.eachItem)(keyword, kwd => {
          if (RULES.keywords[kwd]) throw new Error(`Keyword ${kwd} is already defined`);
          if (!KEYWORD_NAME.test(kwd)) throw new Error(`Keyword ${kwd} has invalid name`);
        });
        if (!def) return;
        if (def.$data && !('code' in def || 'validate' in def)) {
          throw new Error('$data keyword must have "code" or "validate" function');
        }
      }
      function addRule(keyword, definition, dataType) {
        var _a;
        const post = definition === null || definition === void 0 ? void 0 : definition.post;
        if (dataType && post) throw new Error('keyword with "post" flag cannot have "type"');
        const { RULES } = this;
        let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
        if (!ruleGroup) {
          ruleGroup = { type: dataType, rules: [] };
          RULES.rules.push(ruleGroup);
        }
        RULES.keywords[keyword] = true;
        if (!definition) return;
        const rule = {
          keyword,
          definition: {
            ...definition,
            type: (0, dataType_1.getJSONTypes)(definition.type),
            schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType),
          },
        };
        if (definition.before) addBeforeRule.call(this, ruleGroup, rule, definition.before);
        else ruleGroup.rules.push(rule);
        RULES.all[keyword] = rule;
        (_a = definition.implements) === null || _a === void 0
          ? void 0
          : _a.forEach(kwd => this.addKeyword(kwd));
      }
      function addBeforeRule(ruleGroup, rule, before) {
        const i = ruleGroup.rules.findIndex(_rule => _rule.keyword === before);
        if (i >= 0) {
          ruleGroup.rules.splice(i, 0, rule);
        } else {
          ruleGroup.rules.push(rule);
          this.logger.warn(`rule ${before} is not defined`);
        }
      }
      function keywordMetaschema(def) {
        let { metaSchema } = def;
        if (metaSchema === void 0) return;
        if (def.$data && this.opts.$data) metaSchema = schemaOrData(metaSchema);
        def.validateSchema = this.compile(metaSchema, true);
      }
      var $dataRef = {
        $ref: 'https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#',
      };
      function schemaOrData(schema) {
        return { anyOf: [schema, $dataRef] };
      }
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/core/id.js
  var require_id = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/core/id.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var def = {
        keyword: 'id',
        code() {
          throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/core/ref.js
  var require_ref = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/core/ref.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.callRef = exports.getValidate = void 0;
      var ref_error_1 = require_ref_error();
      var code_1 = require_code2();
      var codegen_1 = require_codegen();
      var names_1 = require_names();
      var compile_1 = require_compile();
      var util_1 = require_util();
      var def = {
        keyword: '$ref',
        schemaType: 'string',
        code(cxt) {
          const { gen, schema: $ref, it } = cxt;
          const { baseId, schemaEnv: env, validateName, opts, self: self2 } = it;
          const { root } = env;
          if (($ref === '#' || $ref === '#/') && baseId === root.baseId) return callRootRef();
          const schOrEnv = compile_1.resolveRef.call(self2, root, baseId, $ref);
          if (schOrEnv === void 0) throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
          if (schOrEnv instanceof compile_1.SchemaEnv) return callValidate(schOrEnv);
          return inlineRefSchema(schOrEnv);
          function callRootRef() {
            if (env === root) return callRef(cxt, validateName, env, env.$async);
            const rootName = gen.scopeValue('root', { ref: root });
            return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
          }
          function callValidate(sch) {
            const v = getValidate(cxt, sch);
            callRef(cxt, v, sch, sch.$async);
          }
          function inlineRefSchema(sch) {
            const schName = gen.scopeValue(
              'schema',
              opts.code.source === true
                ? { ref: sch, code: (0, codegen_1.stringify)(sch) }
                : { ref: sch }
            );
            const valid2 = gen.name('valid');
            const schCxt = cxt.subschema(
              {
                schema: sch,
                dataTypes: [],
                schemaPath: codegen_1.nil,
                topSchemaRef: schName,
                errSchemaPath: $ref,
              },
              valid2
            );
            cxt.mergeEvaluated(schCxt);
            cxt.ok(valid2);
          }
        },
      };
      function getValidate(cxt, sch) {
        const { gen } = cxt;
        return sch.validate
          ? gen.scopeValue('validate', { ref: sch.validate })
          : (0, codegen_1._)`${gen.scopeValue('wrapper', { ref: sch })}.validate`;
      }
      exports.getValidate = getValidate;
      function callRef(cxt, v, sch, $async) {
        const { gen, it } = cxt;
        const { allErrors, schemaEnv: env, opts } = it;
        const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
        if ($async) callAsyncRef();
        else callSyncRef();
        function callAsyncRef() {
          if (!env.$async) throw new Error('async schema referenced by sync schema');
          const valid2 = gen.let('valid');
          gen.try(
            () => {
              gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
              addEvaluatedFrom(v);
              if (!allErrors) gen.assign(valid2, true);
            },
            e => {
              gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () =>
                gen.throw(e)
              );
              addErrorsFrom(e);
              if (!allErrors) gen.assign(valid2, false);
            }
          );
          cxt.ok(valid2);
        }
        function callSyncRef() {
          cxt.result(
            (0, code_1.callValidateCode)(cxt, v, passCxt),
            () => addEvaluatedFrom(v),
            () => addErrorsFrom(v)
          );
        }
        function addErrorsFrom(source) {
          const errs = (0, codegen_1._)`${source}.errors`;
          gen.assign(
            names_1.default.vErrors,
            (0,
            codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`
          );
          gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        }
        function addEvaluatedFrom(source) {
          var _a;
          if (!it.opts.unevaluated) return;
          const schEvaluated =
            (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0
              ? void 0
              : _a.evaluated;
          if (it.props !== true) {
            if (schEvaluated && !schEvaluated.dynamicProps) {
              if (schEvaluated.props !== void 0) {
                it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
              }
            } else {
              const props = gen.var('props', (0, codegen_1._)`${source}.evaluated.props`);
              it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
            }
          }
          if (it.items !== true) {
            if (schEvaluated && !schEvaluated.dynamicItems) {
              if (schEvaluated.items !== void 0) {
                it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
              }
            } else {
              const items = gen.var('items', (0, codegen_1._)`${source}.evaluated.items`);
              it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
            }
          }
        }
      }
      exports.callRef = callRef;
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/core/index.js
  var require_core2 = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/core/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var id_1 = require_id();
      var ref_1 = require_ref();
      var core = [
        '$schema',
        '$id',
        '$defs',
        '$vocabulary',
        { keyword: '$comment' },
        'definitions',
        id_1.default,
        ref_1.default,
      ];
      exports.default = core;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/limitNumber.js
  var require_limitNumber = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/limitNumber.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var ops = codegen_1.operators;
      var KWDs = {
        maximum: { okStr: '<=', ok: ops.LTE, fail: ops.GT },
        minimum: { okStr: '>=', ok: ops.GTE, fail: ops.LT },
        exclusiveMaximum: { okStr: '<', ok: ops.LT, fail: ops.GTE },
        exclusiveMinimum: { okStr: '>', ok: ops.GT, fail: ops.LTE },
      };
      var error = {
        message: ({ keyword, schemaCode }) =>
          (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
        params: ({ keyword, schemaCode }) =>
          (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`,
      };
      var def = {
        keyword: Object.keys(KWDs),
        type: 'number',
        schemaType: 'number',
        $data: true,
        error,
        code(cxt) {
          const { keyword, data, schemaCode } = cxt;
          cxt.fail$data(
            (0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`
          );
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/multipleOf.js
  var require_multipleOf = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/multipleOf.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var error = {
        message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
        params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`,
      };
      var def = {
        keyword: 'multipleOf',
        type: 'number',
        schemaType: 'number',
        $data: true,
        error,
        code(cxt) {
          const { gen, data, schemaCode, it } = cxt;
          const prec = it.opts.multipleOfPrecision;
          const res = gen.let('res');
          const invalid = prec
            ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}`
            : (0, codegen_1._)`${res} !== parseInt(${res})`;
          cxt.fail$data(
            (0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`
          );
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/runtime/ucs2length.js
  var require_ucs2length = __commonJS({
    'packages/core/node_modules/ajv/dist/runtime/ucs2length.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      function ucs2length(str) {
        const len = str.length;
        let length = 0;
        let pos = 0;
        let value;
        while (pos < len) {
          length++;
          value = str.charCodeAt(pos++);
          if (value >= 55296 && value <= 56319 && pos < len) {
            value = str.charCodeAt(pos);
            if ((value & 64512) === 56320) pos++;
          }
        }
        return length;
      }
      exports.default = ucs2length;
      ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/limitLength.js
  var require_limitLength = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/limitLength.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var ucs2length_1 = require_ucs2length();
      var error = {
        message({ keyword, schemaCode }) {
          const comp = keyword === 'maxLength' ? 'more' : 'fewer';
          return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
        },
        params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`,
      };
      var def = {
        keyword: ['maxLength', 'minLength'],
        type: 'string',
        schemaType: 'number',
        $data: true,
        error,
        code(cxt) {
          const { keyword, data, schemaCode, it } = cxt;
          const op = keyword === 'maxLength' ? codegen_1.operators.GT : codegen_1.operators.LT;
          const len =
            it.opts.unicode === false
              ? (0, codegen_1._)`${data}.length`
              : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
          cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/pattern.js
  var require_pattern = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/pattern.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var code_1 = require_code2();
      var util_1 = require_util();
      var codegen_1 = require_codegen();
      var error = {
        message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
        params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`,
      };
      var def = {
        keyword: 'pattern',
        type: 'string',
        schemaType: 'string',
        $data: true,
        error,
        code(cxt) {
          const { gen, data, $data, schema, schemaCode, it } = cxt;
          const u = it.opts.unicodeRegExp ? 'u' : '';
          if ($data) {
            const { regExp } = it.opts.code;
            const regExpCode =
              regExp.code === 'new RegExp'
                ? (0, codegen_1._)`new RegExp`
                : (0, util_1.useFunc)(gen, regExp);
            const valid2 = gen.let('valid');
            gen.try(
              () =>
                gen.assign(
                  valid2,
                  (0, codegen_1._)`${regExpCode}(${schemaCode}, ${u}).test(${data})`
                ),
              () => gen.assign(valid2, false)
            );
            cxt.fail$data((0, codegen_1._)`!${valid2}`);
          } else {
            const regExp = (0, code_1.usePattern)(cxt, schema);
            cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/limitProperties.js
  var require_limitProperties = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/limitProperties.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var error = {
        message({ keyword, schemaCode }) {
          const comp = keyword === 'maxProperties' ? 'more' : 'fewer';
          return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
        },
        params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`,
      };
      var def = {
        keyword: ['maxProperties', 'minProperties'],
        type: 'object',
        schemaType: 'number',
        $data: true,
        error,
        code(cxt) {
          const { keyword, data, schemaCode } = cxt;
          const op = keyword === 'maxProperties' ? codegen_1.operators.GT : codegen_1.operators.LT;
          cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/required.js
  var require_required = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/required.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var code_1 = require_code2();
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var error = {
        message: ({ params: { missingProperty } }) =>
          (0, codegen_1.str)`must have required property '${missingProperty}'`,
        params: ({ params: { missingProperty } }) =>
          (0, codegen_1._)`{missingProperty: ${missingProperty}}`,
      };
      var def = {
        keyword: 'required',
        type: 'object',
        schemaType: 'array',
        $data: true,
        error,
        code(cxt) {
          const { gen, schema, schemaCode, data, $data, it } = cxt;
          const { opts } = it;
          if (!$data && schema.length === 0) return;
          const useLoop = schema.length >= opts.loopRequired;
          if (it.allErrors) allErrorsMode();
          else exitOnErrorMode();
          if (opts.strictRequired) {
            const props = cxt.parentSchema.properties;
            const { definedProperties } = cxt.it;
            for (const requiredKey of schema) {
              if (
                (props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 &&
                !definedProperties.has(requiredKey)
              ) {
                const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
                const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
                (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
              }
            }
          }
          function allErrorsMode() {
            if (useLoop || $data) {
              cxt.block$data(codegen_1.nil, loopAllRequired);
            } else {
              for (const prop of schema) {
                (0, code_1.checkReportMissingProp)(cxt, prop);
              }
            }
          }
          function exitOnErrorMode() {
            const missing = gen.let('missing');
            if (useLoop || $data) {
              const valid2 = gen.let('valid', true);
              cxt.block$data(valid2, () => loopUntilMissing(missing, valid2));
              cxt.ok(valid2);
            } else {
              gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
              (0, code_1.reportMissingProp)(cxt, missing);
              gen.else();
            }
          }
          function loopAllRequired() {
            gen.forOf('prop', schemaCode, prop => {
              cxt.setParams({ missingProperty: prop });
              gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () =>
                cxt.error()
              );
            });
          }
          function loopUntilMissing(missing, valid2) {
            cxt.setParams({ missingProperty: missing });
            gen.forOf(
              missing,
              schemaCode,
              () => {
                gen.assign(
                  valid2,
                  (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties)
                );
                gen.if((0, codegen_1.not)(valid2), () => {
                  cxt.error();
                  gen.break();
                });
              },
              codegen_1.nil
            );
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/limitItems.js
  var require_limitItems = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/limitItems.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var error = {
        message({ keyword, schemaCode }) {
          const comp = keyword === 'maxItems' ? 'more' : 'fewer';
          return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
        },
        params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`,
      };
      var def = {
        keyword: ['maxItems', 'minItems'],
        type: 'array',
        schemaType: 'number',
        $data: true,
        error,
        code(cxt) {
          const { keyword, data, schemaCode } = cxt;
          const op = keyword === 'maxItems' ? codegen_1.operators.GT : codegen_1.operators.LT;
          cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/runtime/equal.js
  var require_equal = __commonJS({
    'packages/core/node_modules/ajv/dist/runtime/equal.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var equal = require_fast_deep_equal();
      equal.code = 'require("ajv/dist/runtime/equal").default';
      exports.default = equal;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
  var require_uniqueItems = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/uniqueItems.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var dataType_1 = require_dataType();
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var equal_1 = require_equal();
      var error = {
        message: ({ params: { i, j } }) =>
          (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
        params: ({ params: { i, j } }) => (0, codegen_1._)`{i: ${i}, j: ${j}}`,
      };
      var def = {
        keyword: 'uniqueItems',
        type: 'array',
        schemaType: 'boolean',
        $data: true,
        error,
        code(cxt) {
          const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
          if (!$data && !schema) return;
          const valid2 = gen.let('valid');
          const itemTypes = parentSchema.items
            ? (0, dataType_1.getSchemaTypes)(parentSchema.items)
            : [];
          cxt.block$data(valid2, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
          cxt.ok(valid2);
          function validateUniqueItems() {
            const i = gen.let('i', (0, codegen_1._)`${data}.length`);
            const j = gen.let('j');
            cxt.setParams({ i, j });
            gen.assign(valid2, true);
            gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
          }
          function canOptimize() {
            return itemTypes.length > 0 && !itemTypes.some(t => t === 'object' || t === 'array');
          }
          function loopN(i, j) {
            const item = gen.name('item');
            const wrongType = (0, dataType_1.checkDataTypes)(
              itemTypes,
              item,
              it.opts.strictNumbers,
              dataType_1.DataType.Wrong
            );
            const indices = gen.const('indices', (0, codegen_1._)`{}`);
            gen.for((0, codegen_1._)`;${i}--;`, () => {
              gen.let(item, (0, codegen_1._)`${data}[${i}]`);
              gen.if(wrongType, (0, codegen_1._)`continue`);
              if (itemTypes.length > 1)
                gen.if(
                  (0, codegen_1._)`typeof ${item} == "string"`,
                  (0, codegen_1._)`${item} += "_"`
                );
              gen
                .if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
                  gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
                  cxt.error();
                  gen.assign(valid2, false).break();
                })
                .code((0, codegen_1._)`${indices}[${item}] = ${i}`);
            });
          }
          function loopN2(i, j) {
            const eql = (0, util_1.useFunc)(gen, equal_1.default);
            const outer = gen.name('outer');
            gen.label(outer).for((0, codegen_1._)`;${i}--;`, () =>
              gen.for((0, codegen_1._)`${j} = ${i}; ${j}--;`, () =>
                gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
                  cxt.error();
                  gen.assign(valid2, false).break(outer);
                })
              )
            );
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/const.js
  var require_const = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/const.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var equal_1 = require_equal();
      var error = {
        message: 'must be equal to constant',
        params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`,
      };
      var def = {
        keyword: 'const',
        $data: true,
        error,
        code(cxt) {
          const { gen, data, $data, schemaCode, schema } = cxt;
          if ($data || (schema && typeof schema == 'object')) {
            cxt.fail$data(
              (0,
              codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`
            );
          } else {
            cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/enum.js
  var require_enum = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/enum.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var equal_1 = require_equal();
      var error = {
        message: 'must be equal to one of the allowed values',
        params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`,
      };
      var def = {
        keyword: 'enum',
        schemaType: 'array',
        $data: true,
        error,
        code(cxt) {
          const { gen, data, $data, schema, schemaCode, it } = cxt;
          if (!$data && schema.length === 0) throw new Error('enum must have non-empty array');
          const useLoop = schema.length >= it.opts.loopEnum;
          let eql;
          const getEql = () =>
            eql !== null && eql !== void 0
              ? eql
              : (eql = (0, util_1.useFunc)(gen, equal_1.default));
          let valid2;
          if (useLoop || $data) {
            valid2 = gen.let('valid');
            cxt.block$data(valid2, loopEnum);
          } else {
            if (!Array.isArray(schema)) throw new Error('ajv implementation error');
            const vSchema = gen.const('vSchema', schemaCode);
            valid2 = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
          }
          cxt.pass(valid2);
          function loopEnum() {
            gen.assign(valid2, false);
            gen.forOf('v', schemaCode, v =>
              gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () =>
                gen.assign(valid2, true).break()
              )
            );
          }
          function equalCode(vSchema, i) {
            const sch = schema[i];
            return typeof sch === 'object' && sch !== null
              ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])`
              : (0, codegen_1._)`${data} === ${sch}`;
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/index.js
  var require_validation = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var limitNumber_1 = require_limitNumber();
      var multipleOf_1 = require_multipleOf();
      var limitLength_1 = require_limitLength();
      var pattern_1 = require_pattern();
      var limitProperties_1 = require_limitProperties();
      var required_1 = require_required();
      var limitItems_1 = require_limitItems();
      var uniqueItems_1 = require_uniqueItems();
      var const_1 = require_const();
      var enum_1 = require_enum();
      var validation = [
        // number
        limitNumber_1.default,
        multipleOf_1.default,
        // string
        limitLength_1.default,
        pattern_1.default,
        // object
        limitProperties_1.default,
        required_1.default,
        // array
        limitItems_1.default,
        uniqueItems_1.default,
        // any
        { keyword: 'type', schemaType: ['string', 'array'] },
        { keyword: 'nullable', schemaType: 'boolean' },
        const_1.default,
        enum_1.default,
      ];
      exports.default = validation;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
  var require_additionalItems = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/additionalItems.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.validateAdditionalItems = void 0;
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var error = {
        message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
        params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`,
      };
      var def = {
        keyword: 'additionalItems',
        type: 'array',
        schemaType: ['boolean', 'object'],
        before: 'uniqueItems',
        error,
        code(cxt) {
          const { parentSchema, it } = cxt;
          const { items } = parentSchema;
          if (!Array.isArray(items)) {
            (0, util_1.checkStrictMode)(
              it,
              '"additionalItems" is ignored when "items" is not an array of schemas'
            );
            return;
          }
          validateAdditionalItems(cxt, items);
        },
      };
      function validateAdditionalItems(cxt, items) {
        const { gen, schema, data, keyword, it } = cxt;
        it.items = true;
        const len = gen.const('len', (0, codegen_1._)`${data}.length`);
        if (schema === false) {
          cxt.setParams({ len: items.length });
          cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
        } else if (typeof schema == 'object' && !(0, util_1.alwaysValidSchema)(it, schema)) {
          const valid2 = gen.var('valid', (0, codegen_1._)`${len} <= ${items.length}`);
          gen.if((0, codegen_1.not)(valid2), () => validateItems(valid2));
          cxt.ok(valid2);
        }
        function validateItems(valid2) {
          gen.forRange('i', items.length, len, i => {
            cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid2);
            if (!it.allErrors) gen.if((0, codegen_1.not)(valid2), () => gen.break());
          });
        }
      }
      exports.validateAdditionalItems = validateAdditionalItems;
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/items.js
  var require_items = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/items.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.validateTuple = void 0;
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var code_1 = require_code2();
      var def = {
        keyword: 'items',
        type: 'array',
        schemaType: ['object', 'array', 'boolean'],
        before: 'uniqueItems',
        code(cxt) {
          const { schema, it } = cxt;
          if (Array.isArray(schema)) return validateTuple(cxt, 'additionalItems', schema);
          it.items = true;
          if ((0, util_1.alwaysValidSchema)(it, schema)) return;
          cxt.ok((0, code_1.validateArray)(cxt));
        },
      };
      function validateTuple(cxt, extraItems, schArr = cxt.schema) {
        const { gen, parentSchema, data, keyword, it } = cxt;
        checkStrictTuple(parentSchema);
        if (it.opts.unevaluated && schArr.length && it.items !== true) {
          it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
        }
        const valid2 = gen.name('valid');
        const len = gen.const('len', (0, codegen_1._)`${data}.length`);
        schArr.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch)) return;
          gen.if((0, codegen_1._)`${len} > ${i}`, () =>
            cxt.subschema(
              {
                keyword,
                schemaProp: i,
                dataProp: i,
              },
              valid2
            )
          );
          cxt.ok(valid2);
        });
        function checkStrictTuple(sch) {
          const { opts, errSchemaPath } = it;
          const l = schArr.length;
          const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
          if (opts.strictTuples && !fullTuple) {
            const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
            (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
          }
        }
      }
      exports.validateTuple = validateTuple;
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
  var require_prefixItems = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/prefixItems.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var items_1 = require_items();
      var def = {
        keyword: 'prefixItems',
        type: 'array',
        schemaType: ['array'],
        before: 'uniqueItems',
        code: cxt => (0, items_1.validateTuple)(cxt, 'items'),
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/items2020.js
  var require_items2020 = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/items2020.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var code_1 = require_code2();
      var additionalItems_1 = require_additionalItems();
      var error = {
        message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
        params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`,
      };
      var def = {
        keyword: 'items',
        type: 'array',
        schemaType: ['object', 'boolean'],
        before: 'uniqueItems',
        error,
        code(cxt) {
          const { schema, parentSchema, it } = cxt;
          const { prefixItems } = parentSchema;
          it.items = true;
          if ((0, util_1.alwaysValidSchema)(it, schema)) return;
          if (prefixItems) (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
          else cxt.ok((0, code_1.validateArray)(cxt));
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/contains.js
  var require_contains = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/contains.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var error = {
        message: ({ params: { min, max } }) =>
          max === void 0
            ? (0, codegen_1.str)`must contain at least ${min} valid item(s)`
            : (0,
              codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
        params: ({ params: { min, max } }) =>
          max === void 0
            ? (0, codegen_1._)`{minContains: ${min}}`
            : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`,
      };
      var def = {
        keyword: 'contains',
        type: 'array',
        schemaType: ['object', 'boolean'],
        before: 'uniqueItems',
        trackErrors: true,
        error,
        code(cxt) {
          const { gen, schema, parentSchema, data, it } = cxt;
          let min;
          let max;
          const { minContains, maxContains } = parentSchema;
          if (it.opts.next) {
            min = minContains === void 0 ? 1 : minContains;
            max = maxContains;
          } else {
            min = 1;
          }
          const len = gen.const('len', (0, codegen_1._)`${data}.length`);
          cxt.setParams({ min, max });
          if (max === void 0 && min === 0) {
            (0, util_1.checkStrictMode)(
              it,
              `"minContains" == 0 without "maxContains": "contains" keyword ignored`
            );
            return;
          }
          if (max !== void 0 && min > max) {
            (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
            cxt.fail();
            return;
          }
          if ((0, util_1.alwaysValidSchema)(it, schema)) {
            let cond = (0, codegen_1._)`${len} >= ${min}`;
            if (max !== void 0) cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
            cxt.pass(cond);
            return;
          }
          it.items = true;
          const valid2 = gen.name('valid');
          if (max === void 0 && min === 1) {
            validateItems(valid2, () => gen.if(valid2, () => gen.break()));
          } else if (min === 0) {
            gen.let(valid2, true);
            if (max !== void 0)
              gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
          } else {
            gen.let(valid2, false);
            validateItemsWithCount();
          }
          cxt.result(valid2, () => cxt.reset());
          function validateItemsWithCount() {
            const schValid = gen.name('_valid');
            const count = gen.let('count', 0);
            validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
          }
          function validateItems(_valid, block) {
            gen.forRange('i', 0, len, i => {
              cxt.subschema(
                {
                  keyword: 'contains',
                  dataProp: i,
                  dataPropType: util_1.Type.Num,
                  compositeRule: true,
                },
                _valid
              );
              block();
            });
          }
          function checkLimits(count) {
            gen.code((0, codegen_1._)`${count}++`);
            if (max === void 0) {
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid2, true).break());
            } else {
              gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid2, false).break());
              if (min === 1) gen.assign(valid2, true);
              else gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid2, true));
            }
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/dependencies.js
  var require_dependencies = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/dependencies.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var code_1 = require_code2();
      exports.error = {
        message: ({ params: { property, depsCount, deps } }) => {
          const property_ies = depsCount === 1 ? 'property' : 'properties';
          return (0,
          codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
        },
        params: ({ params: { property, depsCount, deps, missingProperty } }) => (0,
        codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`,
        // TODO change to reference
      };
      var def = {
        keyword: 'dependencies',
        type: 'object',
        schemaType: 'object',
        error: exports.error,
        code(cxt) {
          const [propDeps, schDeps] = splitDependencies(cxt);
          validatePropertyDeps(cxt, propDeps);
          validateSchemaDeps(cxt, schDeps);
        },
      };
      function splitDependencies({ schema }) {
        const propertyDeps = {};
        const schemaDeps = {};
        for (const key in schema) {
          if (key === '__proto__') continue;
          const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
          deps[key] = schema[key];
        }
        return [propertyDeps, schemaDeps];
      }
      function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
        const { gen, data, it } = cxt;
        if (Object.keys(propertyDeps).length === 0) return;
        const missing = gen.let('missing');
        for (const prop in propertyDeps) {
          const deps = propertyDeps[prop];
          if (deps.length === 0) continue;
          const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
          cxt.setParams({
            property: prop,
            depsCount: deps.length,
            deps: deps.join(', '),
          });
          if (it.allErrors) {
            gen.if(hasProperty, () => {
              for (const depProp of deps) {
                (0, code_1.checkReportMissingProp)(cxt, depProp);
              }
            });
          } else {
            gen.if(
              (0,
              codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`
            );
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
      }
      exports.validatePropertyDeps = validatePropertyDeps;
      function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
        const { gen, data, keyword, it } = cxt;
        const valid2 = gen.name('valid');
        for (const prop in schemaDeps) {
          if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop])) continue;
          gen.if(
            (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties),
            () => {
              const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid2);
              cxt.mergeValidEvaluated(schCxt, valid2);
            },
            () => gen.var(valid2, true)
            // TODO var
          );
          cxt.ok(valid2);
        }
      }
      exports.validateSchemaDeps = validateSchemaDeps;
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
  var require_propertyNames = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/propertyNames.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var error = {
        message: 'property name must be valid',
        params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`,
      };
      var def = {
        keyword: 'propertyNames',
        type: 'object',
        schemaType: ['object', 'boolean'],
        error,
        code(cxt) {
          const { gen, schema, data, it } = cxt;
          if ((0, util_1.alwaysValidSchema)(it, schema)) return;
          const valid2 = gen.name('valid');
          gen.forIn('key', data, key => {
            cxt.setParams({ propertyName: key });
            cxt.subschema(
              {
                keyword: 'propertyNames',
                data: key,
                dataTypes: ['string'],
                propertyName: key,
                compositeRule: true,
              },
              valid2
            );
            gen.if((0, codegen_1.not)(valid2), () => {
              cxt.error(true);
              if (!it.allErrors) gen.break();
            });
          });
          cxt.ok(valid2);
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
  var require_additionalProperties = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var code_1 = require_code2();
      var codegen_1 = require_codegen();
      var names_1 = require_names();
      var util_1 = require_util();
      var error = {
        message: 'must NOT have additional properties',
        params: ({ params }) =>
          (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`,
      };
      var def = {
        keyword: 'additionalProperties',
        type: ['object'],
        schemaType: ['boolean', 'object'],
        allowUndefined: true,
        trackErrors: true,
        error,
        code(cxt) {
          const { gen, schema, parentSchema, data, errsCount, it } = cxt;
          if (!errsCount) throw new Error('ajv implementation error');
          const { allErrors, opts } = it;
          it.props = true;
          if (opts.removeAdditional !== 'all' && (0, util_1.alwaysValidSchema)(it, schema)) return;
          const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
          const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
          checkAdditionalProperties();
          cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
          function checkAdditionalProperties() {
            gen.forIn('key', data, key => {
              if (!props.length && !patProps.length) additionalPropertyCode(key);
              else gen.if(isAdditional(key), () => additionalPropertyCode(key));
            });
          }
          function isAdditional(key) {
            let definedProp;
            if (props.length > 8) {
              const propsSchema = (0, util_1.schemaRefOrVal)(
                it,
                parentSchema.properties,
                'properties'
              );
              definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
            } else if (props.length) {
              definedProp = (0, codegen_1.or)(...props.map(p => (0, codegen_1._)`${key} === ${p}`));
            } else {
              definedProp = codegen_1.nil;
            }
            if (patProps.length) {
              definedProp = (0, codegen_1.or)(
                definedProp,
                ...patProps.map(
                  p => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p)}.test(${key})`
                )
              );
            }
            return (0, codegen_1.not)(definedProp);
          }
          function deleteAdditional(key) {
            gen.code((0, codegen_1._)`delete ${data}[${key}]`);
          }
          function additionalPropertyCode(key) {
            if (opts.removeAdditional === 'all' || (opts.removeAdditional && schema === false)) {
              deleteAdditional(key);
              return;
            }
            if (schema === false) {
              cxt.setParams({ additionalProperty: key });
              cxt.error();
              if (!allErrors) gen.break();
              return;
            }
            if (typeof schema == 'object' && !(0, util_1.alwaysValidSchema)(it, schema)) {
              const valid2 = gen.name('valid');
              if (opts.removeAdditional === 'failing') {
                applyAdditionalSchema(key, valid2, false);
                gen.if((0, codegen_1.not)(valid2), () => {
                  cxt.reset();
                  deleteAdditional(key);
                });
              } else {
                applyAdditionalSchema(key, valid2);
                if (!allErrors) gen.if((0, codegen_1.not)(valid2), () => gen.break());
              }
            }
          }
          function applyAdditionalSchema(key, valid2, errors) {
            const subschema = {
              keyword: 'additionalProperties',
              dataProp: key,
              dataPropType: util_1.Type.Str,
            };
            if (errors === false) {
              Object.assign(subschema, {
                compositeRule: true,
                createErrors: false,
                allErrors: false,
              });
            }
            cxt.subschema(subschema, valid2);
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/properties.js
  var require_properties = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/properties.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var validate_1 = require_validate();
      var code_1 = require_code2();
      var util_1 = require_util();
      var additionalProperties_1 = require_additionalProperties();
      var def = {
        keyword: 'properties',
        type: 'object',
        schemaType: 'object',
        code(cxt) {
          const { gen, schema, parentSchema, data, it } = cxt;
          if (it.opts.removeAdditional === 'all' && parentSchema.additionalProperties === void 0) {
            additionalProperties_1.default.code(
              new validate_1.KeywordCxt(it, additionalProperties_1.default, 'additionalProperties')
            );
          }
          const allProps = (0, code_1.allSchemaProperties)(schema);
          for (const prop of allProps) {
            it.definedProperties.add(prop);
          }
          if (it.opts.unevaluated && allProps.length && it.props !== true) {
            it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
          }
          const properties7 = allProps.filter(p => !(0, util_1.alwaysValidSchema)(it, schema[p]));
          if (properties7.length === 0) return;
          const valid2 = gen.name('valid');
          for (const prop of properties7) {
            if (hasDefault(prop)) {
              applyPropertySchema(prop);
            } else {
              gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
              applyPropertySchema(prop);
              if (!it.allErrors) gen.else().var(valid2, true);
              gen.endIf();
            }
            cxt.it.definedProperties.add(prop);
            cxt.ok(valid2);
          }
          function hasDefault(prop) {
            return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
          }
          function applyPropertySchema(prop) {
            cxt.subschema(
              {
                keyword: 'properties',
                schemaProp: prop,
                dataProp: prop,
              },
              valid2
            );
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
  var require_patternProperties = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/patternProperties.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var code_1 = require_code2();
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var util_2 = require_util();
      var def = {
        keyword: 'patternProperties',
        type: 'object',
        schemaType: 'object',
        code(cxt) {
          const { gen, schema, data, parentSchema, it } = cxt;
          const { opts } = it;
          const patterns = (0, code_1.allSchemaProperties)(schema);
          const alwaysValidPatterns = patterns.filter(p =>
            (0, util_1.alwaysValidSchema)(it, schema[p])
          );
          if (
            patterns.length === 0 ||
            (alwaysValidPatterns.length === patterns.length &&
              (!it.opts.unevaluated || it.props === true))
          ) {
            return;
          }
          const checkProperties =
            opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
          const valid2 = gen.name('valid');
          if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
            it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
          }
          const { props } = it;
          validatePatternProperties();
          function validatePatternProperties() {
            for (const pat of patterns) {
              if (checkProperties) checkMatchingProperties(pat);
              if (it.allErrors) {
                validateProperties(pat);
              } else {
                gen.var(valid2, true);
                validateProperties(pat);
                gen.if(valid2);
              }
            }
          }
          function checkMatchingProperties(pat) {
            for (const prop in checkProperties) {
              if (new RegExp(pat).test(prop)) {
                (0, util_1.checkStrictMode)(
                  it,
                  `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`
                );
              }
            }
          }
          function validateProperties(pat) {
            gen.forIn('key', data, key => {
              gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
                const alwaysValid = alwaysValidPatterns.includes(pat);
                if (!alwaysValid) {
                  cxt.subschema(
                    {
                      keyword: 'patternProperties',
                      schemaProp: pat,
                      dataProp: key,
                      dataPropType: util_2.Type.Str,
                    },
                    valid2
                  );
                }
                if (it.opts.unevaluated && props !== true) {
                  gen.assign((0, codegen_1._)`${props}[${key}]`, true);
                } else if (!alwaysValid && !it.allErrors) {
                  gen.if((0, codegen_1.not)(valid2), () => gen.break());
                }
              });
            });
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/not.js
  var require_not = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/not.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var util_1 = require_util();
      var def = {
        keyword: 'not',
        schemaType: ['object', 'boolean'],
        trackErrors: true,
        code(cxt) {
          const { gen, schema, it } = cxt;
          if ((0, util_1.alwaysValidSchema)(it, schema)) {
            cxt.fail();
            return;
          }
          const valid2 = gen.name('valid');
          cxt.subschema(
            {
              keyword: 'not',
              compositeRule: true,
              createErrors: false,
              allErrors: false,
            },
            valid2
          );
          cxt.failResult(
            valid2,
            () => cxt.reset(),
            () => cxt.error()
          );
        },
        error: { message: 'must NOT be valid' },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/anyOf.js
  var require_anyOf = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/anyOf.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var code_1 = require_code2();
      var def = {
        keyword: 'anyOf',
        schemaType: 'array',
        trackErrors: true,
        code: code_1.validateUnion,
        error: { message: 'must match a schema in anyOf' },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/oneOf.js
  var require_oneOf = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/oneOf.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var error = {
        message: 'must match exactly one schema in oneOf',
        params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`,
      };
      var def = {
        keyword: 'oneOf',
        schemaType: 'array',
        trackErrors: true,
        error,
        code(cxt) {
          const { gen, schema, parentSchema, it } = cxt;
          if (!Array.isArray(schema)) throw new Error('ajv implementation error');
          if (it.opts.discriminator && parentSchema.discriminator) return;
          const schArr = schema;
          const valid2 = gen.let('valid', false);
          const passing = gen.let('passing', null);
          const schValid = gen.name('_valid');
          cxt.setParams({ passing });
          gen.block(validateOneOf);
          cxt.result(
            valid2,
            () => cxt.reset(),
            () => cxt.error(true)
          );
          function validateOneOf() {
            schArr.forEach((sch, i) => {
              let schCxt;
              if ((0, util_1.alwaysValidSchema)(it, sch)) {
                gen.var(schValid, true);
              } else {
                schCxt = cxt.subschema(
                  {
                    keyword: 'oneOf',
                    schemaProp: i,
                    compositeRule: true,
                  },
                  schValid
                );
              }
              if (i > 0) {
                gen
                  .if((0, codegen_1._)`${schValid} && ${valid2}`)
                  .assign(valid2, false)
                  .assign(passing, (0, codegen_1._)`[${passing}, ${i}]`)
                  .else();
              }
              gen.if(schValid, () => {
                gen.assign(valid2, true);
                gen.assign(passing, i);
                if (schCxt) cxt.mergeEvaluated(schCxt, codegen_1.Name);
              });
            });
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/allOf.js
  var require_allOf = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/allOf.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var util_1 = require_util();
      var def = {
        keyword: 'allOf',
        schemaType: 'array',
        code(cxt) {
          const { gen, schema, it } = cxt;
          if (!Array.isArray(schema)) throw new Error('ajv implementation error');
          const valid2 = gen.name('valid');
          schema.forEach((sch, i) => {
            if ((0, util_1.alwaysValidSchema)(it, sch)) return;
            const schCxt = cxt.subschema({ keyword: 'allOf', schemaProp: i }, valid2);
            cxt.ok(valid2);
            cxt.mergeEvaluated(schCxt);
          });
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/if.js
  var require_if = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/if.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var error = {
        message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
        params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`,
      };
      var def = {
        keyword: 'if',
        schemaType: ['object', 'boolean'],
        trackErrors: true,
        error,
        code(cxt) {
          const { gen, parentSchema, it } = cxt;
          if (parentSchema.then === void 0 && parentSchema.else === void 0) {
            (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
          }
          const hasThen = hasSchema(it, 'then');
          const hasElse = hasSchema(it, 'else');
          if (!hasThen && !hasElse) return;
          const valid2 = gen.let('valid', true);
          const schValid = gen.name('_valid');
          validateIf();
          cxt.reset();
          if (hasThen && hasElse) {
            const ifClause = gen.let('ifClause');
            cxt.setParams({ ifClause });
            gen.if(schValid, validateClause('then', ifClause), validateClause('else', ifClause));
          } else if (hasThen) {
            gen.if(schValid, validateClause('then'));
          } else {
            gen.if((0, codegen_1.not)(schValid), validateClause('else'));
          }
          cxt.pass(valid2, () => cxt.error(true));
          function validateIf() {
            const schCxt = cxt.subschema(
              {
                keyword: 'if',
                compositeRule: true,
                createErrors: false,
                allErrors: false,
              },
              schValid
            );
            cxt.mergeEvaluated(schCxt);
          }
          function validateClause(keyword, ifClause) {
            return () => {
              const schCxt = cxt.subschema({ keyword }, schValid);
              gen.assign(valid2, schValid);
              cxt.mergeValidEvaluated(schCxt, valid2);
              if (ifClause) gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
              else cxt.setParams({ ifClause: keyword });
            };
          }
        },
      };
      function hasSchema(it, keyword) {
        const schema = it.schema[keyword];
        return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
      }
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/thenElse.js
  var require_thenElse = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/thenElse.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var util_1 = require_util();
      var def = {
        keyword: ['then', 'else'],
        schemaType: ['object', 'boolean'],
        code({ keyword, parentSchema, it }) {
          if (parentSchema.if === void 0)
            (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/index.js
  var require_applicator = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var additionalItems_1 = require_additionalItems();
      var prefixItems_1 = require_prefixItems();
      var items_1 = require_items();
      var items2020_1 = require_items2020();
      var contains_1 = require_contains();
      var dependencies_1 = require_dependencies();
      var propertyNames_1 = require_propertyNames();
      var additionalProperties_1 = require_additionalProperties();
      var properties_1 = require_properties();
      var patternProperties_1 = require_patternProperties();
      var not_1 = require_not();
      var anyOf_1 = require_anyOf();
      var oneOf_1 = require_oneOf();
      var allOf_1 = require_allOf();
      var if_1 = require_if();
      var thenElse_1 = require_thenElse();
      function getApplicator(draft2020 = false) {
        const applicator = [
          // any
          not_1.default,
          anyOf_1.default,
          oneOf_1.default,
          allOf_1.default,
          if_1.default,
          thenElse_1.default,
          // object
          propertyNames_1.default,
          additionalProperties_1.default,
          dependencies_1.default,
          properties_1.default,
          patternProperties_1.default,
        ];
        if (draft2020) applicator.push(prefixItems_1.default, items2020_1.default);
        else applicator.push(additionalItems_1.default, items_1.default);
        applicator.push(contains_1.default);
        return applicator;
      }
      exports.default = getApplicator;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js
  var require_dynamicAnchor = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.dynamicAnchor = void 0;
      var codegen_1 = require_codegen();
      var names_1 = require_names();
      var compile_1 = require_compile();
      var ref_1 = require_ref();
      var def = {
        keyword: '$dynamicAnchor',
        schemaType: 'string',
        code: cxt => dynamicAnchor(cxt, cxt.schema),
      };
      function dynamicAnchor(cxt, anchor) {
        const { gen, it } = cxt;
        it.schemaEnv.root.dynamicAnchors[anchor] = true;
        const v = (0,
        codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`;
        const validate = it.errSchemaPath === '#' ? it.validateName : _getValidate(cxt);
        gen.if((0, codegen_1._)`!${v}`, () => gen.assign(v, validate));
      }
      exports.dynamicAnchor = dynamicAnchor;
      function _getValidate(cxt) {
        const { schemaEnv, schema, self: self2 } = cxt.it;
        const { root, baseId, localRefs, meta } = schemaEnv.root;
        const { schemaId } = self2.opts;
        const sch = new compile_1.SchemaEnv({ schema, schemaId, root, baseId, localRefs, meta });
        compile_1.compileSchema.call(self2, sch);
        return (0, ref_1.getValidate)(cxt, sch);
      }
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js
  var require_dynamicRef = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.dynamicRef = void 0;
      var codegen_1 = require_codegen();
      var names_1 = require_names();
      var ref_1 = require_ref();
      var def = {
        keyword: '$dynamicRef',
        schemaType: 'string',
        code: cxt => dynamicRef(cxt, cxt.schema),
      };
      function dynamicRef(cxt, ref) {
        const { gen, keyword, it } = cxt;
        if (ref[0] !== '#') throw new Error(`"${keyword}" only supports hash fragment reference`);
        const anchor = ref.slice(1);
        if (it.allErrors) {
          _dynamicRef();
        } else {
          const valid2 = gen.let('valid', false);
          _dynamicRef(valid2);
          cxt.ok(valid2);
        }
        function _dynamicRef(valid2) {
          if (it.schemaEnv.root.dynamicAnchors[anchor]) {
            const v = gen.let(
              '_v',
              (0,
              codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`
            );
            gen.if(v, _callRef(v, valid2), _callRef(it.validateName, valid2));
          } else {
            _callRef(it.validateName, valid2)();
          }
        }
        function _callRef(validate, valid2) {
          return valid2
            ? () =>
                gen.block(() => {
                  (0, ref_1.callRef)(cxt, validate);
                  gen.let(valid2, true);
                })
            : () => (0, ref_1.callRef)(cxt, validate);
        }
      }
      exports.dynamicRef = dynamicRef;
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js
  var require_recursiveAnchor = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var dynamicAnchor_1 = require_dynamicAnchor();
      var util_1 = require_util();
      var def = {
        keyword: '$recursiveAnchor',
        schemaType: 'boolean',
        code(cxt) {
          if (cxt.schema) (0, dynamicAnchor_1.dynamicAnchor)(cxt, '');
          else (0, util_1.checkStrictMode)(cxt.it, '$recursiveAnchor: false is ignored');
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js
  var require_recursiveRef = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var dynamicRef_1 = require_dynamicRef();
      var def = {
        keyword: '$recursiveRef',
        schemaType: 'string',
        code: cxt => (0, dynamicRef_1.dynamicRef)(cxt, cxt.schema),
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/dynamic/index.js
  var require_dynamic = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/dynamic/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var dynamicAnchor_1 = require_dynamicAnchor();
      var dynamicRef_1 = require_dynamicRef();
      var recursiveAnchor_1 = require_recursiveAnchor();
      var recursiveRef_1 = require_recursiveRef();
      var dynamic = [
        dynamicAnchor_1.default,
        dynamicRef_1.default,
        recursiveAnchor_1.default,
        recursiveRef_1.default,
      ];
      exports.default = dynamic;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/dependentRequired.js
  var require_dependentRequired = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/dependentRequired.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var dependencies_1 = require_dependencies();
      var def = {
        keyword: 'dependentRequired',
        type: 'object',
        schemaType: 'object',
        error: dependencies_1.error,
        code: cxt => (0, dependencies_1.validatePropertyDeps)(cxt),
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js
  var require_dependentSchemas = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var dependencies_1 = require_dependencies();
      var def = {
        keyword: 'dependentSchemas',
        type: 'object',
        schemaType: 'object',
        code: cxt => (0, dependencies_1.validateSchemaDeps)(cxt),
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/validation/limitContains.js
  var require_limitContains = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/validation/limitContains.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var util_1 = require_util();
      var def = {
        keyword: ['maxContains', 'minContains'],
        type: 'array',
        schemaType: 'number',
        code({ keyword, parentSchema, it }) {
          if (parentSchema.contains === void 0) {
            (0, util_1.checkStrictMode)(it, `"${keyword}" without "contains" is ignored`);
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/next.js
  var require_next = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/next.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var dependentRequired_1 = require_dependentRequired();
      var dependentSchemas_1 = require_dependentSchemas();
      var limitContains_1 = require_limitContains();
      var next = [dependentRequired_1.default, dependentSchemas_1.default, limitContains_1.default];
      exports.default = next;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js
  var require_unevaluatedProperties = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js'(
      exports
    ) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var names_1 = require_names();
      var error = {
        message: 'must NOT have unevaluated properties',
        params: ({ params }) =>
          (0, codegen_1._)`{unevaluatedProperty: ${params.unevaluatedProperty}}`,
      };
      var def = {
        keyword: 'unevaluatedProperties',
        type: 'object',
        schemaType: ['boolean', 'object'],
        trackErrors: true,
        error,
        code(cxt) {
          const { gen, schema, data, errsCount, it } = cxt;
          if (!errsCount) throw new Error('ajv implementation error');
          const { allErrors, props } = it;
          if (props instanceof codegen_1.Name) {
            gen.if((0, codegen_1._)`${props} !== true`, () =>
              gen.forIn('key', data, key =>
                gen.if(unevaluatedDynamic(props, key), () => unevaluatedPropCode(key))
              )
            );
          } else if (props !== true) {
            gen.forIn('key', data, key =>
              props === void 0
                ? unevaluatedPropCode(key)
                : gen.if(unevaluatedStatic(props, key), () => unevaluatedPropCode(key))
            );
          }
          it.props = true;
          cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
          function unevaluatedPropCode(key) {
            if (schema === false) {
              cxt.setParams({ unevaluatedProperty: key });
              cxt.error();
              if (!allErrors) gen.break();
              return;
            }
            if (!(0, util_1.alwaysValidSchema)(it, schema)) {
              const valid2 = gen.name('valid');
              cxt.subschema(
                {
                  keyword: 'unevaluatedProperties',
                  dataProp: key,
                  dataPropType: util_1.Type.Str,
                },
                valid2
              );
              if (!allErrors) gen.if((0, codegen_1.not)(valid2), () => gen.break());
            }
          }
          function unevaluatedDynamic(evaluatedProps, key) {
            return (0, codegen_1._)`!${evaluatedProps} || !${evaluatedProps}[${key}]`;
          }
          function unevaluatedStatic(evaluatedProps, key) {
            const ps = [];
            for (const p in evaluatedProps) {
              if (evaluatedProps[p] === true) ps.push((0, codegen_1._)`${key} !== ${p}`);
            }
            return (0, codegen_1.and)(...ps);
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js
  var require_unevaluatedItems = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var util_1 = require_util();
      var error = {
        message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
        params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`,
      };
      var def = {
        keyword: 'unevaluatedItems',
        type: 'array',
        schemaType: ['boolean', 'object'],
        error,
        code(cxt) {
          const { gen, schema, data, it } = cxt;
          const items = it.items || 0;
          if (items === true) return;
          const len = gen.const('len', (0, codegen_1._)`${data}.length`);
          if (schema === false) {
            cxt.setParams({ len: items });
            cxt.fail((0, codegen_1._)`${len} > ${items}`);
          } else if (typeof schema == 'object' && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid2 = gen.var('valid', (0, codegen_1._)`${len} <= ${items}`);
            gen.if((0, codegen_1.not)(valid2), () => validateItems(valid2, items));
            cxt.ok(valid2);
          }
          it.items = true;
          function validateItems(valid2, from) {
            gen.forRange('i', from, len, i => {
              cxt.subschema(
                { keyword: 'unevaluatedItems', dataProp: i, dataPropType: util_1.Type.Num },
                valid2
              );
              if (!it.allErrors) gen.if((0, codegen_1.not)(valid2), () => gen.break());
            });
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/unevaluated/index.js
  var require_unevaluated = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/unevaluated/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var unevaluatedProperties_1 = require_unevaluatedProperties();
      var unevaluatedItems_1 = require_unevaluatedItems();
      var unevaluated = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
      exports.default = unevaluated;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/format/format.js
  var require_format = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/format/format.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var error = {
        message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
        params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`,
      };
      var def = {
        keyword: 'format',
        type: ['number', 'string'],
        schemaType: 'string',
        $data: true,
        error,
        code(cxt, ruleType) {
          const { gen, data, $data, schema, schemaCode, it } = cxt;
          const { opts, errSchemaPath, schemaEnv, self: self2 } = it;
          if (!opts.validateFormats) return;
          if ($data) validate$DataFormat();
          else validateFormat();
          function validate$DataFormat() {
            const fmts = gen.scopeValue('formats', {
              ref: self2.formats,
              code: opts.code.formats,
            });
            const fDef = gen.const('fDef', (0, codegen_1._)`${fmts}[${schemaCode}]`);
            const fType = gen.let('fType');
            const format = gen.let('format');
            gen.if(
              (0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`,
              () =>
                gen
                  .assign(fType, (0, codegen_1._)`${fDef}.type || "string"`)
                  .assign(format, (0, codegen_1._)`${fDef}.validate`),
              () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef)
            );
            cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
            function unknownFmt() {
              if (opts.strictSchema === false) return codegen_1.nil;
              return (0, codegen_1._)`${schemaCode} && !${format}`;
            }
            function invalidFmt() {
              const callFormat = schemaEnv.$async
                ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))`
                : (0, codegen_1._)`${format}(${data})`;
              const validData = (0,
              codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
              return (0,
              codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
            }
          }
          function validateFormat() {
            const formatDef = self2.formats[schema];
            if (!formatDef) {
              unknownFormat();
              return;
            }
            if (formatDef === true) return;
            const [fmtType, format, fmtRef] = getFormat(formatDef);
            if (fmtType === ruleType) cxt.pass(validCondition());
            function unknownFormat() {
              if (opts.strictSchema === false) {
                self2.logger.warn(unknownMsg());
                return;
              }
              throw new Error(unknownMsg());
              function unknownMsg() {
                return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
              }
            }
            function getFormat(fmtDef) {
              const code =
                fmtDef instanceof RegExp
                  ? (0, codegen_1.regexpCode)(fmtDef)
                  : opts.code.formats
                    ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}`
                    : void 0;
              const fmt = gen.scopeValue('formats', { key: schema, ref: fmtDef, code });
              if (typeof fmtDef == 'object' && !(fmtDef instanceof RegExp)) {
                return [
                  fmtDef.type || 'string',
                  fmtDef.validate,
                  (0, codegen_1._)`${fmt}.validate`,
                ];
              }
              return ['string', fmtDef, fmt];
            }
            function validCondition() {
              if (
                typeof formatDef == 'object' &&
                !(formatDef instanceof RegExp) &&
                formatDef.async
              ) {
                if (!schemaEnv.$async) throw new Error('async format in sync schema');
                return (0, codegen_1._)`await ${fmtRef}(${data})`;
              }
              return typeof format == 'function'
                ? (0, codegen_1._)`${fmtRef}(${data})`
                : (0, codegen_1._)`${fmtRef}.test(${data})`;
            }
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/format/index.js
  var require_format2 = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/format/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var format_1 = require_format();
      var format = [format_1.default];
      exports.default = format;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/metadata.js
  var require_metadata = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/metadata.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.contentVocabulary = exports.metadataVocabulary = void 0;
      exports.metadataVocabulary = [
        'title',
        'description',
        'default',
        'deprecated',
        'readOnly',
        'writeOnly',
        'examples',
      ];
      exports.contentVocabulary = ['contentMediaType', 'contentEncoding', 'contentSchema'];
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/draft2020.js
  var require_draft2020 = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/draft2020.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var core_1 = require_core2();
      var validation_1 = require_validation();
      var applicator_1 = require_applicator();
      var dynamic_1 = require_dynamic();
      var next_1 = require_next();
      var unevaluated_1 = require_unevaluated();
      var format_1 = require_format2();
      var metadata_1 = require_metadata();
      var draft2020Vocabularies = [
        dynamic_1.default,
        core_1.default,
        validation_1.default,
        (0, applicator_1.default)(true),
        format_1.default,
        metadata_1.metadataVocabulary,
        metadata_1.contentVocabulary,
        next_1.default,
        unevaluated_1.default,
      ];
      exports.default = draft2020Vocabularies;
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/discriminator/types.js
  var require_types = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/discriminator/types.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.DiscrError = void 0;
      var DiscrError;
      (function (DiscrError2) {
        DiscrError2['Tag'] = 'tag';
        DiscrError2['Mapping'] = 'mapping';
      })(DiscrError || (exports.DiscrError = DiscrError = {}));
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/discriminator/index.js
  var require_discriminator = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/discriminator/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var codegen_1 = require_codegen();
      var types_1 = require_types();
      var compile_1 = require_compile();
      var ref_error_1 = require_ref_error();
      var util_1 = require_util();
      var error = {
        message: ({ params: { discrError, tagName } }) =>
          discrError === types_1.DiscrError.Tag
            ? `tag "${tagName}" must be string`
            : `value of tag "${tagName}" must be in oneOf`,
        params: ({ params: { discrError, tag, tagName } }) =>
          (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`,
      };
      var def = {
        keyword: 'discriminator',
        type: 'object',
        schemaType: 'object',
        error,
        code(cxt) {
          const { gen, data, schema, parentSchema, it } = cxt;
          const { oneOf } = parentSchema;
          if (!it.opts.discriminator) {
            throw new Error('discriminator: requires discriminator option');
          }
          const tagName = schema.propertyName;
          if (typeof tagName != 'string') throw new Error('discriminator: requires propertyName');
          if (schema.mapping) throw new Error('discriminator: mapping is not supported');
          if (!oneOf) throw new Error('discriminator: requires oneOf keyword');
          const valid2 = gen.let('valid', false);
          const tag = gen.const(
            'tag',
            (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`
          );
          gen.if(
            (0, codegen_1._)`typeof ${tag} == "string"`,
            () => validateMapping(),
            () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName })
          );
          cxt.ok(valid2);
          function validateMapping() {
            const mapping = getMapping();
            gen.if(false);
            for (const tagValue in mapping) {
              gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
              gen.assign(valid2, applyTagSchema(mapping[tagValue]));
            }
            gen.else();
            cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
            gen.endIf();
          }
          function applyTagSchema(schemaProp) {
            const _valid = gen.name('valid');
            const schCxt = cxt.subschema({ keyword: 'oneOf', schemaProp }, _valid);
            cxt.mergeEvaluated(schCxt, codegen_1.Name);
            return _valid;
          }
          function getMapping() {
            var _a;
            const oneOfMapping = {};
            const topRequired = hasRequired(parentSchema);
            let tagRequired = true;
            for (let i = 0; i < oneOf.length; i++) {
              let sch = oneOf[i];
              if (
                (sch === null || sch === void 0 ? void 0 : sch.$ref) &&
                !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)
              ) {
                const ref = sch.$ref;
                sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
                if (sch instanceof compile_1.SchemaEnv) sch = sch.schema;
                if (sch === void 0)
                  throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
              }
              const propSch =
                (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null ||
                _a === void 0
                  ? void 0
                  : _a[tagName];
              if (typeof propSch != 'object') {
                throw new Error(
                  `discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`
                );
              }
              tagRequired = tagRequired && (topRequired || hasRequired(sch));
              addMappings(propSch, i);
            }
            if (!tagRequired) throw new Error(`discriminator: "${tagName}" must be required`);
            return oneOfMapping;
            function hasRequired({ required: required7 }) {
              return Array.isArray(required7) && required7.includes(tagName);
            }
            function addMappings(sch, i) {
              if (sch.const) {
                addMapping(sch.const, i);
              } else if (sch.enum) {
                for (const tagValue of sch.enum) {
                  addMapping(tagValue, i);
                }
              } else {
                throw new Error(
                  `discriminator: "properties/${tagName}" must have "const" or "enum"`
                );
              }
            }
            function addMapping(tagValue, i) {
              if (typeof tagValue != 'string' || tagValue in oneOfMapping) {
                throw new Error(`discriminator: "${tagName}" values must be unique strings`);
              }
              oneOfMapping[tagValue] = i;
            }
          }
        },
      };
      exports.default = def;
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/schema.json
  var require_schema = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/schema.json'(exports, module) {
      module.exports = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://json-schema.org/draft/2020-12/schema',
        $vocabulary: {
          'https://json-schema.org/draft/2020-12/vocab/core': true,
          'https://json-schema.org/draft/2020-12/vocab/applicator': true,
          'https://json-schema.org/draft/2020-12/vocab/unevaluated': true,
          'https://json-schema.org/draft/2020-12/vocab/validation': true,
          'https://json-schema.org/draft/2020-12/vocab/meta-data': true,
          'https://json-schema.org/draft/2020-12/vocab/format-annotation': true,
          'https://json-schema.org/draft/2020-12/vocab/content': true,
        },
        $dynamicAnchor: 'meta',
        title: 'Core and Validation specifications meta-schema',
        allOf: [
          { $ref: 'meta/core' },
          { $ref: 'meta/applicator' },
          { $ref: 'meta/unevaluated' },
          { $ref: 'meta/validation' },
          { $ref: 'meta/meta-data' },
          { $ref: 'meta/format-annotation' },
          { $ref: 'meta/content' },
        ],
        type: ['object', 'boolean'],
        $comment:
          'This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.',
        properties: {
          definitions: {
            $comment: '"definitions" has been replaced by "$defs".',
            type: 'object',
            additionalProperties: { $dynamicRef: '#meta' },
            deprecated: true,
            default: {},
          },
          dependencies: {
            $comment:
              '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
            type: 'object',
            additionalProperties: {
              anyOf: [{ $dynamicRef: '#meta' }, { $ref: 'meta/validation#/$defs/stringArray' }],
            },
            deprecated: true,
            default: {},
          },
          $recursiveAnchor: {
            $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
            $ref: 'meta/core#/$defs/anchorString',
            deprecated: true,
          },
          $recursiveRef: {
            $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
            $ref: 'meta/core#/$defs/uriReferenceString',
            deprecated: true,
          },
        },
      };
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json
  var require_applicator2 = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json'(
      exports,
      module
    ) {
      module.exports = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://json-schema.org/draft/2020-12/meta/applicator',
        $vocabulary: {
          'https://json-schema.org/draft/2020-12/vocab/applicator': true,
        },
        $dynamicAnchor: 'meta',
        title: 'Applicator vocabulary meta-schema',
        type: ['object', 'boolean'],
        properties: {
          prefixItems: { $ref: '#/$defs/schemaArray' },
          items: { $dynamicRef: '#meta' },
          contains: { $dynamicRef: '#meta' },
          additionalProperties: { $dynamicRef: '#meta' },
          properties: {
            type: 'object',
            additionalProperties: { $dynamicRef: '#meta' },
            default: {},
          },
          patternProperties: {
            type: 'object',
            additionalProperties: { $dynamicRef: '#meta' },
            propertyNames: { format: 'regex' },
            default: {},
          },
          dependentSchemas: {
            type: 'object',
            additionalProperties: { $dynamicRef: '#meta' },
            default: {},
          },
          propertyNames: { $dynamicRef: '#meta' },
          if: { $dynamicRef: '#meta' },
          then: { $dynamicRef: '#meta' },
          else: { $dynamicRef: '#meta' },
          allOf: { $ref: '#/$defs/schemaArray' },
          anyOf: { $ref: '#/$defs/schemaArray' },
          oneOf: { $ref: '#/$defs/schemaArray' },
          not: { $dynamicRef: '#meta' },
        },
        $defs: {
          schemaArray: {
            type: 'array',
            minItems: 1,
            items: { $dynamicRef: '#meta' },
          },
        },
      };
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json
  var require_unevaluated2 = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json'(
      exports,
      module
    ) {
      module.exports = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://json-schema.org/draft/2020-12/meta/unevaluated',
        $vocabulary: {
          'https://json-schema.org/draft/2020-12/vocab/unevaluated': true,
        },
        $dynamicAnchor: 'meta',
        title: 'Unevaluated applicator vocabulary meta-schema',
        type: ['object', 'boolean'],
        properties: {
          unevaluatedItems: { $dynamicRef: '#meta' },
          unevaluatedProperties: { $dynamicRef: '#meta' },
        },
      };
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json
  var require_content = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json'(
      exports,
      module
    ) {
      module.exports = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://json-schema.org/draft/2020-12/meta/content',
        $vocabulary: {
          'https://json-schema.org/draft/2020-12/vocab/content': true,
        },
        $dynamicAnchor: 'meta',
        title: 'Content vocabulary meta-schema',
        type: ['object', 'boolean'],
        properties: {
          contentEncoding: { type: 'string' },
          contentMediaType: { type: 'string' },
          contentSchema: { $dynamicRef: '#meta' },
        },
      };
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json
  var require_core3 = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json'(exports, module) {
      module.exports = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://json-schema.org/draft/2020-12/meta/core',
        $vocabulary: {
          'https://json-schema.org/draft/2020-12/vocab/core': true,
        },
        $dynamicAnchor: 'meta',
        title: 'Core vocabulary meta-schema',
        type: ['object', 'boolean'],
        properties: {
          $id: {
            $ref: '#/$defs/uriReferenceString',
            $comment: 'Non-empty fragments not allowed.',
            pattern: '^[^#]*#?$',
          },
          $schema: { $ref: '#/$defs/uriString' },
          $ref: { $ref: '#/$defs/uriReferenceString' },
          $anchor: { $ref: '#/$defs/anchorString' },
          $dynamicRef: { $ref: '#/$defs/uriReferenceString' },
          $dynamicAnchor: { $ref: '#/$defs/anchorString' },
          $vocabulary: {
            type: 'object',
            propertyNames: { $ref: '#/$defs/uriString' },
            additionalProperties: {
              type: 'boolean',
            },
          },
          $comment: {
            type: 'string',
          },
          $defs: {
            type: 'object',
            additionalProperties: { $dynamicRef: '#meta' },
          },
        },
        $defs: {
          anchorString: {
            type: 'string',
            pattern: '^[A-Za-z_][-A-Za-z0-9._]*$',
          },
          uriString: {
            type: 'string',
            format: 'uri',
          },
          uriReferenceString: {
            type: 'string',
            format: 'uri-reference',
          },
        },
      };
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json
  var require_format_annotation = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json'(
      exports,
      module
    ) {
      module.exports = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://json-schema.org/draft/2020-12/meta/format-annotation',
        $vocabulary: {
          'https://json-schema.org/draft/2020-12/vocab/format-annotation': true,
        },
        $dynamicAnchor: 'meta',
        title: 'Format vocabulary meta-schema for annotation results',
        type: ['object', 'boolean'],
        properties: {
          format: { type: 'string' },
        },
      };
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json
  var require_meta_data = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json'(
      exports,
      module
    ) {
      module.exports = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://json-schema.org/draft/2020-12/meta/meta-data',
        $vocabulary: {
          'https://json-schema.org/draft/2020-12/vocab/meta-data': true,
        },
        $dynamicAnchor: 'meta',
        title: 'Meta-data vocabulary meta-schema',
        type: ['object', 'boolean'],
        properties: {
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          default: true,
          deprecated: {
            type: 'boolean',
            default: false,
          },
          readOnly: {
            type: 'boolean',
            default: false,
          },
          writeOnly: {
            type: 'boolean',
            default: false,
          },
          examples: {
            type: 'array',
            items: true,
          },
        },
      };
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json
  var require_validation2 = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json'(
      exports,
      module
    ) {
      module.exports = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://json-schema.org/draft/2020-12/meta/validation',
        $vocabulary: {
          'https://json-schema.org/draft/2020-12/vocab/validation': true,
        },
        $dynamicAnchor: 'meta',
        title: 'Validation vocabulary meta-schema',
        type: ['object', 'boolean'],
        properties: {
          type: {
            anyOf: [
              { $ref: '#/$defs/simpleTypes' },
              {
                type: 'array',
                items: { $ref: '#/$defs/simpleTypes' },
                minItems: 1,
                uniqueItems: true,
              },
            ],
          },
          const: true,
          enum: {
            type: 'array',
            items: true,
          },
          multipleOf: {
            type: 'number',
            exclusiveMinimum: 0,
          },
          maximum: {
            type: 'number',
          },
          exclusiveMaximum: {
            type: 'number',
          },
          minimum: {
            type: 'number',
          },
          exclusiveMinimum: {
            type: 'number',
          },
          maxLength: { $ref: '#/$defs/nonNegativeInteger' },
          minLength: { $ref: '#/$defs/nonNegativeIntegerDefault0' },
          pattern: {
            type: 'string',
            format: 'regex',
          },
          maxItems: { $ref: '#/$defs/nonNegativeInteger' },
          minItems: { $ref: '#/$defs/nonNegativeIntegerDefault0' },
          uniqueItems: {
            type: 'boolean',
            default: false,
          },
          maxContains: { $ref: '#/$defs/nonNegativeInteger' },
          minContains: {
            $ref: '#/$defs/nonNegativeInteger',
            default: 1,
          },
          maxProperties: { $ref: '#/$defs/nonNegativeInteger' },
          minProperties: { $ref: '#/$defs/nonNegativeIntegerDefault0' },
          required: { $ref: '#/$defs/stringArray' },
          dependentRequired: {
            type: 'object',
            additionalProperties: {
              $ref: '#/$defs/stringArray',
            },
          },
        },
        $defs: {
          nonNegativeInteger: {
            type: 'integer',
            minimum: 0,
          },
          nonNegativeIntegerDefault0: {
            $ref: '#/$defs/nonNegativeInteger',
            default: 0,
          },
          simpleTypes: {
            enum: ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'],
          },
          stringArray: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: [],
          },
        },
      };
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/index.js
  var require_json_schema_2020_12 = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-2020-12/index.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var metaSchema = require_schema();
      var applicator = require_applicator2();
      var unevaluated = require_unevaluated2();
      var content = require_content();
      var core = require_core3();
      var format = require_format_annotation();
      var metadata = require_meta_data();
      var validation = require_validation2();
      var META_SUPPORT_DATA = ['/properties'];
      function addMetaSchema2020($data) {
        [
          metaSchema,
          applicator,
          unevaluated,
          content,
          core,
          with$data(this, format),
          metadata,
          with$data(this, validation),
        ].forEach(sch => this.addMetaSchema(sch, void 0, false));
        return this;
        function with$data(ajv, sch) {
          return $data ? ajv.$dataMetaSchema(sch, META_SUPPORT_DATA) : sch;
        }
      }
      exports.default = addMetaSchema2020;
    },
  });

  // packages/core/node_modules/ajv/dist/2020.js
  var require__ = __commonJS({
    'packages/core/node_modules/ajv/dist/2020.js'(exports, module) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.MissingRefError =
        exports.ValidationError =
        exports.CodeGen =
        exports.Name =
        exports.nil =
        exports.stringify =
        exports.str =
        exports._ =
        exports.KeywordCxt =
        exports.Ajv2020 =
          void 0;
      var core_1 = require_core();
      var draft2020_1 = require_draft2020();
      var discriminator_1 = require_discriminator();
      var json_schema_2020_12_1 = require_json_schema_2020_12();
      var META_SCHEMA_ID = 'https://json-schema.org/draft/2020-12/schema';
      var Ajv2020 = class extends core_1.default {
        constructor(opts = {}) {
          super({
            ...opts,
            dynamicRef: true,
            next: true,
            unevaluated: true,
          });
        }
        _addVocabularies() {
          super._addVocabularies();
          draft2020_1.default.forEach(v => this.addVocabulary(v));
          if (this.opts.discriminator) this.addKeyword(discriminator_1.default);
        }
        _addDefaultMetaSchema() {
          super._addDefaultMetaSchema();
          const { $data, meta } = this.opts;
          if (!meta) return;
          json_schema_2020_12_1.default.call(this, $data);
          this.refs['http://json-schema.org/schema'] = META_SCHEMA_ID;
        }
        defaultMeta() {
          return (this.opts.defaultMeta =
            super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0));
        }
      };
      exports.Ajv2020 = Ajv2020;
      module.exports = exports = Ajv2020;
      module.exports.Ajv2020 = Ajv2020;
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.default = Ajv2020;
      var validate_1 = require_validate();
      Object.defineProperty(exports, 'KeywordCxt', {
        enumerable: true,
        get: function () {
          return validate_1.KeywordCxt;
        },
      });
      var codegen_1 = require_codegen();
      Object.defineProperty(exports, '_', {
        enumerable: true,
        get: function () {
          return codegen_1._;
        },
      });
      Object.defineProperty(exports, 'str', {
        enumerable: true,
        get: function () {
          return codegen_1.str;
        },
      });
      Object.defineProperty(exports, 'stringify', {
        enumerable: true,
        get: function () {
          return codegen_1.stringify;
        },
      });
      Object.defineProperty(exports, 'nil', {
        enumerable: true,
        get: function () {
          return codegen_1.nil;
        },
      });
      Object.defineProperty(exports, 'Name', {
        enumerable: true,
        get: function () {
          return codegen_1.Name;
        },
      });
      Object.defineProperty(exports, 'CodeGen', {
        enumerable: true,
        get: function () {
          return codegen_1.CodeGen;
        },
      });
      var validation_error_1 = require_validation_error();
      Object.defineProperty(exports, 'ValidationError', {
        enumerable: true,
        get: function () {
          return validation_error_1.default;
        },
      });
      var ref_error_1 = require_ref_error();
      Object.defineProperty(exports, 'MissingRefError', {
        enumerable: true,
        get: function () {
          return ref_error_1.default;
        },
      });
    },
  });

  // packages/core/node_modules/ajv-formats/dist/formats.js
  var require_formats = __commonJS({
    'packages/core/node_modules/ajv-formats/dist/formats.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
      function fmtDef(validate, compare) {
        return { validate, compare };
      }
      exports.fullFormats = {
        // date: http://tools.ietf.org/html/rfc3339#section-5.6
        date: fmtDef(date, compareDate),
        // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
        time: fmtDef(getTime(true), compareTime),
        'date-time': fmtDef(getDateTime(true), compareDateTime),
        'iso-time': fmtDef(getTime(), compareIsoTime),
        'iso-date-time': fmtDef(getDateTime(), compareIsoDateTime),
        // duration: https://tools.ietf.org/html/rfc3339#appendix-A
        duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
        uri,
        'uri-reference':
          /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
        // uri-template: https://tools.ietf.org/html/rfc6570
        'uri-template':
          /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
        // For the source: https://gist.github.com/dperini/729294
        // For test cases: https://mathiasbynens.be/demo/url-regex
        url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
        email:
          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
        hostname:
          /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
        // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
        ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
        ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
        regex,
        // uuid: http://tools.ietf.org/html/rfc4122
        uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
        // JSON-pointer: https://tools.ietf.org/html/rfc6901
        // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
        'json-pointer': /^(?:\/(?:[^~/]|~0|~1)*)*$/,
        'json-pointer-uri-fragment': /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
        // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
        'relative-json-pointer': /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
        // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
        // byte: https://github.com/miguelmota/is-base64
        byte,
        // signed 32 bit integer
        int32: { type: 'number', validate: validateInt32 },
        // signed 64 bit integer
        int64: { type: 'number', validate: validateInt64 },
        // C-type float
        float: { type: 'number', validate: validateNumber },
        // C-type double
        double: { type: 'number', validate: validateNumber },
        // hint to the UI to hide input strings
        password: true,
        // unchecked string payload
        binary: true,
      };
      exports.fastFormats = {
        ...exports.fullFormats,
        date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
        time: fmtDef(
          /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
          compareTime
        ),
        'date-time': fmtDef(
          /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
          compareDateTime
        ),
        'iso-time': fmtDef(
          /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
          compareIsoTime
        ),
        'iso-date-time': fmtDef(
          /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
          compareIsoDateTime
        ),
        // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
        uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
        'uri-reference': /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
        // email (sources from jsen validator):
        // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
        // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
        email:
          /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
      };
      exports.formatNames = Object.keys(exports.fullFormats);
      function isLeapYear(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      }
      var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
      var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function date(str) {
        const matches = DATE.exec(str);
        if (!matches) return false;
        const year = +matches[1];
        const month = +matches[2];
        const day = +matches[3];
        return (
          month >= 1 &&
          month <= 12 &&
          day >= 1 &&
          day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month])
        );
      }
      function compareDate(d1, d2) {
        if (!(d1 && d2)) return void 0;
        if (d1 > d2) return 1;
        if (d1 < d2) return -1;
        return 0;
      }
      var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
      function getTime(strictTimeZone) {
        return function time(str) {
          const matches = TIME.exec(str);
          if (!matches) return false;
          const hr = +matches[1];
          const min = +matches[2];
          const sec = +matches[3];
          const tz = matches[4];
          const tzSign = matches[5] === '-' ? -1 : 1;
          const tzH = +(matches[6] || 0);
          const tzM = +(matches[7] || 0);
          if (tzH > 23 || tzM > 59 || (strictTimeZone && !tz)) return false;
          if (hr <= 23 && min <= 59 && sec < 60) return true;
          const utcMin = min - tzM * tzSign;
          const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
          return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
        };
      }
      function compareTime(s1, s2) {
        if (!(s1 && s2)) return void 0;
        const t1 = /* @__PURE__ */ new Date('2020-01-01T' + s1).valueOf();
        const t2 = /* @__PURE__ */ new Date('2020-01-01T' + s2).valueOf();
        if (!(t1 && t2)) return void 0;
        return t1 - t2;
      }
      function compareIsoTime(t1, t2) {
        if (!(t1 && t2)) return void 0;
        const a1 = TIME.exec(t1);
        const a2 = TIME.exec(t2);
        if (!(a1 && a2)) return void 0;
        t1 = a1[1] + a1[2] + a1[3];
        t2 = a2[1] + a2[2] + a2[3];
        if (t1 > t2) return 1;
        if (t1 < t2) return -1;
        return 0;
      }
      var DATE_TIME_SEPARATOR = /t|\s/i;
      function getDateTime(strictTimeZone) {
        const time = getTime(strictTimeZone);
        return function date_time(str) {
          const dateTime = str.split(DATE_TIME_SEPARATOR);
          return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
        };
      }
      function compareDateTime(dt1, dt2) {
        if (!(dt1 && dt2)) return void 0;
        const d1 = new Date(dt1).valueOf();
        const d2 = new Date(dt2).valueOf();
        if (!(d1 && d2)) return void 0;
        return d1 - d2;
      }
      function compareIsoDateTime(dt1, dt2) {
        if (!(dt1 && dt2)) return void 0;
        const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
        const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
        const res = compareDate(d1, d2);
        if (res === void 0) return void 0;
        return res || compareTime(t1, t2);
      }
      var NOT_URI_FRAGMENT = /\/|:/;
      var URI =
        /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
      function uri(str) {
        return NOT_URI_FRAGMENT.test(str) && URI.test(str);
      }
      var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
      function byte(str) {
        BYTE.lastIndex = 0;
        return BYTE.test(str);
      }
      var MIN_INT32 = -(2 ** 31);
      var MAX_INT32 = 2 ** 31 - 1;
      function validateInt32(value) {
        return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
      }
      function validateInt64(value) {
        return Number.isInteger(value);
      }
      function validateNumber() {
        return true;
      }
      var Z_ANCHOR = /[^\\]\\Z/;
      function regex(str) {
        if (Z_ANCHOR.test(str)) return false;
        try {
          new RegExp(str);
          return true;
        } catch (e) {
          return false;
        }
      }
    },
  });

  // packages/core/node_modules/ajv/dist/vocabularies/draft7.js
  var require_draft7 = __commonJS({
    'packages/core/node_modules/ajv/dist/vocabularies/draft7.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var core_1 = require_core2();
      var validation_1 = require_validation();
      var applicator_1 = require_applicator();
      var format_1 = require_format2();
      var metadata_1 = require_metadata();
      var draft7Vocabularies = [
        core_1.default,
        validation_1.default,
        (0, applicator_1.default)(),
        format_1.default,
        metadata_1.metadataVocabulary,
        metadata_1.contentVocabulary,
      ];
      exports.default = draft7Vocabularies;
    },
  });

  // packages/core/node_modules/ajv/dist/refs/json-schema-draft-07.json
  var require_json_schema_draft_07 = __commonJS({
    'packages/core/node_modules/ajv/dist/refs/json-schema-draft-07.json'(exports, module) {
      module.exports = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'http://json-schema.org/draft-07/schema#',
        title: 'Core schema meta-schema',
        definitions: {
          schemaArray: {
            type: 'array',
            minItems: 1,
            items: { $ref: '#' },
          },
          nonNegativeInteger: {
            type: 'integer',
            minimum: 0,
          },
          nonNegativeIntegerDefault0: {
            allOf: [{ $ref: '#/definitions/nonNegativeInteger' }, { default: 0 }],
          },
          simpleTypes: {
            enum: ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'],
          },
          stringArray: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: [],
          },
        },
        type: ['object', 'boolean'],
        properties: {
          $id: {
            type: 'string',
            format: 'uri-reference',
          },
          $schema: {
            type: 'string',
            format: 'uri',
          },
          $ref: {
            type: 'string',
            format: 'uri-reference',
          },
          $comment: {
            type: 'string',
          },
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          default: true,
          readOnly: {
            type: 'boolean',
            default: false,
          },
          examples: {
            type: 'array',
            items: true,
          },
          multipleOf: {
            type: 'number',
            exclusiveMinimum: 0,
          },
          maximum: {
            type: 'number',
          },
          exclusiveMaximum: {
            type: 'number',
          },
          minimum: {
            type: 'number',
          },
          exclusiveMinimum: {
            type: 'number',
          },
          maxLength: { $ref: '#/definitions/nonNegativeInteger' },
          minLength: { $ref: '#/definitions/nonNegativeIntegerDefault0' },
          pattern: {
            type: 'string',
            format: 'regex',
          },
          additionalItems: { $ref: '#' },
          items: {
            anyOf: [{ $ref: '#' }, { $ref: '#/definitions/schemaArray' }],
            default: true,
          },
          maxItems: { $ref: '#/definitions/nonNegativeInteger' },
          minItems: { $ref: '#/definitions/nonNegativeIntegerDefault0' },
          uniqueItems: {
            type: 'boolean',
            default: false,
          },
          contains: { $ref: '#' },
          maxProperties: { $ref: '#/definitions/nonNegativeInteger' },
          minProperties: { $ref: '#/definitions/nonNegativeIntegerDefault0' },
          required: { $ref: '#/definitions/stringArray' },
          additionalProperties: { $ref: '#' },
          definitions: {
            type: 'object',
            additionalProperties: { $ref: '#' },
            default: {},
          },
          properties: {
            type: 'object',
            additionalProperties: { $ref: '#' },
            default: {},
          },
          patternProperties: {
            type: 'object',
            additionalProperties: { $ref: '#' },
            propertyNames: { format: 'regex' },
            default: {},
          },
          dependencies: {
            type: 'object',
            additionalProperties: {
              anyOf: [{ $ref: '#' }, { $ref: '#/definitions/stringArray' }],
            },
          },
          propertyNames: { $ref: '#' },
          const: true,
          enum: {
            type: 'array',
            items: true,
            minItems: 1,
            uniqueItems: true,
          },
          type: {
            anyOf: [
              { $ref: '#/definitions/simpleTypes' },
              {
                type: 'array',
                items: { $ref: '#/definitions/simpleTypes' },
                minItems: 1,
                uniqueItems: true,
              },
            ],
          },
          format: { type: 'string' },
          contentMediaType: { type: 'string' },
          contentEncoding: { type: 'string' },
          if: { $ref: '#' },
          then: { $ref: '#' },
          else: { $ref: '#' },
          allOf: { $ref: '#/definitions/schemaArray' },
          anyOf: { $ref: '#/definitions/schemaArray' },
          oneOf: { $ref: '#/definitions/schemaArray' },
          not: { $ref: '#' },
        },
        default: true,
      };
    },
  });

  // packages/core/node_modules/ajv/dist/ajv.js
  var require_ajv = __commonJS({
    'packages/core/node_modules/ajv/dist/ajv.js'(exports, module) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.MissingRefError =
        exports.ValidationError =
        exports.CodeGen =
        exports.Name =
        exports.nil =
        exports.stringify =
        exports.str =
        exports._ =
        exports.KeywordCxt =
        exports.Ajv =
          void 0;
      var core_1 = require_core();
      var draft7_1 = require_draft7();
      var discriminator_1 = require_discriminator();
      var draft7MetaSchema = require_json_schema_draft_07();
      var META_SUPPORT_DATA = ['/properties'];
      var META_SCHEMA_ID = 'http://json-schema.org/draft-07/schema';
      var Ajv2 = class extends core_1.default {
        _addVocabularies() {
          super._addVocabularies();
          draft7_1.default.forEach(v => this.addVocabulary(v));
          if (this.opts.discriminator) this.addKeyword(discriminator_1.default);
        }
        _addDefaultMetaSchema() {
          super._addDefaultMetaSchema();
          if (!this.opts.meta) return;
          const metaSchema = this.opts.$data
            ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA)
            : draft7MetaSchema;
          this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
          this.refs['http://json-schema.org/schema'] = META_SCHEMA_ID;
        }
        defaultMeta() {
          return (this.opts.defaultMeta =
            super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0));
        }
      };
      exports.Ajv = Ajv2;
      module.exports = exports = Ajv2;
      module.exports.Ajv = Ajv2;
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.default = Ajv2;
      var validate_1 = require_validate();
      Object.defineProperty(exports, 'KeywordCxt', {
        enumerable: true,
        get: function () {
          return validate_1.KeywordCxt;
        },
      });
      var codegen_1 = require_codegen();
      Object.defineProperty(exports, '_', {
        enumerable: true,
        get: function () {
          return codegen_1._;
        },
      });
      Object.defineProperty(exports, 'str', {
        enumerable: true,
        get: function () {
          return codegen_1.str;
        },
      });
      Object.defineProperty(exports, 'stringify', {
        enumerable: true,
        get: function () {
          return codegen_1.stringify;
        },
      });
      Object.defineProperty(exports, 'nil', {
        enumerable: true,
        get: function () {
          return codegen_1.nil;
        },
      });
      Object.defineProperty(exports, 'Name', {
        enumerable: true,
        get: function () {
          return codegen_1.Name;
        },
      });
      Object.defineProperty(exports, 'CodeGen', {
        enumerable: true,
        get: function () {
          return codegen_1.CodeGen;
        },
      });
      var validation_error_1 = require_validation_error();
      Object.defineProperty(exports, 'ValidationError', {
        enumerable: true,
        get: function () {
          return validation_error_1.default;
        },
      });
      var ref_error_1 = require_ref_error();
      Object.defineProperty(exports, 'MissingRefError', {
        enumerable: true,
        get: function () {
          return ref_error_1.default;
        },
      });
    },
  });

  // packages/core/node_modules/ajv-formats/dist/limit.js
  var require_limit = __commonJS({
    'packages/core/node_modules/ajv-formats/dist/limit.js'(exports) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.formatLimitDefinition = void 0;
      var ajv_1 = require_ajv();
      var codegen_1 = require_codegen();
      var ops = codegen_1.operators;
      var KWDs = {
        formatMaximum: { okStr: '<=', ok: ops.LTE, fail: ops.GT },
        formatMinimum: { okStr: '>=', ok: ops.GTE, fail: ops.LT },
        formatExclusiveMaximum: { okStr: '<', ok: ops.LT, fail: ops.GTE },
        formatExclusiveMinimum: { okStr: '>', ok: ops.GT, fail: ops.LTE },
      };
      var error = {
        message: ({ keyword, schemaCode }) =>
          (0, codegen_1.str)`should be ${KWDs[keyword].okStr} ${schemaCode}`,
        params: ({ keyword, schemaCode }) =>
          (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`,
      };
      exports.formatLimitDefinition = {
        keyword: Object.keys(KWDs),
        type: 'string',
        schemaType: 'string',
        $data: true,
        error,
        code(cxt) {
          const { gen, data, schemaCode, keyword, it } = cxt;
          const { opts, self: self2 } = it;
          if (!opts.validateFormats) return;
          const fCxt = new ajv_1.KeywordCxt(it, self2.RULES.all.format.definition, 'format');
          if (fCxt.$data) validate$DataFormat();
          else validateFormat();
          function validate$DataFormat() {
            const fmts = gen.scopeValue('formats', {
              ref: self2.formats,
              code: opts.code.formats,
            });
            const fmt = gen.const('fmt', (0, codegen_1._)`${fmts}[${fCxt.schemaCode}]`);
            cxt.fail$data(
              (0, codegen_1.or)(
                (0, codegen_1._)`typeof ${fmt} != "object"`,
                (0, codegen_1._)`${fmt} instanceof RegExp`,
                (0, codegen_1._)`typeof ${fmt}.compare != "function"`,
                compareCode(fmt)
              )
            );
          }
          function validateFormat() {
            const format = fCxt.schema;
            const fmtDef = self2.formats[format];
            if (!fmtDef || fmtDef === true) return;
            if (
              typeof fmtDef != 'object' ||
              fmtDef instanceof RegExp ||
              typeof fmtDef.compare != 'function'
            ) {
              throw new Error(
                `"${keyword}": format "${format}" does not define "compare" function`
              );
            }
            const fmt = gen.scopeValue('formats', {
              key: format,
              ref: fmtDef,
              code: opts.code.formats
                ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(format)}`
                : void 0,
            });
            cxt.fail$data(compareCode(fmt));
          }
          function compareCode(fmt) {
            return (0, codegen_1._)`${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword].fail} 0`;
          }
        },
        dependencies: ['format'],
      };
      var formatLimitPlugin = ajv => {
        ajv.addKeyword(exports.formatLimitDefinition);
        return ajv;
      };
      exports.default = formatLimitPlugin;
    },
  });

  // packages/core/node_modules/ajv-formats/dist/index.js
  var require_dist = __commonJS({
    'packages/core/node_modules/ajv-formats/dist/index.js'(exports, module) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var formats_1 = require_formats();
      var limit_1 = require_limit();
      var codegen_1 = require_codegen();
      var fullName = new codegen_1.Name('fullFormats');
      var fastName = new codegen_1.Name('fastFormats');
      var formatsPlugin = (ajv, opts = { keywords: true }) => {
        if (Array.isArray(opts)) {
          addFormats2(ajv, opts, formats_1.fullFormats, fullName);
          return ajv;
        }
        const [formats, exportName] =
          opts.mode === 'fast'
            ? [formats_1.fastFormats, fastName]
            : [formats_1.fullFormats, fullName];
        const list = opts.formats || formats_1.formatNames;
        addFormats2(ajv, list, formats, exportName);
        if (opts.keywords) (0, limit_1.default)(ajv);
        return ajv;
      };
      formatsPlugin.get = (name, mode = 'full') => {
        const formats = mode === 'fast' ? formats_1.fastFormats : formats_1.fullFormats;
        const f = formats[name];
        if (!f) throw new Error(`Unknown format "${name}"`);
        return f;
      };
      function addFormats2(ajv, list, fs, exportName) {
        var _a;
        var _b;
        (_a = (_b = ajv.opts.code).formats) !== null && _a !== void 0
          ? _a
          : (_b.formats = (0, codegen_1._)`require("ajv-formats/dist/formats").${exportName}`);
        for (const f of list) ajv.addFormat(f, fs[f]);
      }
      module.exports = exports = formatsPlugin;
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.default = formatsPlugin;
    },
  });

  // packages/core/node_modules/ajv-errors/dist/index.js
  var require_dist2 = __commonJS({
    'packages/core/node_modules/ajv-errors/dist/index.js'(exports, module) {
      'use strict';
      Object.defineProperty(exports, '__esModule', { value: true });
      var ajv_1 = require_ajv();
      var codegen_1 = require_codegen();
      var code_1 = require_code();
      var validate_1 = require_validate();
      var errors_1 = require_errors();
      var names_1 = require_names();
      var keyword = 'errorMessage';
      var used = new ajv_1.Name('emUsed');
      var KEYWORD_PROPERTY_PARAMS = {
        required: 'missingProperty',
        dependencies: 'property',
        dependentRequired: 'property',
      };
      var INTERPOLATION = /\$\{[^}]+\}/;
      var INTERPOLATION_REPLACE = /\$\{([^}]+)\}/g;
      var EMPTY_STR = /^""\s*\+\s*|\s*\+\s*""$/g;
      function errorMessage(options) {
        return {
          keyword,
          schemaType: ['string', 'object'],
          post: true,
          code(cxt) {
            const { gen, data, schema, schemaValue, it } = cxt;
            if (it.createErrors === false) return;
            const sch = schema;
            const instancePath = codegen_1.strConcat(names_1.default.instancePath, it.errorPath);
            gen.if(ajv_1._`${names_1.default.errors} > 0`, () => {
              if (typeof sch == 'object') {
                const [kwdPropErrors, kwdErrors] = keywordErrorsConfig(sch);
                if (kwdErrors) processKeywordErrors(kwdErrors);
                if (kwdPropErrors) processKeywordPropErrors(kwdPropErrors);
                processChildErrors(childErrorsConfig(sch));
              }
              const schMessage = typeof sch == 'string' ? sch : sch._;
              if (schMessage) processAllErrors(schMessage);
              if (!options.keepErrors) removeUsedErrors();
            });
            function childErrorsConfig({ properties: properties7, items }) {
              const errors = {};
              if (properties7) {
                errors.props = {};
                for (const p in properties7) errors.props[p] = [];
              }
              if (items) {
                errors.items = {};
                for (let i = 0; i < items.length; i++) errors.items[i] = [];
              }
              return errors;
            }
            function keywordErrorsConfig(emSchema) {
              let propErrors;
              let errors;
              for (const k in emSchema) {
                if (k === 'properties' || k === 'items') continue;
                const kwdSch = emSchema[k];
                if (typeof kwdSch == 'object') {
                  propErrors || (propErrors = {});
                  const errMap = (propErrors[k] = {});
                  for (const p in kwdSch) errMap[p] = [];
                } else {
                  errors || (errors = {});
                  errors[k] = [];
                }
              }
              return [propErrors, errors];
            }
            function processKeywordErrors(kwdErrors) {
              const kwdErrs = gen.const('emErrors', ajv_1.stringify(kwdErrors));
              const templates = gen.const('templates', getTemplatesCode(kwdErrors, schema));
              gen.forOf('err', names_1.default.vErrors, err =>
                gen.if(matchKeywordError(err, kwdErrs), () =>
                  gen
                    .code(ajv_1._`${kwdErrs}[${err}.keyword].push(${err})`)
                    .assign(ajv_1._`${err}.${used}`, true)
                )
              );
              const { singleError } = options;
              if (singleError) {
                const message = gen.let('message', ajv_1._`""`);
                const paramsErrors = gen.let('paramsErrors', ajv_1._`[]`);
                loopErrors(key => {
                  gen.if(message, () =>
                    gen.code(
                      ajv_1._`${message} += ${typeof singleError == 'string' ? singleError : ';'}`
                    )
                  );
                  gen.code(ajv_1._`${message} += ${errMessage(key)}`);
                  gen.assign(paramsErrors, ajv_1._`${paramsErrors}.concat(${kwdErrs}[${key}])`);
                });
                errors_1.reportError(cxt, { message, params: ajv_1._`{errors: ${paramsErrors}}` });
              } else {
                loopErrors(key =>
                  errors_1.reportError(cxt, {
                    message: errMessage(key),
                    params: ajv_1._`{errors: ${kwdErrs}[${key}]}`,
                  })
                );
              }
              function loopErrors(body) {
                gen.forIn('key', kwdErrs, key =>
                  gen.if(ajv_1._`${kwdErrs}[${key}].length`, () => body(key))
                );
              }
              function errMessage(key) {
                return ajv_1._`${key} in ${templates} ? ${templates}[${key}]() : ${schemaValue}[${key}]`;
              }
            }
            function processKeywordPropErrors(kwdPropErrors) {
              const kwdErrs = gen.const('emErrors', ajv_1.stringify(kwdPropErrors));
              const templatesCode = [];
              for (const k in kwdPropErrors) {
                templatesCode.push([k, getTemplatesCode(kwdPropErrors[k], schema[k])]);
              }
              const templates = gen.const('templates', gen.object(...templatesCode));
              const kwdPropParams = gen.scopeValue('obj', {
                ref: KEYWORD_PROPERTY_PARAMS,
                code: ajv_1.stringify(KEYWORD_PROPERTY_PARAMS),
              });
              const propParam = gen.let('emPropParams');
              const paramsErrors = gen.let('emParamsErrors');
              gen.forOf('err', names_1.default.vErrors, err =>
                gen.if(matchKeywordError(err, kwdErrs), () => {
                  gen.assign(propParam, ajv_1._`${kwdPropParams}[${err}.keyword]`);
                  gen.assign(
                    paramsErrors,
                    ajv_1._`${kwdErrs}[${err}.keyword][${err}.params[${propParam}]]`
                  );
                  gen.if(paramsErrors, () =>
                    gen
                      .code(ajv_1._`${paramsErrors}.push(${err})`)
                      .assign(ajv_1._`${err}.${used}`, true)
                  );
                })
              );
              gen.forIn('key', kwdErrs, key =>
                gen.forIn('keyProp', ajv_1._`${kwdErrs}[${key}]`, keyProp => {
                  gen.assign(paramsErrors, ajv_1._`${kwdErrs}[${key}][${keyProp}]`);
                  gen.if(ajv_1._`${paramsErrors}.length`, () => {
                    const tmpl = gen.const(
                      'tmpl',
                      ajv_1._`${templates}[${key}] && ${templates}[${key}][${keyProp}]`
                    );
                    errors_1.reportError(cxt, {
                      message: ajv_1._`${tmpl} ? ${tmpl}() : ${schemaValue}[${key}][${keyProp}]`,
                      params: ajv_1._`{errors: ${paramsErrors}}`,
                    });
                  });
                })
              );
            }
            function processChildErrors(childErrors) {
              const { props, items } = childErrors;
              if (!props && !items) return;
              const isObj = ajv_1._`typeof ${data} == "object"`;
              const isArr = ajv_1._`Array.isArray(${data})`;
              const childErrs = gen.let('emErrors');
              let childKwd;
              let childProp;
              const templates = gen.let('templates');
              if (props && items) {
                childKwd = gen.let('emChildKwd');
                gen.if(isObj);
                gen.if(
                  isArr,
                  () => {
                    init(items, schema.items);
                    gen.assign(childKwd, ajv_1.str`items`);
                  },
                  () => {
                    init(props, schema.properties);
                    gen.assign(childKwd, ajv_1.str`properties`);
                  }
                );
                childProp = ajv_1._`[${childKwd}]`;
              } else if (items) {
                gen.if(isArr);
                init(items, schema.items);
                childProp = ajv_1._`.items`;
              } else if (props) {
                gen.if(codegen_1.and(isObj, codegen_1.not(isArr)));
                init(props, schema.properties);
                childProp = ajv_1._`.properties`;
              }
              gen.forOf('err', names_1.default.vErrors, err =>
                ifMatchesChildError(err, childErrs, child =>
                  gen
                    .code(ajv_1._`${childErrs}[${child}].push(${err})`)
                    .assign(ajv_1._`${err}.${used}`, true)
                )
              );
              gen.forIn('key', childErrs, key =>
                gen.if(ajv_1._`${childErrs}[${key}].length`, () => {
                  errors_1.reportError(cxt, {
                    message: ajv_1._`${key} in ${templates} ? ${templates}[${key}]() : ${schemaValue}${childProp}[${key}]`,
                    params: ajv_1._`{errors: ${childErrs}[${key}]}`,
                  });
                  gen.assign(
                    ajv_1._`${names_1.default.vErrors}[${names_1.default.errors}-1].instancePath`,
                    ajv_1._`${instancePath} + "/" + ${key}.replace(/~/g, "~0").replace(/\\//g, "~1")`
                  );
                })
              );
              gen.endIf();
              function init(children, msgs) {
                gen.assign(childErrs, ajv_1.stringify(children));
                gen.assign(templates, getTemplatesCode(children, msgs));
              }
            }
            function processAllErrors(schMessage) {
              const errs = gen.const('emErrs', ajv_1._`[]`);
              gen.forOf('err', names_1.default.vErrors, err =>
                gen.if(matchAnyError(err), () =>
                  gen.code(ajv_1._`${errs}.push(${err})`).assign(ajv_1._`${err}.${used}`, true)
                )
              );
              gen.if(ajv_1._`${errs}.length`, () =>
                errors_1.reportError(cxt, {
                  message: templateExpr(schMessage),
                  params: ajv_1._`{errors: ${errs}}`,
                })
              );
            }
            function removeUsedErrors() {
              const errs = gen.const('emErrs', ajv_1._`[]`);
              gen.forOf('err', names_1.default.vErrors, err =>
                gen.if(ajv_1._`!${err}.${used}`, () => gen.code(ajv_1._`${errs}.push(${err})`))
              );
              gen
                .assign(names_1.default.vErrors, errs)
                .assign(names_1.default.errors, ajv_1._`${errs}.length`);
            }
            function matchKeywordError(err, kwdErrs) {
              return codegen_1.and(
                ajv_1._`${err}.keyword !== ${keyword}`,
                ajv_1._`!${err}.${used}`,
                ajv_1._`${err}.instancePath === ${instancePath}`,
                ajv_1._`${err}.keyword in ${kwdErrs}`,
                // TODO match the end of the string?
                ajv_1._`${err}.schemaPath.indexOf(${it.errSchemaPath}) === 0`,
                ajv_1._`/^\\/[^\\/]*$/.test(${err}.schemaPath.slice(${it.errSchemaPath.length}))`
              );
            }
            function ifMatchesChildError(err, childErrs, thenBody) {
              gen.if(
                codegen_1.and(
                  ajv_1._`${err}.keyword !== ${keyword}`,
                  ajv_1._`!${err}.${used}`,
                  ajv_1._`${err}.instancePath.indexOf(${instancePath}) === 0`
                ),
                () => {
                  const childRegex = gen.scopeValue('pattern', {
                    ref: /^\/([^/]*)(?:\/|$)/,
                    code: ajv_1._`new RegExp("^\\\/([^/]*)(?:\\\/|$)")`,
                  });
                  const matches = gen.const(
                    'emMatches',
                    ajv_1._`${childRegex}.exec(${err}.instancePath.slice(${instancePath}.length))`
                  );
                  const child = gen.const(
                    'emChild',
                    ajv_1._`${matches} && ${matches}[1].replace(/~1/g, "/").replace(/~0/g, "~")`
                  );
                  gen.if(ajv_1._`${child} !== undefined && ${child} in ${childErrs}`, () =>
                    thenBody(child)
                  );
                }
              );
            }
            function matchAnyError(err) {
              return codegen_1.and(
                ajv_1._`${err}.keyword !== ${keyword}`,
                ajv_1._`!${err}.${used}`,
                codegen_1.or(
                  ajv_1._`${err}.instancePath === ${instancePath}`,
                  codegen_1.and(
                    ajv_1._`${err}.instancePath.indexOf(${instancePath}) === 0`,
                    ajv_1._`${err}.instancePath[${instancePath}.length] === "/"`
                  )
                ),
                ajv_1._`${err}.schemaPath.indexOf(${it.errSchemaPath}) === 0`,
                ajv_1._`${err}.schemaPath[${it.errSchemaPath}.length] === "/"`
              );
            }
            function getTemplatesCode(keys, msgs) {
              const templatesCode = [];
              for (const k in keys) {
                const msg = msgs[k];
                if (INTERPOLATION.test(msg)) templatesCode.push([k, templateFunc(msg)]);
              }
              return gen.object(...templatesCode);
            }
            function templateExpr(msg) {
              if (!INTERPOLATION.test(msg)) return ajv_1.stringify(msg);
              return new code_1._Code(
                code_1
                  .safeStringify(msg)
                  .replace(
                    INTERPOLATION_REPLACE,
                    (_s, ptr) => `" + JSON.stringify(${validate_1.getData(ptr, it)}) + "`
                  )
                  .replace(EMPTY_STR, '')
              );
            }
            function templateFunc(msg) {
              return ajv_1._`function(){return ${templateExpr(msg)}}`;
            }
          },
          metaSchema: {
            anyOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: {
                  properties: { $ref: '#/$defs/stringMap' },
                  items: { $ref: '#/$defs/stringList' },
                  required: { $ref: '#/$defs/stringOrMap' },
                  dependencies: { $ref: '#/$defs/stringOrMap' },
                },
                additionalProperties: { type: 'string' },
              },
            ],
            $defs: {
              stringMap: {
                type: 'object',
                additionalProperties: { type: 'string' },
              },
              stringOrMap: {
                anyOf: [{ type: 'string' }, { $ref: '#/$defs/stringMap' }],
              },
              stringList: { type: 'array', items: { type: 'string' } },
            },
          },
        };
      }
      var ajvErrors = (ajv, options = {}) => {
        if (!ajv.opts.allErrors) throw new Error('ajv-errors: Ajv option allErrors must be true');
        if (ajv.opts.jsPropertySyntax) {
          throw new Error('ajv-errors: ajv option jsPropertySyntax is not supported');
        }
        return ajv.addKeyword(errorMessage(options));
      };
      exports.default = ajvErrors;
      module.exports = ajvErrors;
      module.exports.default = ajvErrors;
    },
  });

  // packages/core/node_modules/json-source-map/index.js
  var require_json_source_map = __commonJS({
    'packages/core/node_modules/json-source-map/index.js'(exports) {
      'use strict';
      var escapedChars = {
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '	',
        '"': '"',
        '/': '/',
        '\\': '\\',
      };
      var A_CODE = 'a'.charCodeAt();
      exports.parse = function (source, _, options) {
        var pointers = {};
        var line = 0;
        var column = 0;
        var pos = 0;
        var bigint = options && options.bigint && typeof BigInt != 'undefined';
        return {
          data: _parse('', true),
          pointers,
        };
        function _parse(ptr, topLevel) {
          whitespace();
          var data;
          map(ptr, 'value');
          var char = getChar();
          switch (char) {
            case 't':
              read('rue');
              data = true;
              break;
            case 'f':
              read('alse');
              data = false;
              break;
            case 'n':
              read('ull');
              data = null;
              break;
            case '"':
              data = parseString();
              break;
            case '[':
              data = parseArray(ptr);
              break;
            case '{':
              data = parseObject(ptr);
              break;
            default:
              backChar();
              if ('-0123456789'.indexOf(char) >= 0) data = parseNumber();
              else unexpectedToken();
          }
          map(ptr, 'valueEnd');
          whitespace();
          if (topLevel && pos < source.length) unexpectedToken();
          return data;
        }
        function whitespace() {
          loop: while (pos < source.length) {
            switch (source[pos]) {
              case ' ':
                column++;
                break;
              case '	':
                column += 4;
                break;
              case '\r':
                column = 0;
                break;
              case '\n':
                column = 0;
                line++;
                break;
              default:
                break loop;
            }
            pos++;
          }
        }
        function parseString() {
          var str = '';
          var char;
          while (true) {
            char = getChar();
            if (char == '"') {
              break;
            } else if (char == '\\') {
              char = getChar();
              if (char in escapedChars) str += escapedChars[char];
              else if (char == 'u') str += getCharCode();
              else wasUnexpectedToken();
            } else {
              str += char;
            }
          }
          return str;
        }
        function parseNumber() {
          var numStr = '';
          var integer = true;
          if (source[pos] == '-') numStr += getChar();
          numStr += source[pos] == '0' ? getChar() : getDigits();
          if (source[pos] == '.') {
            numStr += getChar() + getDigits();
            integer = false;
          }
          if (source[pos] == 'e' || source[pos] == 'E') {
            numStr += getChar();
            if (source[pos] == '+' || source[pos] == '-') numStr += getChar();
            numStr += getDigits();
            integer = false;
          }
          var result = +numStr;
          return bigint &&
            integer &&
            (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER)
            ? BigInt(numStr)
            : result;
        }
        function parseArray(ptr) {
          whitespace();
          var arr = [];
          var i = 0;
          if (getChar() == ']') return arr;
          backChar();
          while (true) {
            var itemPtr = ptr + '/' + i;
            arr.push(_parse(itemPtr));
            whitespace();
            var char = getChar();
            if (char == ']') break;
            if (char != ',') wasUnexpectedToken();
            whitespace();
            i++;
          }
          return arr;
        }
        function parseObject(ptr) {
          whitespace();
          var obj = {};
          if (getChar() == '}') return obj;
          backChar();
          while (true) {
            var loc = getLoc();
            if (getChar() != '"') wasUnexpectedToken();
            var key = parseString();
            var propPtr = ptr + '/' + escapeJsonPointer(key);
            mapLoc(propPtr, 'key', loc);
            map(propPtr, 'keyEnd');
            whitespace();
            if (getChar() != ':') wasUnexpectedToken();
            whitespace();
            obj[key] = _parse(propPtr);
            whitespace();
            var char = getChar();
            if (char == '}') break;
            if (char != ',') wasUnexpectedToken();
            whitespace();
          }
          return obj;
        }
        function read(str) {
          for (var i = 0; i < str.length; i++) if (getChar() !== str[i]) wasUnexpectedToken();
        }
        function getChar() {
          checkUnexpectedEnd();
          var char = source[pos];
          pos++;
          column++;
          return char;
        }
        function backChar() {
          pos--;
          column--;
        }
        function getCharCode() {
          var count = 4;
          var code = 0;
          while (count--) {
            code <<= 4;
            var char = getChar().toLowerCase();
            if (char >= 'a' && char <= 'f') code += char.charCodeAt() - A_CODE + 10;
            else if (char >= '0' && char <= '9') code += +char;
            else wasUnexpectedToken();
          }
          return String.fromCharCode(code);
        }
        function getDigits() {
          var digits = '';
          while (source[pos] >= '0' && source[pos] <= '9') digits += getChar();
          if (digits.length) return digits;
          checkUnexpectedEnd();
          unexpectedToken();
        }
        function map(ptr, prop) {
          mapLoc(ptr, prop, getLoc());
        }
        function mapLoc(ptr, prop, loc) {
          pointers[ptr] = pointers[ptr] || {};
          pointers[ptr][prop] = loc;
        }
        function getLoc() {
          return {
            line,
            column,
            pos,
          };
        }
        function unexpectedToken() {
          throw new SyntaxError('Unexpected token ' + source[pos] + ' in JSON at position ' + pos);
        }
        function wasUnexpectedToken() {
          backChar();
          unexpectedToken();
        }
        function checkUnexpectedEnd() {
          if (pos >= source.length) throw new SyntaxError('Unexpected end of JSON input');
        }
      };
      exports.stringify = function (data, _, options) {
        if (!validType(data)) return;
        var wsLine = 0;
        var wsPos, wsColumn;
        var whitespace = typeof options == 'object' ? options.space : options;
        switch (typeof whitespace) {
          case 'number':
            var len = whitespace > 10 ? 10 : whitespace < 0 ? 0 : Math.floor(whitespace);
            whitespace = len && repeat(len, ' ');
            wsPos = len;
            wsColumn = len;
            break;
          case 'string':
            whitespace = whitespace.slice(0, 10);
            wsPos = 0;
            wsColumn = 0;
            for (var j = 0; j < whitespace.length; j++) {
              var char = whitespace[j];
              switch (char) {
                case ' ':
                  wsColumn++;
                  break;
                case '	':
                  wsColumn += 4;
                  break;
                case '\r':
                  wsColumn = 0;
                  break;
                case '\n':
                  wsColumn = 0;
                  wsLine++;
                  break;
                default:
                  throw new Error('whitespace characters not allowed in JSON');
              }
              wsPos++;
            }
            break;
          default:
            whitespace = void 0;
        }
        var json = '';
        var pointers = {};
        var line = 0;
        var column = 0;
        var pos = 0;
        var es6 = options && options.es6 && typeof Map == 'function';
        _stringify(data, 0, '');
        return {
          json,
          pointers,
        };
        function _stringify(_data, lvl, ptr) {
          map(ptr, 'value');
          switch (typeof _data) {
            case 'number':
            case 'bigint':
            case 'boolean':
              out('' + _data);
              break;
            case 'string':
              out(quoted(_data));
              break;
            case 'object':
              if (_data === null) {
                out('null');
              } else if (typeof _data.toJSON == 'function') {
                out(quoted(_data.toJSON()));
              } else if (Array.isArray(_data)) {
                stringifyArray();
              } else if (es6) {
                if (_data.constructor.BYTES_PER_ELEMENT) stringifyArray();
                else if (_data instanceof Map) stringifyMapSet();
                else if (_data instanceof Set) stringifyMapSet(true);
                else stringifyObject();
              } else {
                stringifyObject();
              }
          }
          map(ptr, 'valueEnd');
          function stringifyArray() {
            if (_data.length) {
              out('[');
              var itemLvl = lvl + 1;
              for (var i = 0; i < _data.length; i++) {
                if (i) out(',');
                indent(itemLvl);
                var item = validType(_data[i]) ? _data[i] : null;
                var itemPtr = ptr + '/' + i;
                _stringify(item, itemLvl, itemPtr);
              }
              indent(lvl);
              out(']');
            } else {
              out('[]');
            }
          }
          function stringifyObject() {
            var keys = Object.keys(_data);
            if (keys.length) {
              out('{');
              var propLvl = lvl + 1;
              for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = _data[key];
                if (validType(value)) {
                  if (i) out(',');
                  var propPtr = ptr + '/' + escapeJsonPointer(key);
                  indent(propLvl);
                  map(propPtr, 'key');
                  out(quoted(key));
                  map(propPtr, 'keyEnd');
                  out(':');
                  if (whitespace) out(' ');
                  _stringify(value, propLvl, propPtr);
                }
              }
              indent(lvl);
              out('}');
            } else {
              out('{}');
            }
          }
          function stringifyMapSet(isSet) {
            if (_data.size) {
              out('{');
              var propLvl = lvl + 1;
              var first = true;
              var entries = _data.entries();
              var entry = entries.next();
              while (!entry.done) {
                var item = entry.value;
                var key = item[0];
                var value = isSet ? true : item[1];
                if (validType(value)) {
                  if (!first) out(',');
                  first = false;
                  var propPtr = ptr + '/' + escapeJsonPointer(key);
                  indent(propLvl);
                  map(propPtr, 'key');
                  out(quoted(key));
                  map(propPtr, 'keyEnd');
                  out(':');
                  if (whitespace) out(' ');
                  _stringify(value, propLvl, propPtr);
                }
                entry = entries.next();
              }
              indent(lvl);
              out('}');
            } else {
              out('{}');
            }
          }
        }
        function out(str) {
          column += str.length;
          pos += str.length;
          json += str;
        }
        function indent(lvl) {
          if (whitespace) {
            json += '\n' + repeat(lvl, whitespace);
            line++;
            column = 0;
            while (lvl--) {
              if (wsLine) {
                line += wsLine;
                column = wsColumn;
              } else {
                column += wsColumn;
              }
              pos += wsPos;
            }
            pos += 1;
          }
        }
        function map(ptr, prop) {
          pointers[ptr] = pointers[ptr] || {};
          pointers[ptr][prop] = {
            line,
            column,
            pos,
          };
        }
        function repeat(n, str) {
          return Array(n + 1).join(str);
        }
      };
      var VALID_TYPES = ['number', 'bigint', 'boolean', 'string', 'object'];
      function validType(data) {
        return VALID_TYPES.indexOf(typeof data) >= 0;
      }
      var ESC_QUOTE = /"|\\/g;
      var ESC_B = /[\b]/g;
      var ESC_F = /\f/g;
      var ESC_N = /\n/g;
      var ESC_R = /\r/g;
      var ESC_T = /\t/g;
      function quoted(str) {
        str = str
          .replace(ESC_QUOTE, '\\$&')
          .replace(ESC_F, '\\f')
          .replace(ESC_B, '\\b')
          .replace(ESC_N, '\\n')
          .replace(ESC_R, '\\r')
          .replace(ESC_T, '\\t');
        return '"' + str + '"';
      }
      var ESC_0 = /~/g;
      var ESC_1 = /\//g;
      function escapeJsonPointer(str) {
        return str.replace(ESC_0, '~0').replace(ESC_1, '~1');
      }
    },
  });

  // packages/core/node_modules/semver/internal/constants.js
  var require_constants = __commonJS({
    'packages/core/node_modules/semver/internal/constants.js'(exports, module) {
      'use strict';
      var SEMVER_SPEC_VERSION = '2.0.0';
      var MAX_LENGTH = 256;
      var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER /* istanbul ignore next */ || 9007199254740991;
      var MAX_SAFE_COMPONENT_LENGTH = 16;
      var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
      var RELEASE_TYPES = [
        'major',
        'premajor',
        'minor',
        'preminor',
        'patch',
        'prepatch',
        'prerelease',
      ];
      module.exports = {
        MAX_LENGTH,
        MAX_SAFE_COMPONENT_LENGTH,
        MAX_SAFE_BUILD_LENGTH,
        MAX_SAFE_INTEGER,
        RELEASE_TYPES,
        SEMVER_SPEC_VERSION,
        FLAG_INCLUDE_PRERELEASE: 1,
        FLAG_LOOSE: 2,
      };
    },
  });

  // packages/core/node_modules/semver/internal/debug.js
  var require_debug = __commonJS({
    'packages/core/node_modules/semver/internal/debug.js'(exports, module) {
      'use strict';
      var debug =
        typeof process === 'object' &&
        process.env &&
        process.env.NODE_DEBUG &&
        /\bsemver\b/i.test(process.env.NODE_DEBUG)
          ? (...args) => console.error('SEMVER', ...args)
          : () => {};
      module.exports = debug;
    },
  });

  // packages/core/node_modules/semver/internal/re.js
  var require_re = __commonJS({
    'packages/core/node_modules/semver/internal/re.js'(exports, module) {
      'use strict';
      var { MAX_SAFE_COMPONENT_LENGTH, MAX_SAFE_BUILD_LENGTH, MAX_LENGTH } = require_constants();
      var debug = require_debug();
      exports = module.exports = {};
      var re = (exports.re = []);
      var safeRe = (exports.safeRe = []);
      var src = (exports.src = []);
      var safeSrc = (exports.safeSrc = []);
      var t = (exports.t = {});
      var R = 0;
      var LETTERDASHNUMBER = '[a-zA-Z0-9-]';
      var safeRegexReplacements = [
        ['\\s', 1],
        ['\\d', MAX_LENGTH],
        [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
      ];
      var makeSafeRegex = value => {
        for (const [token, max] of safeRegexReplacements) {
          value = value
            .split(`${token}*`)
            .join(`${token}{0,${max}}`)
            .split(`${token}+`)
            .join(`${token}{1,${max}}`);
        }
        return value;
      };
      var createToken = (name, value, isGlobal) => {
        const safe = makeSafeRegex(value);
        const index = R++;
        debug(name, index, value);
        t[name] = index;
        src[index] = value;
        safeSrc[index] = safe;
        re[index] = new RegExp(value, isGlobal ? 'g' : void 0);
        safeRe[index] = new RegExp(safe, isGlobal ? 'g' : void 0);
      };
      createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
      createToken('NUMERICIDENTIFIERLOOSE', '\\d+');
      createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
      createToken(
        'MAINVERSION',
        `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`
      );
      createToken(
        'MAINVERSIONLOOSE',
        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`
      );
      createToken(
        'PRERELEASEIDENTIFIER',
        `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`
      );
      createToken(
        'PRERELEASEIDENTIFIERLOOSE',
        `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`
      );
      createToken(
        'PRERELEASE',
        `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`
      );
      createToken(
        'PRERELEASELOOSE',
        `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`
      );
      createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);
      createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
      createToken('FULLPLAIN', `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
      createToken('FULL', `^${src[t.FULLPLAIN]}$`);
      createToken(
        'LOOSEPLAIN',
        `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`
      );
      createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);
      createToken('GTLT', '((?:<|>)?=?)');
      createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
      createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
      createToken(
        'XRANGEPLAIN',
        `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`
      );
      createToken(
        'XRANGEPLAINLOOSE',
        `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`
      );
      createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
      createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
      createToken(
        'COERCEPLAIN',
        `${'(^|[^\\d])(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`
      );
      createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
      createToken(
        'COERCEFULL',
        src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`
      );
      createToken('COERCERTL', src[t.COERCE], true);
      createToken('COERCERTLFULL', src[t.COERCEFULL], true);
      createToken('LONETILDE', '(?:~>?)');
      createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
      exports.tildeTrimReplace = '$1~';
      createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
      createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken('LONECARET', '(?:\\^)');
      createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
      exports.caretTrimReplace = '$1^';
      createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
      createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
      createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
      createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
      createToken(
        'COMPARATORTRIM',
        `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`,
        true
      );
      exports.comparatorTrimReplace = '$1$2$3';
      createToken(
        'HYPHENRANGE',
        `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`
      );
      createToken(
        'HYPHENRANGELOOSE',
        `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`
      );
      createToken('STAR', '(<|>)?=?\\s*\\*');
      createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
      createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$');
    },
  });

  // packages/core/node_modules/semver/internal/parse-options.js
  var require_parse_options = __commonJS({
    'packages/core/node_modules/semver/internal/parse-options.js'(exports, module) {
      'use strict';
      var looseOption = Object.freeze({ loose: true });
      var emptyOpts = Object.freeze({});
      var parseOptions = options => {
        if (!options) {
          return emptyOpts;
        }
        if (typeof options !== 'object') {
          return looseOption;
        }
        return options;
      };
      module.exports = parseOptions;
    },
  });

  // packages/core/node_modules/semver/internal/identifiers.js
  var require_identifiers = __commonJS({
    'packages/core/node_modules/semver/internal/identifiers.js'(exports, module) {
      'use strict';
      var numeric = /^[0-9]+$/;
      var compareIdentifiers = (a, b) => {
        if (typeof a === 'number' && typeof b === 'number') {
          return a === b ? 0 : a < b ? -1 : 1;
        }
        const anum = numeric.test(a);
        const bnum = numeric.test(b);
        if (anum && bnum) {
          a = +a;
          b = +b;
        }
        return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
      };
      var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
      module.exports = {
        compareIdentifiers,
        rcompareIdentifiers,
      };
    },
  });

  // packages/core/node_modules/semver/classes/semver.js
  var require_semver = __commonJS({
    'packages/core/node_modules/semver/classes/semver.js'(exports, module) {
      'use strict';
      var debug = require_debug();
      var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
      var { safeRe: re, t } = require_re();
      var parseOptions = require_parse_options();
      var { compareIdentifiers } = require_identifiers();
      var isPrereleaseIdentifier = (prerelease, identifier) => {
        const identifiers = identifier.split('.');
        if (identifiers.length > prerelease.length) {
          return false;
        }
        for (let i = 0; i < identifiers.length; i++) {
          if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
            return false;
          }
        }
        return true;
      };
      var SemVer = class _SemVer {
        constructor(version, options) {
          options = parseOptions(options);
          if (version instanceof _SemVer) {
            if (
              version.loose === !!options.loose &&
              version.includePrerelease === !!options.includePrerelease
            ) {
              return version;
            } else {
              version = version.version;
            }
          } else if (typeof version !== 'string') {
            throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
          }
          if (version.length > MAX_LENGTH) {
            throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
          }
          debug('SemVer', version, options);
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
          if (!m) {
            throw new TypeError(`Invalid Version: ${version}`);
          }
          this.raw = version;
          this.major = +m[1];
          this.minor = +m[2];
          this.patch = +m[3];
          if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
            throw new TypeError('Invalid major version');
          }
          if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
            throw new TypeError('Invalid minor version');
          }
          if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
            throw new TypeError('Invalid patch version');
          }
          if (!m[4]) {
            this.prerelease = [];
          } else {
            this.prerelease = m[4].split('.').map(id => {
              if (/^[0-9]+$/.test(id)) {
                const num = +id;
                if (num >= 0 && num < MAX_SAFE_INTEGER) {
                  return num;
                }
              }
              return id;
            });
          }
          this.build = m[5] ? m[5].split('.') : [];
          this.format();
        }
        format() {
          this.version = `${this.major}.${this.minor}.${this.patch}`;
          if (this.prerelease.length) {
            this.version += `-${this.prerelease.join('.')}`;
          }
          return this.version;
        }
        toString() {
          return this.version;
        }
        compare(other) {
          debug('SemVer.compare', this.version, this.options, other);
          if (!(other instanceof _SemVer)) {
            if (typeof other === 'string' && other === this.version) {
              return 0;
            }
            other = new _SemVer(other, this.options);
          }
          if (other.version === this.version) {
            return 0;
          }
          return this.compareMain(other) || this.comparePre(other);
        }
        compareMain(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          if (this.major < other.major) {
            return -1;
          }
          if (this.major > other.major) {
            return 1;
          }
          if (this.minor < other.minor) {
            return -1;
          }
          if (this.minor > other.minor) {
            return 1;
          }
          if (this.patch < other.patch) {
            return -1;
          }
          if (this.patch > other.patch) {
            return 1;
          }
          return 0;
        }
        comparePre(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          if (this.prerelease.length && !other.prerelease.length) {
            return -1;
          } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
          } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
          }
          let i = 0;
          do {
            const a = this.prerelease[i];
            const b = other.prerelease[i];
            debug('prerelease compare', i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        compareBuild(other) {
          if (!(other instanceof _SemVer)) {
            other = new _SemVer(other, this.options);
          }
          let i = 0;
          do {
            const a = this.build[i];
            const b = other.build[i];
            debug('build compare', i, a, b);
            if (a === void 0 && b === void 0) {
              return 0;
            } else if (b === void 0) {
              return 1;
            } else if (a === void 0) {
              return -1;
            } else if (a === b) {
              continue;
            } else {
              return compareIdentifiers(a, b);
            }
          } while (++i);
        }
        // preminor will bump the version up to the next minor release, and immediately
        // down to pre-release. premajor and prepatch work the same way.
        inc(release, identifier, identifierBase) {
          if (release.startsWith('pre')) {
            if (!identifier && identifierBase === false) {
              throw new Error('invalid increment argument: identifier is empty');
            }
            if (identifier) {
              const match = `-${identifier}`.match(
                this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]
              );
              if (!match || match[1] !== identifier) {
                throw new Error(`invalid identifier: ${identifier}`);
              }
            }
          }
          switch (release) {
            case 'premajor':
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor = 0;
              this.major++;
              this.inc('pre', identifier, identifierBase);
              break;
            case 'preminor':
              this.prerelease.length = 0;
              this.patch = 0;
              this.minor++;
              this.inc('pre', identifier, identifierBase);
              break;
            case 'prepatch':
              this.prerelease.length = 0;
              this.inc('patch', identifier, identifierBase);
              this.inc('pre', identifier, identifierBase);
              break;
            // If the input is a non-prerelease version, this acts the same as
            // prepatch.
            case 'prerelease':
              if (this.prerelease.length === 0) {
                this.inc('patch', identifier, identifierBase);
              }
              this.inc('pre', identifier, identifierBase);
              break;
            case 'release':
              if (this.prerelease.length === 0) {
                throw new Error(`version ${this.raw} is not a prerelease`);
              }
              this.prerelease.length = 0;
              break;
            case 'major':
              if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                this.major++;
              }
              this.minor = 0;
              this.patch = 0;
              this.prerelease = [];
              break;
            case 'minor':
              if (this.patch !== 0 || this.prerelease.length === 0) {
                this.minor++;
              }
              this.patch = 0;
              this.prerelease = [];
              break;
            case 'patch':
              if (this.prerelease.length === 0) {
                this.patch++;
              }
              this.prerelease = [];
              break;
            // This probably shouldn't be used publicly.
            // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
            case 'pre': {
              const base = Number(identifierBase) ? 1 : 0;
              if (this.prerelease.length === 0) {
                this.prerelease = [base];
              } else {
                let i = this.prerelease.length;
                while (--i >= 0) {
                  if (typeof this.prerelease[i] === 'number') {
                    this.prerelease[i]++;
                    i = -2;
                  }
                }
                if (i === -1) {
                  if (identifier === this.prerelease.join('.') && identifierBase === false) {
                    throw new Error('invalid increment argument: identifier already exists');
                  }
                  this.prerelease.push(base);
                }
              }
              if (identifier) {
                let prerelease = [identifier, base];
                if (identifierBase === false) {
                  prerelease = [identifier];
                }
                if (isPrereleaseIdentifier(this.prerelease, identifier)) {
                  const prereleaseBase = this.prerelease[identifier.split('.').length];
                  if (isNaN(prereleaseBase)) {
                    this.prerelease = prerelease;
                  }
                } else {
                  this.prerelease = prerelease;
                }
              }
              break;
            }
            default:
              throw new Error(`invalid increment argument: ${release}`);
          }
          this.raw = this.format();
          if (this.build.length) {
            this.raw += `+${this.build.join('.')}`;
          }
          return this;
        }
      };
      module.exports = SemVer;
    },
  });

  // packages/core/node_modules/semver/functions/parse.js
  var require_parse = __commonJS({
    'packages/core/node_modules/semver/functions/parse.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var parse = (version, options, throwErrors = false) => {
        if (version instanceof SemVer) {
          return version;
        }
        try {
          return new SemVer(version, options);
        } catch (er) {
          if (!throwErrors) {
            return null;
          }
          throw er;
        }
      };
      module.exports = parse;
    },
  });

  // packages/core/node_modules/semver/functions/valid.js
  var require_valid = __commonJS({
    'packages/core/node_modules/semver/functions/valid.js'(exports, module) {
      'use strict';
      var parse = require_parse();
      var valid2 = (version, options) => {
        const v = parse(version, options);
        return v ? v.version : null;
      };
      module.exports = valid2;
    },
  });

  // packages/core/node_modules/semver/functions/clean.js
  var require_clean = __commonJS({
    'packages/core/node_modules/semver/functions/clean.js'(exports, module) {
      'use strict';
      var parse = require_parse();
      var clean = (version, options) => {
        const s = parse(version.trim().replace(/^[=v]+/, ''), options);
        return s ? s.version : null;
      };
      module.exports = clean;
    },
  });

  // packages/core/node_modules/semver/functions/inc.js
  var require_inc = __commonJS({
    'packages/core/node_modules/semver/functions/inc.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var inc = (version, release, options, identifier, identifierBase) => {
        if (typeof options === 'string') {
          identifierBase = identifier;
          identifier = options;
          options = void 0;
        }
        try {
          return new SemVer(version instanceof SemVer ? version.version : version, options).inc(
            release,
            identifier,
            identifierBase
          ).version;
        } catch (er) {
          return null;
        }
      };
      module.exports = inc;
    },
  });

  // packages/core/node_modules/semver/functions/diff.js
  var require_diff = __commonJS({
    'packages/core/node_modules/semver/functions/diff.js'(exports, module) {
      'use strict';
      var parse = require_parse();
      var diff = (version1, version2) => {
        const v1 = parse(version1, null, true);
        const v2 = parse(version2, null, true);
        const comparison = v1.compare(v2);
        if (comparison === 0) {
          return null;
        }
        const v1Higher = comparison > 0;
        const highVersion = v1Higher ? v1 : v2;
        const lowVersion = v1Higher ? v2 : v1;
        const highHasPre = !!highVersion.prerelease.length;
        const lowHasPre = !!lowVersion.prerelease.length;
        if (lowHasPre && !highHasPre) {
          if (!lowVersion.patch && !lowVersion.minor) {
            return 'major';
          }
          if (lowVersion.compareMain(highVersion) === 0) {
            if (lowVersion.minor && !lowVersion.patch) {
              return 'minor';
            }
            return 'patch';
          }
        }
        const prefix = highHasPre ? 'pre' : '';
        if (v1.major !== v2.major) {
          return prefix + 'major';
        }
        if (v1.minor !== v2.minor) {
          return prefix + 'minor';
        }
        if (v1.patch !== v2.patch) {
          return prefix + 'patch';
        }
        return 'prerelease';
      };
      module.exports = diff;
    },
  });

  // packages/core/node_modules/semver/functions/major.js
  var require_major = __commonJS({
    'packages/core/node_modules/semver/functions/major.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var major = (a, loose) => new SemVer(a, loose).major;
      module.exports = major;
    },
  });

  // packages/core/node_modules/semver/functions/minor.js
  var require_minor = __commonJS({
    'packages/core/node_modules/semver/functions/minor.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var minor = (a, loose) => new SemVer(a, loose).minor;
      module.exports = minor;
    },
  });

  // packages/core/node_modules/semver/functions/patch.js
  var require_patch = __commonJS({
    'packages/core/node_modules/semver/functions/patch.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var patch = (a, loose) => new SemVer(a, loose).patch;
      module.exports = patch;
    },
  });

  // packages/core/node_modules/semver/functions/prerelease.js
  var require_prerelease = __commonJS({
    'packages/core/node_modules/semver/functions/prerelease.js'(exports, module) {
      'use strict';
      var parse = require_parse();
      var prerelease = (version, options) => {
        const parsed = parse(version, options);
        return parsed && parsed.prerelease.length ? parsed.prerelease : null;
      };
      module.exports = prerelease;
    },
  });

  // packages/core/node_modules/semver/functions/compare.js
  var require_compare = __commonJS({
    'packages/core/node_modules/semver/functions/compare.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
      module.exports = compare;
    },
  });

  // packages/core/node_modules/semver/functions/rcompare.js
  var require_rcompare = __commonJS({
    'packages/core/node_modules/semver/functions/rcompare.js'(exports, module) {
      'use strict';
      var compare = require_compare();
      var rcompare = (a, b, loose) => compare(b, a, loose);
      module.exports = rcompare;
    },
  });

  // packages/core/node_modules/semver/functions/compare-loose.js
  var require_compare_loose = __commonJS({
    'packages/core/node_modules/semver/functions/compare-loose.js'(exports, module) {
      'use strict';
      var compare = require_compare();
      var compareLoose = (a, b) => compare(a, b, true);
      module.exports = compareLoose;
    },
  });

  // packages/core/node_modules/semver/functions/compare-build.js
  var require_compare_build = __commonJS({
    'packages/core/node_modules/semver/functions/compare-build.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var compareBuild = (a, b, loose) => {
        const versionA = new SemVer(a, loose);
        const versionB = new SemVer(b, loose);
        return versionA.compare(versionB) || versionA.compareBuild(versionB);
      };
      module.exports = compareBuild;
    },
  });

  // packages/core/node_modules/semver/functions/sort.js
  var require_sort = __commonJS({
    'packages/core/node_modules/semver/functions/sort.js'(exports, module) {
      'use strict';
      var compareBuild = require_compare_build();
      var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
      module.exports = sort;
    },
  });

  // packages/core/node_modules/semver/functions/rsort.js
  var require_rsort = __commonJS({
    'packages/core/node_modules/semver/functions/rsort.js'(exports, module) {
      'use strict';
      var compareBuild = require_compare_build();
      var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
      module.exports = rsort;
    },
  });

  // packages/core/node_modules/semver/functions/gt.js
  var require_gt = __commonJS({
    'packages/core/node_modules/semver/functions/gt.js'(exports, module) {
      'use strict';
      var compare = require_compare();
      var gt = (a, b, loose) => compare(a, b, loose) > 0;
      module.exports = gt;
    },
  });

  // packages/core/node_modules/semver/functions/lt.js
  var require_lt = __commonJS({
    'packages/core/node_modules/semver/functions/lt.js'(exports, module) {
      'use strict';
      var compare = require_compare();
      var lt = (a, b, loose) => compare(a, b, loose) < 0;
      module.exports = lt;
    },
  });

  // packages/core/node_modules/semver/functions/eq.js
  var require_eq = __commonJS({
    'packages/core/node_modules/semver/functions/eq.js'(exports, module) {
      'use strict';
      var compare = require_compare();
      var eq = (a, b, loose) => compare(a, b, loose) === 0;
      module.exports = eq;
    },
  });

  // packages/core/node_modules/semver/functions/neq.js
  var require_neq = __commonJS({
    'packages/core/node_modules/semver/functions/neq.js'(exports, module) {
      'use strict';
      var compare = require_compare();
      var neq = (a, b, loose) => compare(a, b, loose) !== 0;
      module.exports = neq;
    },
  });

  // packages/core/node_modules/semver/functions/gte.js
  var require_gte = __commonJS({
    'packages/core/node_modules/semver/functions/gte.js'(exports, module) {
      'use strict';
      var compare = require_compare();
      var gte = (a, b, loose) => compare(a, b, loose) >= 0;
      module.exports = gte;
    },
  });

  // packages/core/node_modules/semver/functions/lte.js
  var require_lte = __commonJS({
    'packages/core/node_modules/semver/functions/lte.js'(exports, module) {
      'use strict';
      var compare = require_compare();
      var lte = (a, b, loose) => compare(a, b, loose) <= 0;
      module.exports = lte;
    },
  });

  // packages/core/node_modules/semver/functions/cmp.js
  var require_cmp = __commonJS({
    'packages/core/node_modules/semver/functions/cmp.js'(exports, module) {
      'use strict';
      var eq = require_eq();
      var neq = require_neq();
      var gt = require_gt();
      var gte = require_gte();
      var lt = require_lt();
      var lte = require_lte();
      var cmp = (a, op, b, loose) => {
        switch (op) {
          case '===':
            if (typeof a === 'object') {
              a = a.version;
            }
            if (typeof b === 'object') {
              b = b.version;
            }
            return a === b;
          case '!==':
            if (typeof a === 'object') {
              a = a.version;
            }
            if (typeof b === 'object') {
              b = b.version;
            }
            return a !== b;
          case '':
          case '=':
          case '==':
            return eq(a, b, loose);
          case '!=':
            return neq(a, b, loose);
          case '>':
            return gt(a, b, loose);
          case '>=':
            return gte(a, b, loose);
          case '<':
            return lt(a, b, loose);
          case '<=':
            return lte(a, b, loose);
          default:
            throw new TypeError(`Invalid operator: ${op}`);
        }
      };
      module.exports = cmp;
    },
  });

  // packages/core/node_modules/semver/functions/coerce.js
  var require_coerce = __commonJS({
    'packages/core/node_modules/semver/functions/coerce.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var parse = require_parse();
      var { safeRe: re, t } = require_re();
      var coerce = (version, options) => {
        if (version instanceof SemVer) {
          return version;
        }
        if (typeof version === 'number') {
          version = String(version);
        }
        if (typeof version !== 'string') {
          return null;
        }
        options = options || {};
        let match = null;
        if (!options.rtl) {
          match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
        } else {
          const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
          let next;
          while (
            (next = coerceRtlRegex.exec(version)) &&
            (!match || match.index + match[0].length !== version.length)
          ) {
            if (!match || next.index + next[0].length !== match.index + match[0].length) {
              match = next;
            }
            coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
          }
          coerceRtlRegex.lastIndex = -1;
        }
        if (match === null) {
          return null;
        }
        const major = match[2];
        const minor = match[3] || '0';
        const patch = match[4] || '0';
        const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : '';
        const build = options.includePrerelease && match[6] ? `+${match[6]}` : '';
        return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
      };
      module.exports = coerce;
    },
  });

  // packages/core/node_modules/semver/functions/truncate.js
  var require_truncate = __commonJS({
    'packages/core/node_modules/semver/functions/truncate.js'(exports, module) {
      'use strict';
      var parse = require_parse();
      var constants = require_constants();
      var SemVer = require_semver();
      var truncate = (version, truncation, options) => {
        if (!constants.RELEASE_TYPES.includes(truncation)) {
          return null;
        }
        const clonedVersion = cloneInputVersion(version, options);
        return clonedVersion && doTruncation(clonedVersion, truncation);
      };
      var cloneInputVersion = (version, options) => {
        const versionStringToParse = version instanceof SemVer ? version.version : version;
        return parse(versionStringToParse, options);
      };
      var doTruncation = (version, truncation) => {
        if (isPrerelease(truncation)) {
          return version.version;
        }
        version.prerelease = [];
        switch (truncation) {
          case 'major':
            version.minor = 0;
            version.patch = 0;
            break;
          case 'minor':
            version.patch = 0;
            break;
        }
        return version.format();
      };
      var isPrerelease = type7 => {
        return type7.startsWith('pre');
      };
      module.exports = truncate;
    },
  });

  // packages/core/node_modules/semver/internal/lrucache.js
  var require_lrucache = __commonJS({
    'packages/core/node_modules/semver/internal/lrucache.js'(exports, module) {
      'use strict';
      var LRUCache = class {
        constructor() {
          this.max = 1e3;
          this.map = /* @__PURE__ */ new Map();
        }
        get(key) {
          const value = this.map.get(key);
          if (value === void 0) {
            return void 0;
          } else {
            this.map.delete(key);
            this.map.set(key, value);
            return value;
          }
        }
        delete(key) {
          return this.map.delete(key);
        }
        set(key, value) {
          const deleted = this.delete(key);
          if (!deleted && value !== void 0) {
            if (this.map.size >= this.max) {
              const firstKey = this.map.keys().next().value;
              this.delete(firstKey);
            }
            this.map.set(key, value);
          }
          return this;
        }
      };
      module.exports = LRUCache;
    },
  });

  // packages/core/node_modules/semver/classes/range.js
  var require_range = __commonJS({
    'packages/core/node_modules/semver/classes/range.js'(exports, module) {
      'use strict';
      var SPACE_CHARACTERS = /\s+/g;
      var Range = class _Range {
        constructor(range, options) {
          options = parseOptions(options);
          if (range instanceof _Range) {
            if (
              range.loose === !!options.loose &&
              range.includePrerelease === !!options.includePrerelease
            ) {
              return range;
            } else {
              return new _Range(range.raw, options);
            }
          }
          if (range instanceof Comparator) {
            this.raw = range.value;
            this.set = [[range]];
            this.formatted = void 0;
            return this;
          }
          this.options = options;
          this.loose = !!options.loose;
          this.includePrerelease = !!options.includePrerelease;
          this.raw = range.trim().replace(SPACE_CHARACTERS, ' ');
          this.set = this.raw
            .split('||')
            .map(r => this.parseRange(r.trim()))
            .filter(c => c.length);
          if (!this.set.length) {
            throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
          }
          if (this.set.length > 1) {
            const first = this.set[0];
            this.set = this.set.filter(c => !isNullSet(c[0]));
            if (this.set.length === 0) {
              this.set = [first];
            } else if (this.set.length > 1) {
              for (const c of this.set) {
                if (c.length === 1 && isAny(c[0])) {
                  this.set = [c];
                  break;
                }
              }
            }
          }
          this.formatted = void 0;
        }
        get range() {
          if (this.formatted === void 0) {
            this.formatted = '';
            for (let i = 0; i < this.set.length; i++) {
              if (i > 0) {
                this.formatted += '||';
              }
              const comps = this.set[i];
              for (let k = 0; k < comps.length; k++) {
                if (k > 0) {
                  this.formatted += ' ';
                }
                this.formatted += comps[k].toString().trim();
              }
            }
          }
          return this.formatted;
        }
        format() {
          return this.range;
        }
        toString() {
          return this.range;
        }
        parseRange(range) {
          range = range.replace(BUILDSTRIPRE, '');
          const memoOpts =
            (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
            (this.options.loose && FLAG_LOOSE);
          const memoKey = memoOpts + ':' + range;
          const cached = cache.get(memoKey);
          if (cached) {
            return cached;
          }
          const loose = this.options.loose;
          const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
          range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
          debug('hyphen replace', range);
          range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
          debug('comparator trim', range);
          range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
          debug('tilde trim', range);
          range = range.replace(re[t.CARETTRIM], caretTrimReplace);
          debug('caret trim', range);
          let rangeList = range
            .split(' ')
            .map(comp => parseComparator(comp, this.options))
            .join(' ')
            .split(/\s+/)
            .map(comp => replaceGTE0(comp, this.options));
          if (loose) {
            rangeList = rangeList.filter(comp => {
              debug('loose invalid filter', comp, this.options);
              return !!comp.match(re[t.COMPARATORLOOSE]);
            });
          }
          debug('range list', rangeList);
          const rangeMap = /* @__PURE__ */ new Map();
          const comparators = rangeList.map(comp => new Comparator(comp, this.options));
          for (const comp of comparators) {
            if (isNullSet(comp)) {
              return [comp];
            }
            rangeMap.set(comp.value, comp);
          }
          if (rangeMap.size > 1 && rangeMap.has('')) {
            rangeMap.delete('');
          }
          const result = [...rangeMap.values()];
          cache.set(memoKey, result);
          return result;
        }
        intersects(range, options) {
          if (!(range instanceof _Range)) {
            throw new TypeError('a Range is required');
          }
          return this.set.some(thisComparators => {
            return (
              isSatisfiable(thisComparators, options) &&
              range.set.some(rangeComparators => {
                return (
                  isSatisfiable(rangeComparators, options) &&
                  thisComparators.every(thisComparator => {
                    return rangeComparators.every(rangeComparator => {
                      return thisComparator.intersects(rangeComparator, options);
                    });
                  })
                );
              })
            );
          });
        }
        // if ANY of the sets match ALL of its comparators, then pass
        test(version) {
          if (!version) {
            return false;
          }
          if (typeof version === 'string') {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          for (let i = 0; i < this.set.length; i++) {
            if (testSet(this.set[i], version, this.options)) {
              return true;
            }
          }
          return false;
        }
      };
      module.exports = Range;
      var LRU = require_lrucache();
      var cache = new LRU();
      var parseOptions = require_parse_options();
      var Comparator = require_comparator();
      var debug = require_debug();
      var SemVer = require_semver();
      var {
        safeRe: re,
        src,
        t,
        comparatorTrimReplace,
        tildeTrimReplace,
        caretTrimReplace,
      } = require_re();
      var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
      var BUILDSTRIPRE = new RegExp(src[t.BUILD], 'g');
      var isNullSet = c => c.value === '<0.0.0-0';
      var isAny = c => c.value === '';
      var isSatisfiable = (comparators, options) => {
        let result = true;
        const remainingComparators = comparators.slice();
        let testComparator = remainingComparators.pop();
        while (result && remainingComparators.length) {
          result = remainingComparators.every(otherComparator => {
            return testComparator.intersects(otherComparator, options);
          });
          testComparator = remainingComparators.pop();
        }
        return result;
      };
      var parseComparator = (comp, options) => {
        comp = comp.replace(re[t.BUILD], '');
        debug('comp', comp, options);
        comp = replaceCarets(comp, options);
        debug('caret', comp);
        comp = replaceTildes(comp, options);
        debug('tildes', comp);
        comp = replaceXRanges(comp, options);
        debug('xrange', comp);
        comp = replaceStars(comp, options);
        debug('stars', comp);
        return comp;
      };
      var isX = id => !id || id.toLowerCase() === 'x' || id === '*';
      var invalidXRangeOrder = (M, m, p) => (isX(M) && !isX(m)) || (isX(m) && p && !isX(p));
      var replaceTildes = (comp, options) => {
        return comp
          .trim()
          .split(/\s+/)
          .map(c => replaceTilde(c, options))
          .join(' ');
      };
      var replaceTilde = (comp, options) => {
        const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
        const z = options.includePrerelease ? '-0' : '';
        return comp.replace(r, (_, M, m, p, pr) => {
          debug('tilde', comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = '';
          } else if (isX(m)) {
            ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else if (pr) {
            debug('replaceTilde pr', pr);
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
          }
          debug('tilde return', ret);
          return ret;
        });
      };
      var replaceCarets = (comp, options) => {
        return comp
          .trim()
          .split(/\s+/)
          .map(c => replaceCaret(c, options))
          .join(' ');
      };
      var replaceCaret = (comp, options) => {
        debug('caret', comp, options);
        const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
        const z = options.includePrerelease ? '-0' : '';
        return comp.replace(r, (_, M, m, p, pr) => {
          debug('caret', comp, _, M, m, p, pr);
          let ret;
          if (isX(M)) {
            ret = '';
          } else if (isX(m)) {
            ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
          } else if (isX(p)) {
            if (M === '0') {
              ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
            } else {
              ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
            }
          } else if (pr) {
            debug('replaceCaret pr', pr);
            if (M === '0') {
              if (m === '0') {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
            }
          } else {
            debug('no pr');
            if (M === '0') {
              if (m === '0') {
                ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
              } else {
                ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
              }
            } else {
              ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
            }
          }
          debug('caret return', ret);
          return ret;
        });
      };
      var replaceXRanges = (comp, options) => {
        debug('replaceXRanges', comp, options);
        return comp
          .split(/\s+/)
          .map(c => replaceXRange(c, options))
          .join(' ');
      };
      var replaceXRange = (comp, options) => {
        comp = comp.trim();
        const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
        return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
          debug('xRange', comp, ret, gtlt, M, m, p, pr);
          if (invalidXRangeOrder(M, m, p)) {
            return comp;
          }
          const xM = isX(M);
          const xm = xM || isX(m);
          const xp = xm || isX(p);
          const anyX = xp;
          if (gtlt === '=' && anyX) {
            gtlt = '';
          }
          pr = options.includePrerelease ? '-0' : '';
          if (xM) {
            if (gtlt === '>' || gtlt === '<') {
              ret = '<0.0.0-0';
            } else {
              ret = '*';
            }
          } else if (gtlt && anyX) {
            if (xm) {
              m = 0;
            }
            p = 0;
            if (gtlt === '>') {
              gtlt = '>=';
              if (xm) {
                M = +M + 1;
                m = 0;
                p = 0;
              } else {
                m = +m + 1;
                p = 0;
              }
            } else if (gtlt === '<=') {
              gtlt = '<';
              if (xm) {
                M = +M + 1;
              } else {
                m = +m + 1;
              }
            }
            if (gtlt === '<') {
              pr = '-0';
            }
            ret = `${gtlt + M}.${m}.${p}${pr}`;
          } else if (xm) {
            ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
          } else if (xp) {
            ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
          }
          debug('xRange return', ret);
          return ret;
        });
      };
      var replaceStars = (comp, options) => {
        debug('replaceStars', comp, options);
        return comp.trim().replace(re[t.STAR], '');
      };
      var replaceGTE0 = (comp, options) => {
        debug('replaceGTE0', comp, options);
        return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '');
      };
      var hyphenReplace = incPr => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
        if (isX(fM)) {
          from = '';
        } else if (isX(fm)) {
          from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
        } else if (isX(fp)) {
          from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
        } else if (fpr) {
          from = `>=${from}`;
        } else {
          from = `>=${from}${incPr ? '-0' : ''}`;
        }
        if (isX(tM)) {
          to = '';
        } else if (isX(tm)) {
          to = `<${+tM + 1}.0.0-0`;
        } else if (isX(tp)) {
          to = `<${tM}.${+tm + 1}.0-0`;
        } else if (tpr) {
          to = `<=${tM}.${tm}.${tp}-${tpr}`;
        } else if (incPr) {
          to = `<${tM}.${tm}.${+tp + 1}-0`;
        } else {
          to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
      };
      var testSet = (set, version, options) => {
        for (let i = 0; i < set.length; i++) {
          if (!set[i].test(version)) {
            return false;
          }
        }
        if (version.prerelease.length && !options.includePrerelease) {
          for (let i = 0; i < set.length; i++) {
            debug(set[i].semver);
            if (set[i].semver === Comparator.ANY) {
              continue;
            }
            if (set[i].semver.prerelease.length > 0) {
              const allowed = set[i].semver;
              if (
                allowed.major === version.major &&
                allowed.minor === version.minor &&
                allowed.patch === version.patch
              ) {
                return true;
              }
            }
          }
          return false;
        }
        return true;
      };
    },
  });

  // packages/core/node_modules/semver/classes/comparator.js
  var require_comparator = __commonJS({
    'packages/core/node_modules/semver/classes/comparator.js'(exports, module) {
      'use strict';
      var ANY = /* @__PURE__ */ Symbol('SemVer ANY');
      var Comparator = class _Comparator {
        static get ANY() {
          return ANY;
        }
        constructor(comp, options) {
          options = parseOptions(options);
          if (comp instanceof _Comparator) {
            if (comp.loose === !!options.loose) {
              return comp;
            } else {
              comp = comp.value;
            }
          }
          comp = comp.trim().split(/\s+/).join(' ');
          debug('comparator', comp, options);
          this.options = options;
          this.loose = !!options.loose;
          this.parse(comp);
          if (this.semver === ANY) {
            this.value = '';
          } else {
            this.value = this.operator + this.semver.version;
          }
          debug('comp', this);
        }
        parse(comp) {
          const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
          const m = comp.match(r);
          if (!m) {
            throw new TypeError(`Invalid comparator: ${comp}`);
          }
          this.operator = m[1] !== void 0 ? m[1] : '';
          if (this.operator === '=') {
            this.operator = '';
          }
          if (!m[2]) {
            this.semver = ANY;
          } else {
            this.semver = new SemVer(m[2], this.options.loose);
          }
        }
        toString() {
          return this.value;
        }
        test(version) {
          debug('Comparator.test', version, this.options.loose);
          if (this.semver === ANY || version === ANY) {
            return true;
          }
          if (typeof version === 'string') {
            try {
              version = new SemVer(version, this.options);
            } catch (er) {
              return false;
            }
          }
          return cmp(version, this.operator, this.semver, this.options);
        }
        intersects(comp, options) {
          if (!(comp instanceof _Comparator)) {
            throw new TypeError('a Comparator is required');
          }
          if (this.operator === '') {
            if (this.value === '') {
              return true;
            }
            return new Range(comp.value, options).test(this.value);
          } else if (comp.operator === '') {
            if (comp.value === '') {
              return true;
            }
            return new Range(this.value, options).test(comp.semver);
          }
          options = parseOptions(options);
          if (
            options.includePrerelease &&
            (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')
          ) {
            return false;
          }
          if (
            !options.includePrerelease &&
            (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))
          ) {
            return false;
          }
          if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
            return true;
          }
          if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
            return true;
          }
          if (
            this.semver.version === comp.semver.version &&
            this.operator.includes('=') &&
            comp.operator.includes('=')
          ) {
            return true;
          }
          if (
            cmp(this.semver, '<', comp.semver, options) &&
            this.operator.startsWith('>') &&
            comp.operator.startsWith('<')
          ) {
            return true;
          }
          if (
            cmp(this.semver, '>', comp.semver, options) &&
            this.operator.startsWith('<') &&
            comp.operator.startsWith('>')
          ) {
            return true;
          }
          return false;
        }
      };
      module.exports = Comparator;
      var parseOptions = require_parse_options();
      var { safeRe: re, t } = require_re();
      var cmp = require_cmp();
      var debug = require_debug();
      var SemVer = require_semver();
      var Range = require_range();
    },
  });

  // packages/core/node_modules/semver/functions/satisfies.js
  var require_satisfies = __commonJS({
    'packages/core/node_modules/semver/functions/satisfies.js'(exports, module) {
      'use strict';
      var Range = require_range();
      var satisfies2 = (version, range, options) => {
        try {
          range = new Range(range, options);
        } catch (er) {
          return false;
        }
        return range.test(version);
      };
      module.exports = satisfies2;
    },
  });

  // packages/core/node_modules/semver/ranges/to-comparators.js
  var require_to_comparators = __commonJS({
    'packages/core/node_modules/semver/ranges/to-comparators.js'(exports, module) {
      'use strict';
      var Range = require_range();
      var toComparators = (range, options) =>
        new Range(range, options).set.map(comp =>
          comp
            .map(c => c.value)
            .join(' ')
            .trim()
            .split(' ')
        );
      module.exports = toComparators;
    },
  });

  // packages/core/node_modules/semver/ranges/max-satisfying.js
  var require_max_satisfying = __commonJS({
    'packages/core/node_modules/semver/ranges/max-satisfying.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var Range = require_range();
      var maxSatisfying = (versions, range, options) => {
        let max = null;
        let maxSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach(v => {
          if (rangeObj.test(v)) {
            if (!max || maxSV.compare(v) === -1) {
              max = v;
              maxSV = new SemVer(max, options);
            }
          }
        });
        return max;
      };
      module.exports = maxSatisfying;
    },
  });

  // packages/core/node_modules/semver/ranges/min-satisfying.js
  var require_min_satisfying = __commonJS({
    'packages/core/node_modules/semver/ranges/min-satisfying.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var Range = require_range();
      var minSatisfying = (versions, range, options) => {
        let min = null;
        let minSV = null;
        let rangeObj = null;
        try {
          rangeObj = new Range(range, options);
        } catch (er) {
          return null;
        }
        versions.forEach(v => {
          if (rangeObj.test(v)) {
            if (!min || minSV.compare(v) === 1) {
              min = v;
              minSV = new SemVer(min, options);
            }
          }
        });
        return min;
      };
      module.exports = minSatisfying;
    },
  });

  // packages/core/node_modules/semver/ranges/min-version.js
  var require_min_version = __commonJS({
    'packages/core/node_modules/semver/ranges/min-version.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var Range = require_range();
      var gt = require_gt();
      var minVersion = (range, loose) => {
        range = new Range(range, loose);
        let minver = new SemVer('0.0.0');
        if (range.test(minver)) {
          return minver;
        }
        minver = new SemVer('0.0.0-0');
        if (range.test(minver)) {
          return minver;
        }
        minver = null;
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let setMin = null;
          comparators.forEach(comparator => {
            const compver = new SemVer(comparator.semver.version);
            switch (comparator.operator) {
              case '>':
                if (compver.prerelease.length === 0) {
                  compver.patch++;
                } else {
                  compver.prerelease.push(0);
                }
                compver.raw = compver.format();
              /* fallthrough */
              case '':
              case '>=':
                if (!setMin || gt(compver, setMin)) {
                  setMin = compver;
                }
                break;
              case '<':
              case '<=':
                break;
              /* istanbul ignore next */
              default:
                throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
          });
          if (setMin && (!minver || gt(minver, setMin))) {
            minver = setMin;
          }
        }
        if (minver && range.test(minver)) {
          return minver;
        }
        return null;
      };
      module.exports = minVersion;
    },
  });

  // packages/core/node_modules/semver/ranges/valid.js
  var require_valid2 = __commonJS({
    'packages/core/node_modules/semver/ranges/valid.js'(exports, module) {
      'use strict';
      var Range = require_range();
      var validRange2 = (range, options) => {
        try {
          return new Range(range, options).range || '*';
        } catch (er) {
          return null;
        }
      };
      module.exports = validRange2;
    },
  });

  // packages/core/node_modules/semver/ranges/outside.js
  var require_outside = __commonJS({
    'packages/core/node_modules/semver/ranges/outside.js'(exports, module) {
      'use strict';
      var SemVer = require_semver();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var Range = require_range();
      var satisfies2 = require_satisfies();
      var gt = require_gt();
      var lt = require_lt();
      var lte = require_lte();
      var gte = require_gte();
      var outside = (version, range, hilo, options) => {
        version = new SemVer(version, options);
        range = new Range(range, options);
        let gtfn, ltefn, ltfn, comp, ecomp;
        switch (hilo) {
          case '>':
            gtfn = gt;
            ltefn = lte;
            ltfn = lt;
            comp = '>';
            ecomp = '>=';
            break;
          case '<':
            gtfn = lt;
            ltefn = gte;
            ltfn = gt;
            comp = '<';
            ecomp = '<=';
            break;
          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (satisfies2(version, range, options)) {
          return false;
        }
        for (let i = 0; i < range.set.length; ++i) {
          const comparators = range.set[i];
          let high = null;
          let low = null;
          comparators.forEach(comparator => {
            if (comparator.semver === ANY) {
              comparator = new Comparator('>=0.0.0');
            }
            high = high || comparator;
            low = low || comparator;
            if (gtfn(comparator.semver, high.semver, options)) {
              high = comparator;
            } else if (ltfn(comparator.semver, low.semver, options)) {
              low = comparator;
            }
          });
          if (high.operator === comp || high.operator === ecomp) {
            return false;
          }
          if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
            return false;
          } else if (low.operator === ecomp && ltfn(version, low.semver)) {
            return false;
          }
        }
        return true;
      };
      module.exports = outside;
    },
  });

  // packages/core/node_modules/semver/ranges/gtr.js
  var require_gtr = __commonJS({
    'packages/core/node_modules/semver/ranges/gtr.js'(exports, module) {
      'use strict';
      var outside = require_outside();
      var gtr = (version, range, options) => outside(version, range, '>', options);
      module.exports = gtr;
    },
  });

  // packages/core/node_modules/semver/ranges/ltr.js
  var require_ltr = __commonJS({
    'packages/core/node_modules/semver/ranges/ltr.js'(exports, module) {
      'use strict';
      var outside = require_outside();
      var ltr = (version, range, options) => outside(version, range, '<', options);
      module.exports = ltr;
    },
  });

  // packages/core/node_modules/semver/ranges/intersects.js
  var require_intersects = __commonJS({
    'packages/core/node_modules/semver/ranges/intersects.js'(exports, module) {
      'use strict';
      var Range = require_range();
      var intersects = (r1, r2, options) => {
        r1 = new Range(r1, options);
        r2 = new Range(r2, options);
        return r1.intersects(r2, options);
      };
      module.exports = intersects;
    },
  });

  // packages/core/node_modules/semver/ranges/simplify.js
  var require_simplify = __commonJS({
    'packages/core/node_modules/semver/ranges/simplify.js'(exports, module) {
      'use strict';
      var satisfies2 = require_satisfies();
      var compare = require_compare();
      module.exports = (versions, range, options) => {
        const set = [];
        let first = null;
        let prev = null;
        const v = versions.sort((a, b) => compare(a, b, options));
        for (const version of v) {
          const included = satisfies2(version, range, options);
          if (included) {
            prev = version;
            if (!first) {
              first = version;
            }
          } else {
            if (prev) {
              set.push([first, prev]);
            }
            prev = null;
            first = null;
          }
        }
        if (first) {
          set.push([first, null]);
        }
        const ranges = [];
        for (const [min, max] of set) {
          if (min === max) {
            ranges.push(min);
          } else if (!max && min === v[0]) {
            ranges.push('*');
          } else if (!max) {
            ranges.push(`>=${min}`);
          } else if (min === v[0]) {
            ranges.push(`<=${max}`);
          } else {
            ranges.push(`${min} - ${max}`);
          }
        }
        const simplified = ranges.join(' || ');
        const original = typeof range.raw === 'string' ? range.raw : String(range);
        return simplified.length < original.length ? simplified : range;
      };
    },
  });

  // packages/core/node_modules/semver/ranges/subset.js
  var require_subset = __commonJS({
    'packages/core/node_modules/semver/ranges/subset.js'(exports, module) {
      'use strict';
      var Range = require_range();
      var Comparator = require_comparator();
      var { ANY } = Comparator;
      var satisfies2 = require_satisfies();
      var compare = require_compare();
      var subset = (sub, dom, options = {}) => {
        if (sub === dom) {
          return true;
        }
        sub = new Range(sub, options);
        dom = new Range(dom, options);
        let sawNonNull = false;
        OUTER: for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
        return true;
      };
      var minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')];
      var minimumVersion = [new Comparator('>=0.0.0')];
      var simpleSubset = (sub, dom, options) => {
        if (sub === dom) {
          return true;
        }
        if (sub.length === 1 && sub[0].semver === ANY) {
          if (dom.length === 1 && dom[0].semver === ANY) {
            return true;
          } else if (options.includePrerelease) {
            sub = minimumVersionWithPreRelease;
          } else {
            sub = minimumVersion;
          }
        }
        if (dom.length === 1 && dom[0].semver === ANY) {
          if (options.includePrerelease) {
            return true;
          } else {
            dom = minimumVersion;
          }
        }
        const eqSet = /* @__PURE__ */ new Set();
        let gt, lt;
        for (const c of sub) {
          if (c.operator === '>' || c.operator === '>=') {
            gt = higherGT(gt, c, options);
          } else if (c.operator === '<' || c.operator === '<=') {
            lt = lowerLT(lt, c, options);
          } else {
            eqSet.add(c.semver);
          }
        }
        if (eqSet.size > 1) {
          return null;
        }
        let gtltComp;
        if (gt && lt) {
          gtltComp = compare(gt.semver, lt.semver, options);
          if (gtltComp > 0) {
            return null;
          } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
            return null;
          }
        }
        for (const eq of eqSet) {
          if (gt && !satisfies2(eq, String(gt), options)) {
            return null;
          }
          if (lt && !satisfies2(eq, String(lt), options)) {
            return null;
          }
          for (const c of dom) {
            if (!satisfies2(eq, String(c), options)) {
              return false;
            }
          }
          return true;
        }
        let higher, lower;
        let hasDomLT, hasDomGT;
        let needDomLTPre =
          lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
        let needDomGTPre =
          gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
        if (
          needDomLTPre &&
          needDomLTPre.prerelease.length === 1 &&
          lt.operator === '<' &&
          needDomLTPre.prerelease[0] === 0
        ) {
          needDomLTPre = false;
        }
        for (const c of dom) {
          hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
          hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
          if (gt) {
            if (needDomGTPre) {
              if (
                c.semver.prerelease &&
                c.semver.prerelease.length &&
                c.semver.major === needDomGTPre.major &&
                c.semver.minor === needDomGTPre.minor &&
                c.semver.patch === needDomGTPre.patch
              ) {
                needDomGTPre = false;
              }
            }
            if (c.operator === '>' || c.operator === '>=') {
              higher = higherGT(gt, c, options);
              if (higher === c && higher !== gt) {
                return false;
              }
            } else if (gt.operator === '>=' && !c.test(gt.semver)) {
              return false;
            }
          }
          if (lt) {
            if (needDomLTPre) {
              if (
                c.semver.prerelease &&
                c.semver.prerelease.length &&
                c.semver.major === needDomLTPre.major &&
                c.semver.minor === needDomLTPre.minor &&
                c.semver.patch === needDomLTPre.patch
              ) {
                needDomLTPre = false;
              }
            }
            if (c.operator === '<' || c.operator === '<=') {
              lower = lowerLT(lt, c, options);
              if (lower === c && lower !== lt) {
                return false;
              }
            } else if (lt.operator === '<=' && !c.test(lt.semver)) {
              return false;
            }
          }
          if (!c.operator && (lt || gt) && gtltComp !== 0) {
            return false;
          }
        }
        if (gt && hasDomLT && !lt && gtltComp !== 0) {
          return false;
        }
        if (lt && hasDomGT && !gt && gtltComp !== 0) {
          return false;
        }
        if (needDomGTPre || needDomLTPre) {
          return false;
        }
        return true;
      };
      var higherGT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp > 0 ? a : comp < 0 ? b : b.operator === '>' && a.operator === '>=' ? b : a;
      };
      var lowerLT = (a, b, options) => {
        if (!a) {
          return b;
        }
        const comp = compare(a.semver, b.semver, options);
        return comp < 0 ? a : comp > 0 ? b : b.operator === '<' && a.operator === '<=' ? b : a;
      };
      module.exports = subset;
    },
  });

  // packages/core/node_modules/semver/index.js
  var require_semver2 = __commonJS({
    'packages/core/node_modules/semver/index.js'(exports, module) {
      'use strict';
      var internalRe = require_re();
      var constants = require_constants();
      var SemVer = require_semver();
      var identifiers = require_identifiers();
      var parse = require_parse();
      var valid2 = require_valid();
      var clean = require_clean();
      var inc = require_inc();
      var diff = require_diff();
      var major = require_major();
      var minor = require_minor();
      var patch = require_patch();
      var prerelease = require_prerelease();
      var compare = require_compare();
      var rcompare = require_rcompare();
      var compareLoose = require_compare_loose();
      var compareBuild = require_compare_build();
      var sort = require_sort();
      var rsort = require_rsort();
      var gt = require_gt();
      var lt = require_lt();
      var eq = require_eq();
      var neq = require_neq();
      var gte = require_gte();
      var lte = require_lte();
      var cmp = require_cmp();
      var coerce = require_coerce();
      var truncate = require_truncate();
      var Comparator = require_comparator();
      var Range = require_range();
      var satisfies2 = require_satisfies();
      var toComparators = require_to_comparators();
      var maxSatisfying = require_max_satisfying();
      var minSatisfying = require_min_satisfying();
      var minVersion = require_min_version();
      var validRange2 = require_valid2();
      var outside = require_outside();
      var gtr = require_gtr();
      var ltr = require_ltr();
      var intersects = require_intersects();
      var simplifyRange = require_simplify();
      var subset = require_subset();
      module.exports = {
        parse,
        valid: valid2,
        clean,
        inc,
        diff,
        major,
        minor,
        patch,
        prerelease,
        compare,
        rcompare,
        compareLoose,
        compareBuild,
        sort,
        rsort,
        gt,
        lt,
        eq,
        neq,
        gte,
        lte,
        cmp,
        coerce,
        truncate,
        Comparator,
        Range,
        satisfies: satisfies2,
        toComparators,
        maxSatisfying,
        minSatisfying,
        minVersion,
        validRange: validRange2,
        outside,
        gtr,
        ltr,
        intersects,
        simplifyRange,
        subset,
        SemVer,
        re: internalRe.re,
        src: internalRe.src,
        tokens: internalRe.t,
        SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
        RELEASE_TYPES: constants.RELEASE_TYPES,
        compareIdentifiers: identifiers.compareIdentifiers,
        rcompareIdentifiers: identifiers.rcompareIdentifiers,
      };
    },
  });

  // packages/core/src/validator/index.ts
  var import__ = __toESM(require__());
  var import_ajv_formats = __toESM(require_dist());
  var import_ajv_errors = __toESM(require_dist2());
  var import_json_source_map = __toESM(require_json_source_map());

  // packages/core/src/schemas/domain.schema.json
  var domain_schema_exports = {};
  __export(domain_schema_exports, {
    $id: () => $id,
    $schema: () => $schema,
    additionalProperties: () => additionalProperties,
    default: () => domain_schema_default,
    description: () => description,
    properties: () => properties,
    required: () => required,
    title: () => title,
    type: () => type,
  });
  var $schema = 'https://json-schema.org/draft/2020-12/schema';
  var $id = 'https://origo.design/schemas/v1/domain.schema.json';
  var title = 'Domain';
  var description = 'BADL Domain Definition';
  var type = 'object';
  var properties = {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    version: {
      type: 'string',
    },
    domain: {
      type: 'string',
    },
    entities: {
      type: 'array',
      items: {
        $ref: 'entity.schema.json',
      },
    },
    capabilities: {
      type: 'array',
      items: {
        $ref: 'capability.schema.json',
      },
    },
    contracts: {
      type: 'array',
      items: {
        $ref: 'contract.schema.json',
      },
    },
    extensions: {
      type: 'array',
      items: {
        $ref: 'extension.schema.json',
      },
    },
  };
  var required = ['id', 'name', 'version', 'domain', 'entities'];
  var additionalProperties = false;
  var domain_schema_default = {
    $schema,
    $id,
    title,
    description,
    type,
    properties,
    required,
    additionalProperties,
  };

  // packages/core/src/schemas/entity.schema.json
  var entity_schema_exports = {};
  __export(entity_schema_exports, {
    $defs: () => $defs,
    $id: () => $id2,
    $schema: () => $schema2,
    additionalProperties: () => additionalProperties2,
    default: () => entity_schema_default,
    description: () => description2,
    properties: () => properties2,
    required: () => required2,
    title: () => title2,
    type: () => type2,
  });
  var $schema2 = 'https://json-schema.org/draft/2020-12/schema';
  var $id2 = 'https://origo.design/schemas/v1/entity.schema.json';
  var title2 = 'Entity';
  var description2 = 'BADL Entity Definition';
  var type2 = 'object';
  var $defs = {
    field: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        type: {
          type: 'string',
          enum: ['string', 'boolean', 'date', 'number', 'array', 'object'],
        },
        itemType: {
          type: 'string',
        },
        label: {
          type: 'string',
        },
        references: {
          type: 'string',
        },
        validation: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        metadata_path: {
          type: 'string',
        },
        fields: {
          type: 'array',
          items: {
            $ref: '#/$defs/field',
          },
        },
      },
      required: ['id', 'name', 'type', 'label', 'validation', 'metadata_path'],
      additionalProperties: false,
    },
  };
  var properties2 = {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    implements: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    fields: {
      type: 'array',
      items: {
        $ref: '#/$defs/field',
      },
    },
  };
  var required2 = ['id', 'name', 'fields'];
  var additionalProperties2 = false;
  var entity_schema_default = {
    $schema: $schema2,
    $id: $id2,
    title: title2,
    description: description2,
    type: type2,
    $defs,
    properties: properties2,
    required: required2,
    additionalProperties: additionalProperties2,
  };

  // packages/core/src/schemas/capability.schema.json
  var capability_schema_exports = {};
  __export(capability_schema_exports, {
    $id: () => $id3,
    $schema: () => $schema3,
    additionalProperties: () => additionalProperties3,
    allOf: () => allOf,
    default: () => capability_schema_default,
    description: () => description3,
    properties: () => properties3,
    required: () => required3,
    title: () => title3,
    type: () => type3,
  });
  var $schema3 = 'https://json-schema.org/draft/2020-12/schema';
  var $id3 = 'https://origo.design/schemas/v1/capability.schema.json';
  var title3 = 'Capability';
  var description3 = 'BADL Capability Definition';
  var type3 = 'object';
  var properties3 = {
    id: {
      type: 'string',
      minLength: 1,
    },
    name: {
      type: 'string',
      enum: ['Create', 'Read', 'Update', 'Delete', 'List'],
      description: 'Strict vocabulary of core capability verbs',
    },
    description: {
      type: 'string',
    },
    type: {
      type: 'string',
      enum: ['Command', 'Query'],
    },
    entityId: {
      type: 'string',
      minLength: 1,
      description: 'Target entity for this capability',
    },
    outcome_ref: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    preconditions: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    postconditions: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    permissions: {
      type: 'array',
      items: {
        $ref: 'permission.schema.json',
      },
    },
    risk_level: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical'],
    },
    interaction_contract_ref: {
      type: 'string',
    },
    async: {
      type: 'boolean',
    },
  };
  var required3 = [
    'id',
    'name',
    'description',
    'type',
    'entityId',
    'outcome_ref',
    'preconditions',
    'postconditions',
    'permissions',
    'risk_level',
    'async',
  ];
  var additionalProperties3 = false;
  var allOf = [
    {
      if: {
        properties: {
          name: { enum: ['Create', 'Update', 'Delete'] },
        },
      },
      then: {
        properties: {
          type: { const: 'Command' },
        },
      },
    },
    {
      if: {
        properties: {
          name: { enum: ['Read', 'List'] },
        },
      },
      then: {
        properties: {
          type: { const: 'Query' },
        },
      },
    },
  ];
  var capability_schema_default = {
    $schema: $schema3,
    $id: $id3,
    title: title3,
    description: description3,
    type: type3,
    properties: properties3,
    required: required3,
    additionalProperties: additionalProperties3,
    allOf,
  };

  // packages/core/src/schemas/contract.schema.json
  var contract_schema_exports = {};
  __export(contract_schema_exports, {
    $id: () => $id4,
    $schema: () => $schema4,
    additionalProperties: () => additionalProperties4,
    default: () => contract_schema_default,
    description: () => description4,
    properties: () => properties4,
    required: () => required4,
    title: () => title4,
    type: () => type4,
  });
  var $schema4 = 'https://json-schema.org/draft/2020-12/schema';
  var $id4 = 'https://origo.design/schemas/v1/contract.schema.json';
  var title4 = 'Contract';
  var description4 = 'BADL Contract Definition';
  var type4 = 'object';
  var properties4 = {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    requiredFields: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          type: {
            type: 'string',
            enum: ['string', 'boolean', 'date', 'number', 'array', 'object'],
          },
        },
        required: ['name', 'type'],
        additionalProperties: false,
      },
    },
    requiredCapabilities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            enum: ['Create', 'Read', 'Update', 'Delete', 'List'],
          },
          type: {
            type: 'string',
            enum: ['Command', 'Query'],
          },
        },
        required: ['name', 'type'],
        additionalProperties: false,
      },
    },
  };
  var required4 = ['id', 'name', 'requiredFields', 'requiredCapabilities'];
  var additionalProperties4 = false;
  var contract_schema_default = {
    $schema: $schema4,
    $id: $id4,
    title: title4,
    description: description4,
    type: type4,
    properties: properties4,
    required: required4,
    additionalProperties: additionalProperties4,
  };

  // packages/core/src/schemas/permission.schema.json
  var permission_schema_exports = {};
  __export(permission_schema_exports, {
    $id: () => $id5,
    $schema: () => $schema5,
    additionalProperties: () => additionalProperties5,
    default: () => permission_schema_default,
    description: () => description5,
    properties: () => properties5,
    required: () => required5,
    title: () => title5,
    type: () => type5,
  });
  var $schema5 = 'https://json-schema.org/draft/2020-12/schema';
  var $id5 = 'https://origo.design/schemas/v1/permission.schema.json';
  var title5 = 'Permission';
  var description5 = 'BADL Role-Based Permission Definition';
  var type5 = 'object';
  var properties5 = {
    role: {
      type: 'string',
      description: 'The role required for this permission',
      minLength: 1,
    },
    access: {
      type: 'string',
      enum: ['grant', 'deny'],
      default: 'grant',
    },
  };
  var required5 = ['role'];
  var additionalProperties5 = false;
  var permission_schema_default = {
    $schema: $schema5,
    $id: $id5,
    title: title5,
    description: description5,
    type: type5,
    properties: properties5,
    required: required5,
    additionalProperties: additionalProperties5,
  };

  // packages/core/src/schemas/extension.schema.json
  var extension_schema_exports = {};
  __export(extension_schema_exports, {
    $id: () => $id6,
    $schema: () => $schema6,
    additionalProperties: () => additionalProperties6,
    default: () => extension_schema_default,
    description: () => description6,
    properties: () => properties6,
    required: () => required6,
    title: () => title6,
    type: () => type6,
  });
  var $schema6 = 'https://json-schema.org/draft/2020-12/schema';
  var $id6 = 'https://origo.design/schemas/v1/extension.schema.json';
  var title6 = 'Extension';
  var description6 = 'BADL Extension Definition';
  var type6 = 'object';
  var properties6 = {
    id: {
      type: 'string',
      minLength: 1,
      pattern: '^[a-zA-Z0-9_-]+$',
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    version: {
      type: 'string',
      minLength: 1,
    },
    extension_type: {
      type: 'string',
      minLength: 1,
    },
    implements: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
    plugin_version_range: {
      type: 'string',
      minLength: 1,
    },
  };
  var required6 = ['id', 'name', 'version', 'extension_type', 'implements', 'plugin_version_range'];
  var additionalProperties6 = false;
  var extension_schema_default = {
    $schema: $schema6,
    $id: $id6,
    title: title6,
    description: description6,
    type: type6,
    properties: properties6,
    required: required6,
    additionalProperties: additionalProperties6,
  };

  // packages/core/src/validator/ast-validator.ts
  var semver = __toESM(require_semver2());
  var MAX_AST_DEPTH = 250;
  function validateAST(ast, localManifest) {
    const errors = [];
    if (!ast || !Array.isArray(ast.domains)) {
      errors.push({ type: 'INVALID_FORMAT', message: 'Invalid AST: missing domains array' });
      return errors;
    }
    const entityDomainMap = /* @__PURE__ */ new Map();
    const extensionIds = /* @__PURE__ */ new Set();
    const capabilityIds = /* @__PURE__ */ new Set();
    const contractMap = /* @__PURE__ */ new Map();
    const entityCapabilities = /* @__PURE__ */ new Map();
    for (let dIndex = 0; dIndex < ast.domains.length; dIndex++) {
      const domain = ast.domains[dIndex];
      if (!domain) continue;
      const entities = Array.isArray(domain.entities) ? domain.entities : [];
      for (let eIndex = 0; eIndex < entities.length; eIndex++) {
        const entity = entities[eIndex];
        if (!entity || !entity.id) continue;
        if (entityDomainMap.has(entity.id)) {
          errors.push({
            type: 'DUPLICATE_ID',
            message: `Duplicate entity ID found: ${entity.id}`,
            path: `/domains/${dIndex}/entities/${eIndex}/id`,
          });
        } else {
          entityDomainMap.set(entity.id, domain.id);
        }
      }
      const capabilities = Array.isArray(domain.capabilities) ? domain.capabilities : [];
      for (let cIndex = 0; cIndex < capabilities.length; cIndex++) {
        const capability = capabilities[cIndex];
        if (!capability || !capability.id) {
          errors.push({
            type: 'INVALID_FORMAT',
            message: `Capability missing id in domain ${domain.id}`,
            path: `/domains/${dIndex}/capabilities/${cIndex}`,
          });
          continue;
        }
        if (capabilityIds.has(capability.id)) {
          errors.push({
            type: 'DUPLICATE_ID',
            message: `Duplicate capability ID found: ${capability.id}`,
            path: `/domains/${dIndex}/capabilities/${cIndex}/id`,
          });
          continue;
        } else {
          capabilityIds.add(capability.id);
        }
        if (capability.entityId) {
          const existingCaps = entityCapabilities.get(capability.entityId) || [];
          existingCaps.push(capability);
          entityCapabilities.set(capability.entityId, existingCaps);
        }
      }
      const contracts = Array.isArray(domain.contracts) ? domain.contracts : [];
      for (let cIdx = 0; cIdx < contracts.length; cIdx++) {
        const contract = contracts[cIdx];
        if (!contract || !contract.id) {
          errors.push({
            type: 'INVALID_FORMAT',
            message: 'Contract missing id',
            path: `/domains/${dIndex}/contracts/${cIdx}`,
          });
          continue;
        }
        if (contractMap.has(contract.id)) {
          errors.push({
            type: 'DUPLICATE_ID',
            message: `Duplicate contract ID found: ${contract.id}`,
            path: `/domains/${dIndex}/contracts/${cIdx}/id`,
          });
        } else {
          contractMap.set(contract.id, contract);
        }
      }
      const extensions = Array.isArray(domain.extensions) ? domain.extensions : [];
      for (let eIdx = 0; eIdx < extensions.length; eIdx++) {
        const ext = extensions[eIdx];
        if (!ext || !ext.id) {
          errors.push({
            type: 'INVALID_FORMAT',
            message: 'Extension missing id',
            path: `/domains/${dIndex}/extensions/${eIdx}`,
          });
          continue;
        }
        if (
          contractMap.has(ext.id) ||
          capabilityIds.has(ext.id) ||
          entityDomainMap.has(ext.id) ||
          extensionIds.has(ext.id)
        ) {
          errors.push({
            type: 'DUPLICATE_ID',
            message: `Duplicate ID found across extensions and other types: ${ext.id}`,
            path: `/domains/${dIndex}/extensions/${eIdx}/id`,
          });
        } else {
          extensionIds.add(ext.id);
        }
      }
    }
    const adjList = /* @__PURE__ */ new Map();
    for (let dIndex = 0; dIndex < ast.domains.length; dIndex++) {
      const domain = ast.domains[dIndex];
      if (!domain) continue;
      const entities = Array.isArray(domain.entities) ? domain.entities : [];
      for (let eIndex = 0; eIndex < entities.length; eIndex++) {
        const entity = entities[eIndex];
        if (!entity || !entity.id) continue;
        const dependencies = [];
        const processFields = (fieldList, currentPath, depth = 1) => {
          if (depth > MAX_AST_DEPTH) {
            errors.push({
              type: 'MAX_DEPTH_EXCEEDED',
              message: `Maximum AST depth exceeded (${MAX_AST_DEPTH}) in entity fields for ${entity.id}`,
              path: currentPath,
            });
            return;
          }
          for (let fIndex = 0; fIndex < fieldList.length; fIndex++) {
            const field = fieldList[fIndex];
            if (!field || typeof field !== 'object') continue;
            const fieldPath = `${currentPath}/${fIndex}`;
            if (field.references) {
              if (!entityDomainMap.has(field.references)) {
                errors.push({
                  type: 'MISSING_REFERENCE',
                  message: `Invalid consumption rule: Entity "${field.references}" referenced by field "${field.id}" does not exist`,
                  path: `${fieldPath}/references`,
                });
              } else {
                dependencies.push(field.references);
              }
            }
            if (Array.isArray(field.fields)) {
              processFields(field.fields, `${fieldPath}/fields`, depth + 1);
            }
          }
        };
        const fields = Array.isArray(entity.fields) ? entity.fields : [];
        processFields(fields, `/domains/${dIndex}/entities/${eIndex}/fields`);
        const existingDeps = adjList.get(entity.id) || [];
        adjList.set(entity.id, [...existingDeps, ...dependencies]);
        if (Array.isArray(entity.implements)) {
          for (const contractId of entity.implements) {
            const contract = contractMap.get(contractId);
            if (!contract) {
              errors.push({
                type: 'MISSING_REFERENCE',
                message: `Entity "${entity.id}" implements missing contract "${contractId}"`,
                path: `domains[${dIndex}].entities[${eIndex}].implements`,
              });
              continue;
            }
            if (Array.isArray(contract.requiredFields)) {
              const flattenFields = fieldList => {
                let res = [];
                for (const f of fieldList) {
                  if (!f) continue;
                  res.push(f);
                  if (Array.isArray(f.fields)) {
                    res = res.concat(flattenFields(f.fields));
                  }
                }
                return res;
              };
              const allEntityFields = flattenFields(entity.fields || []);
              for (const reqField of contract.requiredFields) {
                if (!reqField || typeof reqField !== 'object' || !reqField.name) continue;
                const entityField = allEntityFields.find(f => f.name === reqField.name);
                if (!entityField) {
                  errors.push({
                    type: 'CONTRACT_BREACH',
                    message: `Entity "${entity.id}" missing required field "${reqField.name}" for contract "${contract.id}"`,
                    path: `/domains/${dIndex}/entities/${eIndex}/implements`,
                  });
                } else if (entityField.type !== reqField.type) {
                  errors.push({
                    type: 'CONTRACT_BREACH',
                    message: `Entity "${entity.id}" field "${reqField.name}" has type "${entityField.type}" but contract "${contract.id}" requires "${reqField.type}"`,
                    path: `/domains/${dIndex}/entities/${eIndex}/fields`,
                  });
                }
              }
            }
            if (Array.isArray(contract.requiredCapabilities)) {
              const caps = entityCapabilities.get(entity.id) || [];
              for (const reqCap of contract.requiredCapabilities) {
                if (!reqCap || typeof reqCap !== 'object' || !reqCap.name || !reqCap.type) continue;
                const hasCap = caps.some(c => c.name === reqCap.name && c.type === reqCap.type);
                if (!hasCap) {
                  errors.push({
                    type: 'CONTRACT_BREACH',
                    message: `Entity "${entity.id}" missing required capability "${reqCap.name}" (${reqCap.type}) for contract "${contract.id}"`,
                    path: `/domains/${dIndex}/entities/${eIndex}/implements`,
                  });
                }
              }
            }
          }
        }
      }
      const capabilities = Array.isArray(domain.capabilities) ? domain.capabilities : [];
      for (let cIndex = 0; cIndex < capabilities.length; cIndex++) {
        const capability = capabilities[cIndex];
        if (!capability || !capability.id) continue;
        const capPath = `/domains/${dIndex}/capabilities/${cIndex}`;
        if (!capability.entityId) {
          errors.push({
            type: 'MISSING_REFERENCE',
            message: `Capability missing entityId: ${capability.id}`,
            path: `${capPath}/entityId`,
          });
          continue;
        }
        const targetDomainId = entityDomainMap.get(capability.entityId);
        if (!targetDomainId) {
          errors.push({
            type: 'MISSING_REFERENCE',
            message: `Invalid capability reference: Entity "${capability.entityId}" referenced by capability "${capability.id}" does not exist`,
            path: `${capPath}/entityId`,
          });
        }
        if (
          !capability.permissions ||
          !Array.isArray(capability.permissions) ||
          capability.permissions.length === 0
        ) {
          errors.push({
            type: 'UNSECURED_CAPABILITY',
            message: `Capability "${capability.id}" is unsecured. Fail-closed policy requires at least one permission.`,
            path: `${capPath}/permissions`,
          });
        } else {
          for (let pIndex = 0; pIndex < capability.permissions.length; pIndex++) {
            const perm = capability.permissions[pIndex];
            if (
              !perm ||
              typeof perm !== 'object' ||
              !perm.role ||
              typeof perm.role !== 'string' ||
              perm.role.trim() === ''
            ) {
              errors.push({
                type: 'INVALID_PERMISSION',
                message: `Capability "${capability.id}" has an invalid permission definition. Role is required.`,
                path: `${capPath}/permissions/${pIndex}`,
              });
            } else {
              perm.role = perm.role.trim();
              if (perm.access === void 0) {
                perm.access = 'grant';
              }
              if (perm.access !== 'grant' && perm.access !== 'deny') {
                errors.push({
                  type: 'INVALID_PERMISSION',
                  message: `Capability "${capability.id}" has an invalid access definition. Must be "grant" or "deny".`,
                  path: `${capPath}/permissions/${pIndex}/access`,
                });
              }
            }
          }
        }
      }
      const extensions = Array.isArray(domain.extensions) ? domain.extensions : [];
      for (let eIndex = 0; eIndex < extensions.length; eIndex++) {
        const ext = extensions[eIndex];
        if (!ext || !ext.id) continue;
        const extPath = `/domains/${dIndex}/extensions/${eIndex}`;
        if (!Array.isArray(ext.implements) || ext.implements.length === 0) {
          errors.push({
            type: 'MISSING_REFERENCE',
            message: `Extension missing implements contract reference: ${ext.id}`,
            path: `${extPath}/implements`,
          });
        } else {
          for (const imp of ext.implements) {
            if (!contractMap.has(imp)) {
              errors.push({
                type: 'MISSING_REFERENCE',
                message: `Invalid extension reference: Contract "${imp}" referenced by extension "${ext.id}" does not exist`,
                path: `${extPath}/implements`,
              });
            }
          }
        }
        if (localManifest && ext.name && ext.plugin_version_range) {
          const localVersion = localManifest[ext.name];
          if (!localVersion) {
            errors.push({
              type: 'MISSING_MANIFEST_VERSION',
              message: `Local manifest is missing version for extension "${ext.name}"`,
              path: `${extPath}/name`,
            });
          } else if (!semver.valid(localVersion) || !semver.validRange(ext.plugin_version_range)) {
            errors.push({
              type: 'VERSION_MISMATCH',
              message: `Invalid semver format for extension "${ext.name}"`,
              path: `${extPath}/plugin_version_range`,
            });
          } else if (!semver.satisfies(localVersion, ext.plugin_version_range)) {
            errors.push({
              type: 'VERSION_MISMATCH',
              message: `Extension "${ext.name}" requires plugin version "${ext.plugin_version_range}" but local manifest provides "${localVersion}"`,
              path: `${extPath}/plugin_version_range`,
            });
          }
        }
      }
    }
    const visited = /* @__PURE__ */ new Set();
    const visiting = /* @__PURE__ */ new Set();
    function dfs(nodeId, path, depth) {
      if (depth > MAX_AST_DEPTH) {
        errors.push({
          type: 'MAX_DEPTH_EXCEEDED',
          message: `Maximum AST depth exceeded (${MAX_AST_DEPTH}) at entity ${nodeId}`,
          path: [...path, nodeId].join(' -> '),
        });
        return;
      }
      if (visiting.has(nodeId)) {
        const cycleStartIndex = path.indexOf(nodeId);
        const loop = cycleStartIndex >= 0 ? path.slice(cycleStartIndex) : path;
        const cyclePath = [...loop, nodeId].join(' -> ');
        errors.push({
          type: 'CIRCULAR_REFERENCE',
          message: `Circular dependency detected: ${cyclePath}`,
          path: cyclePath,
        });
        return;
      }
      if (visited.has(nodeId)) {
        return;
      }
      visiting.add(nodeId);
      path.push(nodeId);
      const deps = adjList.get(nodeId) || [];
      for (const dep of deps) {
        dfs(dep, path, depth + 1);
      }
      path.pop();
      visiting.delete(nodeId);
      visited.add(nodeId);
    }
    for (const entityId of entityDomainMap.keys()) {
      if (!visited.has(entityId)) {
        dfs(entityId, [], 1);
      }
    }
    return errors;
  }

  // packages/core/src/validator/index.ts
  var BADLValidator = class {
    ajv;
    errors = null;
    constructor() {
      this.ajv = new import__.default({
        allErrors: true,
        strict: true,
      });
      (0, import_ajv_formats.default)(this.ajv);
      (0, import_ajv_errors.default)(this.ajv);
      const resolvedEntitySchema = entity_schema_default ?? entity_schema_exports;
      const resolvedDomainSchema = domain_schema_default ?? domain_schema_exports;
      const resolvedCapabilitySchema = capability_schema_default ?? capability_schema_exports;
      const resolvedPermissionSchema = permission_schema_default ?? permission_schema_exports;
      const resolvedContractSchema = contract_schema_default ?? contract_schema_exports;
      const resolvedExtensionSchema = extension_schema_default ?? extension_schema_exports;
      this.ajv.addSchema(
        resolvedCapabilitySchema,
        'https://origo.design/schemas/v1/capability.schema.json'
      );
      this.ajv.addSchema(
        resolvedContractSchema,
        'https://origo.design/schemas/v1/contract.schema.json'
      );
      this.ajv.addSchema(
        resolvedPermissionSchema,
        'https://origo.design/schemas/v1/permission.schema.json'
      );
      this.ajv.addSchema(
        resolvedExtensionSchema,
        'https://origo.design/schemas/v1/extension.schema.json'
      );
      this.ajv.addSchema(
        resolvedEntitySchema,
        'https://origo.design/schemas/v1/entity.schema.json'
      );
      this.ajv.addSchema(
        resolvedDomainSchema,
        'https://origo.design/schemas/v1/domain.schema.json'
      );
    }
    checkCircularDependency(obj, currentDepth, maxDepth, visited) {
      if (currentDepth > maxDepth) {
        throw new Error('Maximum depth exceeded. Possible circular dependency detected.');
      }
      if (obj && typeof obj === 'object') {
        if (visited.has(obj)) {
          throw new Error('Maximum depth exceeded. Possible circular dependency detected.');
        }
        visited.add(obj);
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            this.checkCircularDependency(obj[key], currentDepth + 1, maxDepth, visited);
          }
        }
        visited.delete(obj);
      }
    }
    runValidation(schemaUrl, data, options = {}) {
      this.errors = null;
      let parsedData = data;
      let sourceMapPointers;
      if (typeof data === 'string') {
        try {
          const parsed = (0, import_json_source_map.parse)(data);
          parsedData = parsed.data;
          sourceMapPointers = parsed.pointers;
        } catch (err) {
          let line;
          let column;
          if (err && typeof err === 'object') {
            const errMsg = err.message || '';
            const match = /line (\d+) column (\d+)/.exec(errMsg);
            if (match) {
              line = parseInt(match[1], 10);
              column = parseInt(match[2], 10);
            }
          }
          this.errors = [
            {
              keyword: 'parse',
              message: err?.message || 'Invalid JSON string',
              instancePath: '',
              schemaPath: '',
              params: {},
              code: 'parse',
              context: { line, column },
            },
          ];
          return false;
        }
      }
      if (typeof options.maxDepth === 'number' && options.maxDepth < 0) {
        throw new Error('maxDepth must be >= 0');
      }
      const maxDepth = options.maxDepth ?? 100;
      this.checkCircularDependency(parsedData, 0, maxDepth, /* @__PURE__ */ new Set());
      const validate = this.ajv.getSchema(schemaUrl);
      if (!validate) {
        throw new Error(`Schema not found: ${schemaUrl}`);
      }
      const isValid = validate(parsedData);
      if (!isValid && validate.errors) {
        this.errors = validate.errors.map(err => {
          const newErr = { ...err, code: err.keyword };
          if (sourceMapPointers) {
            const decodedPath = (err.instancePath ?? '').replace(/~1/g, '/').replace(/~0/g, '~');
            let lookupPath = decodedPath;
            if (err.keyword === 'additionalProperties' && err.params['additionalProperty']) {
              const additionalProperty = err.params['additionalProperty'];
              const additionalPath = `${decodedPath === '' ? '' : decodedPath}/${additionalProperty.replace(/~/g, '~0').replace(/\//g, '~1')}`;
              if (sourceMapPointers[additionalPath]) {
                lookupPath = additionalPath;
              }
            }
            if (sourceMapPointers[lookupPath] !== void 0) {
              const pointer = sourceMapPointers[lookupPath];
              const loc = pointer.key || pointer.value;
              if (loc != null) {
                newErr.context = {
                  line: loc.line + 1,
                  column: loc.column + 1,
                };
              }
            }
          }
          return newErr;
        });
      } else {
        this.errors = null;
      }
      return isValid;
    }
    validateDomain(data, options = {}) {
      return this.runValidation(
        'https://origo.design/schemas/v1/domain.schema.json',
        data,
        options
      );
    }
    validateEntity(data, options = {}) {
      return this.runValidation(
        'https://origo.design/schemas/v1/entity.schema.json',
        data,
        options
      );
    }
  };

  // packages/core/src/schemas/__fixtures__/target-page.json
  var target_page_default = {
    id: 'page-user-management',
    name: 'User Management Page',
    version: '1.0.0',
    domain: 'User Management',
    entities: [
      {
        id: 'entity-user',
        name: 'User',
        fields: [
          {
            id: 'field-user-id',
            name: 'id',
            type: 'string',
            label: 'User ID',
            validation: ['required', 'uuid'],
            metadata_path: 'User.id',
          },
          {
            id: 'field-user-username',
            name: 'username',
            type: 'string',
            label: 'Username',
            validation: ['required', 'minLength:3', 'maxLength:50'],
            metadata_path: 'User.username',
          },
          {
            id: 'field-user-email',
            name: 'email',
            type: 'string',
            label: 'Email Address',
            validation: ['required', 'email'],
            metadata_path: 'User.email',
          },
          {
            id: 'field-user-isActive',
            name: 'isActive',
            type: 'boolean',
            label: 'Active Status',
            validation: ['required'],
            metadata_path: 'User.isActive',
          },
          {
            id: 'field-user-createdAt',
            name: 'createdAt',
            type: 'date',
            label: 'Creation Date',
            validation: ['required'],
            metadata_path: 'User.createdAt',
          },
          {
            id: 'field-user-roleId',
            name: 'roleId',
            type: 'string',
            label: 'Role ID',
            references: 'entity-role',
            validation: ['required'],
            metadata_path: 'User.roleId',
          },
          {
            id: 'field-user-departmentId',
            name: 'departmentId',
            type: 'string',
            label: 'Department ID',
            references: 'entity-department',
            validation: ['uuid'],
            metadata_path: 'User.departmentId',
          },
        ],
      },
      {
        id: 'entity-role',
        name: 'Role',
        fields: [
          {
            id: 'field-role-id',
            name: 'id',
            type: 'string',
            label: 'Role ID',
            validation: ['required', 'uuid'],
            metadata_path: 'Role.id',
          },
          {
            id: 'field-role-name',
            name: 'name',
            type: 'string',
            label: 'Role Name',
            validation: ['required'],
            metadata_path: 'Role.name',
          },
          {
            id: 'field-role-permissions',
            name: 'permissions',
            type: 'array',
            itemType: 'string',
            label: 'Permissions',
            validation: [],
            metadata_path: 'Role.permissions',
          },
        ],
      },
      {
        id: 'entity-department',
        name: 'Department',
        fields: [
          {
            id: 'field-department-id',
            name: 'id',
            type: 'string',
            label: 'Department ID',
            validation: ['required', 'uuid'],
            metadata_path: 'Department.id',
          },
          {
            id: 'field-department-name',
            name: 'name',
            type: 'string',
            label: 'Department Name',
            validation: ['required'],
            metadata_path: 'Department.name',
          },
        ],
      },
    ],
    capabilities: [
      {
        id: 'cap-user-create',
        name: 'Create',
        description: 'Create a User',
        type: 'Command',
        entityId: 'entity-user',
        outcome_ref: ['outcome-1'],
        preconditions: ['pre-1'],
        postconditions: ['post-1'],
        permissions: [{ role: 'perm-1' }],
        risk_level: 'medium',
        async: false,
      },
      {
        id: 'cap-user-read',
        name: 'Read',
        description: 'Read a User',
        type: 'Query',
        entityId: 'entity-user',
        outcome_ref: [],
        preconditions: [],
        postconditions: [],
        permissions: [{ role: 'admin' }],
        risk_level: 'low',
        interaction_contract_ref: 'ref',
        async: true,
      },
      {
        id: 'cap-user-update',
        name: 'Update',
        description: 'Update a User',
        type: 'Command',
        entityId: 'entity-user',
        outcome_ref: [],
        preconditions: [],
        postconditions: [],
        permissions: [{ role: 'admin' }],
        risk_level: 'high',
        async: false,
      },
      {
        id: 'cap-user-delete',
        name: 'Delete',
        description: 'Delete a User',
        type: 'Command',
        entityId: 'entity-user',
        outcome_ref: [],
        preconditions: [],
        postconditions: [],
        permissions: [{ role: 'admin' }],
        risk_level: 'critical',
        async: false,
      },
      {
        id: 'cap-user-list',
        name: 'List',
        description: 'List Users',
        type: 'Query',
        entityId: 'entity-user',
        outcome_ref: [],
        preconditions: [],
        postconditions: [],
        permissions: [{ role: 'admin' }],
        risk_level: 'low',
        interaction_contract_ref: 'ref',
        async: false,
      },
      {
        id: 'cap-role-list',
        name: 'List',
        description: 'List Roles',
        type: 'Query',
        entityId: 'entity-role',
        outcome_ref: [],
        preconditions: [],
        postconditions: [],
        permissions: [{ role: 'admin' }],
        risk_level: 'low',
        interaction_contract_ref: 'ref',
        async: false,
      },
      {
        id: 'cap-department-list',
        name: 'List',
        description: 'List Departments',
        type: 'Query',
        entityId: 'entity-department',
        outcome_ref: [],
        preconditions: [],
        postconditions: [],
        permissions: [{ role: 'admin' }],
        risk_level: 'low',
        interaction_contract_ref: 'ref',
        async: false,
      },
    ],
  };

  // tools/spikes/epic7-worker-csp/worker.js
  try {
    const rawJson = JSON.stringify(target_page_default);
    const validator = new BADLValidator();
    const domainObj =
      typeof target_page_default === 'string'
        ? JSON.parse(target_page_default)
        : target_page_default;
    const canonicalAst = {
      schemaVersion: '1.0.0',
      domains: [domainObj],
    };
    const isDomainValid = validator.validateDomain(rawJson);
    const validatorErrors = validator.errors;
    const astErrors = validateAST(canonicalAst);
    const isPassed = isDomainValid && Array.isArray(astErrors) && astErrors.length === 0;
    self.postMessage({
      status: isPassed ? 'success' : 'validation_failed',
      validatorErrors,
      astErrors,
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({
      status: 'error',
      error: errorMessage,
    });
  }
})();
