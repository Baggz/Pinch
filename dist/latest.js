(function() {

  /**
   * IsRegEx
   *
   * @param {object} input
   */
  var isRegEx = function(input) {
    return input && input.test && input.exec;
  };

  /**
   * IsArray
   *
   * @param {object} input
   */
  var isArray = function(input) {
    return Object.prototype.toString.call(input) === '[object Array]';
  };

  /**
   * IsObject
   *
   * @param {object} input
   */
  var isObject = function(input) {
    return Object.prototype.toString.call(input) === '[object Object]';
  };

  /**
   * IsEqualArray
   *
   * @param {object} arr1
   * @param {object} arr2
   */
  var isEqualArray = function(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every(function(value, index, context) {
      return arr2[index] === value;
    });
  };

  /**
   * Each
   *
   * @param {object} input
   * @param {function} iterator
   * @param {object} context
   */
  var each = function(input, iterator, context) {
    var key, len;
    if (isArray(input)) {
      for (key = 0, len = input.length; key < len; key++) {
        iterator.apply(context, [key, input[key], input]);
      }
      return;
    }
    for (key in input) {
      if (input.hasOwnProperty(key)) {
        iterator.apply(context, [key, input[key], input]);
      }
    }
  };

  /**
   * ParseNotation
   *
   * @param {string} notation
   */
  var parseNotation = function(notation) {

    var chunks = [];
    var openBracket = false;
    var i = 0;
    var len = notation.length;
    var tempChunk = '';

    var addChunk = function() {
      if (tempChunk) {
        chunks.push(tempChunk);
        tempChunk = '';
      }
    };

    for (; i < len; i++) {
      if (notation[i].match(/\[|\]/)) {
        addChunk();
        if (notation[i] === ']') {
          openBracket = false;
        } else {
          openBracket = true;
        }
      } else if (notation[i] !== '"' && notation[i] !== '\'') {
        if (notation[i] === '.' && !openBracket) {
          addChunk();
        } else {
          tempChunk += notation[i];
        }
      }
      if (i === len - 1) {
        addChunk();
      }
    }

    return chunks;

  };

  /**
   * Pinch
   *
   * @constructor
   * @param {string|object} instance
   * @param {string|regexp} pattern
   * @param {string|function} replacement
   */
  var Pinch = function(instance, pattern, replacement) {

    // Checks input arguments. An instance must be a string or an object, a pattern
    // must be a string or a regular expression, a replacement must
    // be a string, an object or a function.
    var validInstance = ['string', 'object'].indexOf(typeof instance) !== -1;
    var validPattern = typeof pattern === 'string' || isRegEx(pattern);
    var validReplacement = ['string', 'object', 'boolean', 'function'].indexOf(typeof replacement) !== -1;

    // If any of the arguments is not valid, returns undefined
    if (!validInstance || !validPattern || !validReplacement) {
      return;
    }

    if (typeof instance === 'string') {
      this.instance = JSON.parse(instance);
      this.json = true;
    } else {
      this.instance = instance;
    }

    this.pattern = (typeof pattern === 'string') ? pattern.replace(/'/g, '"') : pattern;
    this.replacement = replacement;

    // Creates an index for the passed instance
    this.createIndex(this.instance);

  };

  /**
   * CreateIndex
   *
   * @param {string} path
   */
  Pinch.prototype.createIndex = function(instance, path) {

    // Save a reference to the ‘this’
    var self = this;

    this.index = this.index || [];

    path = path || '';

    each(instance, function(key, value) {

      var currentPath;

      // Make sure the key is a string
      key = key + '';

      // If the key doesn't contain any spaces, use a dot notation. If
      // the key is a number, use a square bracket notation (e.g. [2]).
      // In other cases just use s square bracket notation.
      if (key.match(/^[a-zA-Z]+$/)) {
        currentPath = (path) ? (path + '.' + key) : key;
      } else if (key.match(/\d+/)) {
        currentPath = path + '[' + key + ']';
      } else  {
        currentPath = path + '["' + key + '"]';
      }
      self.index.push(currentPath);

      if (typeof value === 'object') {
        self.createIndex(value, currentPath);
      }

    });

  };

  /**
   * Replace
   *
   */
  Pinch.prototype.replace = function() {

    var self = this;

    each(this.index, function(key, value) {

      // If the pattern is a regular expression and matches the key
      if (isRegEx(self.pattern) && value.match(self.pattern)) {
        return self.replaceValue(value);
      }

      // If the pattern is a string and matches the key
      if (typeof self.pattern === 'string') {

        var valueTree = parseNotation(value);
        var patternTree = parseNotation(self.pattern);

        if (isEqualArray(valueTree, patternTree)) {
          return self.replaceValue(value);
        }

      }

    });

    // Returns a new JavaScript object (or JSON)
    return (this.json) ? JSON.stringify(this.instance) : this.instance;

  };

  /**
   * Replace
   *
   * @param {string} path
   */
  Pinch.prototype.replaceValue = function(path) {

    var self = this;

    var tree = parseNotation(path);

    tree.reduce(function(previousValue, currentValue, index) {
      if (index === tree.length - 1) {
        var replacement;
        if (typeof self.replacement === 'function') {
          replacement = self.replacement(path, currentValue, previousValue[currentValue]);
        } else {
          replacement = self.replacement;
        }
        previousValue[currentValue] = replacement;
        return;
      }

      return previousValue[currentValue];
    }, this.instance);

  };

  /**
   * Replace
   *
   * @param {string|object} instance
   * @param {string|regexp} pattern
   * @param {string|function} replacement
   * @param {function} callback
   */
  var PinchExport = function(instance, pattern, replacement, callback) {
    var Instance = new Pinch(instance, pattern, replacement);
    var output = Instance.replace();
    return (typeof callback === 'function') ? callback(null, output) : output;
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinchExport;
  } else if (typeof define !== 'undefined') {
    define(function() {
      return PinchExport;
    });
  } else {
    this.pinch = PinchExport;
  }

}());