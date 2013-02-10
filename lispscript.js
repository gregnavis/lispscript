function Symbol(name) {
  this.name = name
}

function Reader(input) {
  this.input = input
  this.offset = 0
}

Reader.prototype.advance = function (offset) {
  this.offset += offset
  this.input = this.input.substr(offset)
}

Reader.prototype.consumeWhitespace = function () {
  var match = /^(\s+)/.exec(this.input)
  if (match) {
    this.advance(match[1].length)
  }
}

Reader.prototype.readInteger = function () {
  var match = /^((?:-|\+)?\d+)/.exec(this.input)
  if (match) {
    this.advance(match[1].length)
    return parseInt(match[1])
  }
}

Reader.prototype.readString = function () {
  var match = /^"(.*?)"/.exec(this.input)
  if (match) {
    this.advance(2 + match[1].length)
    return match[1]
  }
}

Reader.prototype.readString = function () {
  var match = /^"(.*?)"/.exec(this.input)
  if (match) {
    this.advance(2 + match[1].length)
    return match[1]
  }
}

Reader.prototype.readSymbol = function () {
  var match = /^(\w+)/.exec(this.input)
  if (match) {
    this.advance(match[1].length)
    return new Symbol(match[1])
  }
}

Reader.prototype.readList = function () {
  if ('(' !== this.input[0]) {
    return
  }

  this.advance(1)

  var result = []

  while (true) {
    var object = this.read()
    if (undefined === object) {
      if (')' === this.input[0]) {
        this.advance(1)
        return result
      }
      return
    }
    this.consumeWhitespace()

    result.push(object)
  }
}

Reader.prototype.read = function () {
  var readers = [
    'readInteger',
    'readString',
    'readSymbol',
    'readList'
  ]

  this.consumeWhitespace()

  for (var i in readers) {
    var reader = readers[i]
    var result = this[reader]()
    if (undefined !== result) {
      return result
    }
  }

  this.consumeWhitespace()
}

exports.Symbol = Symbol
exports.Reader = Reader
