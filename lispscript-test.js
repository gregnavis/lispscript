;(function (window, undefined) {
  var lispscript = window.lispscript;
  var read = lispscript.read;

  QUnit.test('reader reads numbers', function (assert) {
    assert.strictEqual(read('2'), 2);
    assert.strictEqual(read('2.1'), 2.1);
    assert.strictEqual(read('-2'), -2);
    assert.strictEqual(read('-1.3'), -1.3);
    assert.strictEqual(read('0'), 0);
    assert.strictEqual(read('0'), 0);
  });

  QUnit.test('reader reads symbols', function (assert) {
    assert.strictEqual(read('a-symbol'), 'a-symbol');
    assert.strictEqual(read('exclamation-marks-are-ok!'), 'exclamation-marks-are-ok!');
    assert.strictEqual(read('so-are-question-marks?'), 'so-are-question-marks?');
    assert.strictEqual(read('+'), '+');
    assert.strictEqual(read('-'), '-');
    assert.strictEqual(read('*'), '*');
    assert.strictEqual(read('/'), '/');
  });

  QUnit.test('reader reads lists', function (assert) {
    assert.deepEqual(read('()'), []);
    assert.deepEqual(read('(1)'), [1]);
    assert.deepEqual(read('((1))'), [[1]]);
    assert.deepEqual(read('((1) 2)'), [[1], 2]);
    assert.deepEqual(read('((1) symbol)'), [[1], 'symbol']);
    assert.deepEqual(read('((1) symbol (2))'), [[1], 'symbol', [2]]);
    assert.deepEqual(read('(/ 4 2)'), ['/', 4, 2]);
  });
})(window);
