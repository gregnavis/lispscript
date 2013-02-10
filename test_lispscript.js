var lispscript = require('./lispscript');

function read(input) {
  return (new lispscript.Reader(input)).read()
}

exports.testReadOnIntegers = function (test) {
  test.strictEqual(read('0'), 0)
  test.strictEqual(read('1'), 1)
  test.strictEqual(read('-10'), -10)
  test.done()
}

exports.testReadOnStrings = function (test) {
  test.strictEqual(read('"foobar"'), 'foobar')
  test.strictEqual(read('""'), '')
  test.done()
}

exports.testReadOnSymbols = function (test) {
  test.deepEqual(read('foobar'), new lispscript.Symbol('foobar'))
  test.done()
}

exports.testReadOnLists = function (test) {
  test.deepEqual(read('()'), [])
  test.deepEqual(read('(1)'), [1])
  test.deepEqual(read('(1 2)'), [1, 2])
  test.deepEqual(read('(1 2 "foo")'), [1, 2, 'foo'])
  test.deepEqual(read('(1 "foo" bar)'), [1, "foo", new lispscript.Symbol('bar')])
  test.deepEqual(read('((1 2) 3)'), [[1, 2], 3])
  test.done()
}
