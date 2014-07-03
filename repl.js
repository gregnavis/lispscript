;(function (window, undefined) {
  "use strict";

  var document = window.document;

  // Returns a DOM node representing a given value.
  function domify(value) {
    if (typeof value === 'number') {
      return '<span class="number">' + value + '</span>';
    } else if (typeof value === 'string') {
      return '<span class="symbol">' + value + '</span>';
    } else if (value.constructor === Array) {
      return '<span class="paren">(</span>' + value.map(domify).join(' ') + '<span class="paren">)</span>';
    } else if (value.constructor === Function) {
      return '<span class="function">Function</span>'
    }

    throw "Cannot DOMify " + value;
  }

  window.onload = function () {
    var input = document.getElementById('input');
    var repl = document.getElementById('repl');

    input.addEventListener('keydown', function (e) {
      if (e.keyCode !== 13) {
        return;
      }

      try {
        var result = lispscript.rootEval(lispscript.read(input.value));
      } catch(e) {
        result = '<span class="error">An unhandled exception occured</span>';
      }

      var li = document.createElement('li');
      var inputDiv = document.createElement('div');
      inputDiv.textContent = input.value;
      li.appendChild(inputDiv);
      var outputDiv = document.createElement('div');
      outputDiv.innerHTML = domify(result);
      li.appendChild(outputDiv);

      repl.insertBefore(li, input.parentNode);
      input.value = '';

      e.preventDefault();
    });
  };
})(window);
