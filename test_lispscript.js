var lispscript = require('./lispscript');

exports.Reader = {
  read: {
    setUp: function (callback) {
      this.read = function (input) {
        return (new lispscript.Reader(input)).read()
      }
      callback()
    },

    'integers': function (test) {
      test.strictEqual(this.read('0'), 0)
      test.strictEqual(this.read('1'), 1)
      test.strictEqual(this.read('-10'), -10)
      test.done()
    },

    'strings': function (test) {
      test.strictEqual(this.read('"foobar"'), 'foobar')
      test.strictEqual(this.read('""'), '')
      test.done()
    },

    'symbols': function (test) {
      test.deepEqual(this.read('foobar'), new lispscript.Symbol('foobar'))
      test.done()
    },

    'lists': function (test) {
      test.deepEqual(this.read('()'), [])
      test.deepEqual(this.read('(1)'), [1])
      test.deepEqual(this.read('(1 2)'), [1, 2])
      test.deepEqual(this.read('(1 2 "foo")'), [1, 2, 'foo'])
      test.deepEqual(this.read('(1 "foo" bar)'), [1, "foo", new lispscript.Symbol('bar')])
      test.deepEqual(this.read('((1 2) 3)'), [[1, 2], 3])
      test.done()
    },
  }
}

exports.environment = {
  setUp: function (callback) {
    this.environment = new lispscript.Environment()
    this.nameSymbol = new lispscript.Symbol('name')
    this.environment.set(this.nameSymbol, 'value')
    callback()
  },

  set: {
    'creates variables': function (test) {
      test.strictEqual(this.environment.get(this.nameSymbol), 'value')
      test.done()
    },

    'modifies existing variables': function (test) {
      this.environment.set(this.nameSymbol, 'new value')
      test.strictEqual(this.environment.get(this.nameSymbol), 'new value')
      test.done()
    }
  },

  get: {
    'is recursive': function (test) {
      var environment = new lispscript.Environment(this.environment)
      test.strictEqual(environment.get(this.nameSymbol), 'value')
      test.done()
    },

    'throws on undefined variables': function (test) {
      var undefinedNameSymbol = new lispscript.Symbol('undefined-name')
      test.throws(function () { that.environment.get(undefinedNameSymbol) })
      test.done()
    }
  }
}
