;(function (window, undefined) {
  "use strict";

  // The LispScript namespace.
  var lispscript = {};
  window.lispscript = lispscript;

  // Contexts
  // ========

  // An evaulation context that maps variable names (symbols) to values.
  function Context(values, parent) {
    this.values = values || {};
    this.parent = parent;
  }

  // Return the value of a variable.
  Context.prototype.get = function (name) {
    // Return the value from the current context if it's defined.
    if (this.values.hasOwnProperty(name)) {
      return this.values[name];
    }

    // Return the value from the parent context if we're in a non-root context.
    if (this.parent !== undefined) {
      return this.parent.get(name);
    }

    // No context contains the variable.
    throw '"' + name + '" is undefined';
  }

  // Set the variable in the current context.
  Context.prototype.set = function (name, value) {
    this.values[name] = value;
  }

  lispscript.Context = Context;

  // Reader
  // ======

  // Returns a procedure that reads a particular data type.
  function makeReader(regexp, constructor) {
    // A reader accepts a string, the input to read, and returns a pair
    // consisting of the value read and the remaining input. If a given
    // type cannot be read then `undefined` is returned.
    return function reader(string) {
      var consumption = consume(regexp, string);
      if (consumption !== undefined) {
        return [constructor(consumption[0]), consumption[1].trimLeft()];
      }
    }
  }

  // A number reader.
  var readNumber = makeReader('[-+]?\\d+(?:\\.\\d+)?', function (string) {
    return parseFloat(string, 10);
  });

  // A symbol reader.
  var readSymbol = makeReader('[\\w]+', function (string) {
    return string;
  });

  // A list reader.
  function readList(string) {
    // If it doesn't start with a `(` the it's not a list.
    var consumption = consume('\\(', string);
    if (consumption === undefined) {
      return;
    }

    // The input with '(` removed.
    var string = consumption[1];

    // The list items.
    var list = [];

    // Process elements until the closing `)` is found.
    while (string[0] !== ')') {
      var result = _read(string);
      list.push(result[0]);
      string = result[1];
    }

    return [list, string.substr(1).trimLeft()];
  }

  // Return the value read from a string.
  function _read(string) {
    // Currently only numbers, symbols and lists are supported.
    var readers = [readNumber, readSymbol, readList];

    // Try finding a reader that works.
    for (var i = 0; i < readers.length; i++) {
      var result = readers[i](string);
      if (result !== undefined) {
        return result;
      }
    }
  }

  // A reader that throws on errors.
  function read(string) {
    var result = _read(string);

    // Raise an exception if nothing can be read.
    if (result === undefined) {
      throw 'Cannot read "' + string + '"';
    }

    // Raise an exception if there were mutliple objects to read from `string`.
    if (result[1].length > 0) {
      throw 'Cannot read multiple unexpected values';
    }

    return result[0];
  }

  lispscript.read = read;

  // Evaluation
  // ==========

  // Return the result of evaluating an object in the given context.
  function _eval(value, context) {
    // Numbers evaluate to themselves.
    if (typeof value === 'number') {
      return value;

    // Similarly strings.
    } else if (typeof value === 'string') {
      return context.get(value);

    // Arrays are either function calls, variable definitions or function
    // definitions.
    } else if (value.constructor === Array) {
      switch (value[0]) {
      case 'define':
        if (value.length != 3) {
          throw 'Invalid define';
        }
        var evalValue = _eval(value[2], context);
        context.set(value[1], evalValue);
        return evalValue;

      case 'lambda':
        // `args` is a list of argument names.
        var args = value[1];

        // `body` is a list of instructions comprising the body of the function.
        var body = value.slice(2);

        return makeProcedure(args, body, context);

      case 'quote':
        if (value.length != 2) {
          throw 'quote takes exactly one argument';
        }
        return value[1];

      default:
        var values = value.map(function (subvalue) {
          return _eval(subvalue, context);
        });
        var procedure = values.shift();
        return procedure.apply(undefined, values);
      }
    }

    throw "Unknown value type";
  }

  // Evaluate a sequence of values in the given context and return the last
  // result.
  function multiEval(values, context) {
    for (var i = 0; i < values.length; i++) {
      var result = _eval(values[i], context);
    }
    return result;
  }

  // Built-ins
  // =========

  // Return the total of all arguments.
  function add() {
    var result = 0;
    for (var i = 0; i < arguments.length; i++) {
      result += arguments[i];
    }
    return result;
  }

  // Return the difference of the first argument and the remaining arguments.
  function sub() {
    var result = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      result -= arguments[i];
    }
    return result;
  }

  // Return the product of all arguments.
  function mul() {
    var result = 0;
    for (var i = 0; i < arguments.length; i++) {
      result *= arguments[i];
    }
    return result;
  }

  // Return the quotient of the first argument by the remaining arguments.
  function div() {
    var result = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      result /= arguments[i];
    }
    return result;
  }

  // Root context
  // ============

  // The root context exposes built-in procedures to all LispScript programs.
  var rootContext = new Context({
    '+': add,
    '-': sub,
    '*': mul,
    '/': div
  });

  // Return the result of evaluation in the root context.
  function rootEval(value) {
    return _eval(value, rootContext);
  }

  lispscript.rootContext = rootContext;
  lispscript.rootEval = rootEval;

  // Helpers
  // =======

  // Returns a procedure with the specified parameters, body and evaluation
  // context.
  function makeProcedure(parameters, body, context) {
    return function () {
      // The context in which the procedure body is evaluated.
      var bodyContext = new Context({}, context);

      // Turn the arguments specified in the function call into variables
      // available in the body evaluation context.
      for (var i = 0; i < parameters.length; i++) {
        bodyContext.set(parameters[i], arguments[i]);
      }

      // Evaluate all statements in the procedure body and return the result of
      // the last one.
      return multiEval(body, bodyContext);
    }
  } 

  // Return a regular expression match at the beginning of the string or
  // `undefined` if no match is found.
  function matchStart(regexp, string) {
    var regexpObject = new RegExp('^' + regexp + '\\b');
    var match = regexpObject.exec(string);
    if (match !== null) {
      return match[0];
    }
  }

  // Return a regular expression match at the beginning of the string and the
  // string after removing the match.
  function consume(regexp, string) {
    var match = matchStart(regexp, string);
    if (match !== undefined) {
      return [match, string.substr(match.length)]
    }
  }
})(window);
