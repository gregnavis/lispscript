;(function (window, undefined) {
  "use strict";

  // Returns a DOM node representing a given value.
  function domify(value) {
    if (typeof value === 'number') {
      return '<span class="number">' + value + '</span>';
    } else if (typeof value === 'string') {
      return '<span class="symbol">' + value + '</span>';
    } else if (value.constructor === Array) {
      return '<span class="paren">(</span>' + value.map(domify).join(' ') + '<span class="paren">)</span>';
    }

    throw "Cannot DOMify " + value;
  }

  window.onload = function () {
    var input = document.getElementById("input");
    var output = document.getElementById("output");

    input.addEventListener('keydown', function (e) {
      if (e.keyCode !== 13) {
        return;
      }
      var result = lispscript.rootEval(lispscript.read(input.value));
      output.innerHTML = domify(result);
    });
  };
})(window);
