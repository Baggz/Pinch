if (typeof module !== 'undefined' && module.exports) {
  var expect = require('expect.js');
  var pinch = require('../src/pinch.js');
}

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
 * Clone
 *
 * @param {object} input
 */
var clone = function(input) {

  var output;

  if (isArray(input)) {
    output = [];
    each(input, function(index, value) {
      output.push(clone(value));
    });
    return output;
  }

  if (isObject(input)) {
    output = {};
    each(input, function(key, value) {
      output[key] = clone(value);
    });
    return output;
  }

  return input;

};

/**
 * Pinch
 * --------------------
 */
suite('Pinch', function() {

  test('should be defined', function() {
    expect(pinch).to.be.ok();
  });

  test('should be a function', function() {
    expect(pinch).to.be.a('function');
  });

});

/**
 * Arguments
 * --------------------
 */
suite('Arguments', function() {

  test('no arguments', function() {
    expect(pinch()).to.not.be.ok();
  });

  test('only some arguments', function() {
    expect(pinch('{ "foo": "bar" }')).to.not.be.ok();
    expect(pinch('{ "foo": "bar" }', 'foo')).to.not.be.ok();
    expect(pinch(undefined, 'foo')).to.not.be.ok();
    expect(pinch('{ "foo": "bar" }', undefined, 'baz')).to.not.be.ok();
    expect(pinch(undefined, 'foo', 'baz')).to.not.be.ok();
  });

  test('an instance as a function', function() {
    var testFn = function() {};
    expect(pinch(testFn, 'foo', 'bar')).to.not.be.ok();
  });

  test('a pattern as a function', function() {
    var testFn = function() {};
    expect(pinch('{ "foo": "bar" }', testFn, 'bar')).to.not.be.ok();
  });

});

/**
 * Function
 * --------------------
 */
suite('Using a function as a replacement', function() {

  var testObjectDefault = {
    name: 'František',
    surname: 'Hába',
    books: [
      {
        title: 'Pro Git',
        author: 'Scott Chacon'
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger'
      },
      {
        title: 'Understanding Comics: The Invisible Art',
        author: 'Scott McCloud'
      }
    ]
  };

  // path, key, value)

  test('using the ‘name’ notation', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'name', function(path, key, value) {
      expect(path).to.be.eql('name');
      expect(key).to.be.eql('name');
      expect(value).to.be.eql('František');
      return 'Marjorie';
    });
    
    expect(result).to.be.eql({
      name: 'Marjorie',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });

  });

  test('using the ‘surname’ notation', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'surname', function(path, key, value) {
      expect(path).to.be.eql('surname');
      expect(key).to.be.eql('surname');
      expect(value).to.be.eql('Hába');
      return 'Ridder';
    });

    expect(result).to.be.eql({
      name: 'František',
      surname: 'Ridder',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });

  });

  test('using the ‘books[0]’ notation', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'books[0]', function(path, key, value) {
      expect(path).to.be.eql('books[0]');
      expect(key).to.be.eql('0');
      expect(value).to.be.eql({
        title: 'Pro Git',
        author: 'Scott Chacon'
      });
      return 'Test';
    });

    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        'Test',
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });

  });

  test('using the ‘books[0]’ notation in order to replace an object', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'books[0]', function(path, key, value) {
      expect(path).to.be.eql('books[0]');
      expect(key).to.be.eql('0');
      expect(value).to.be.eql({
        title: 'Pro Git',
        author: 'Scott Chacon'
      });
      return {
        foo: 'bar'
      };
    });

    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          foo: 'bar'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });

  });

  test('using the ‘books[1]’ notation', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'books[1]', function(path, key, value) {
      expect(path).to.be.eql('books[1]');
      expect(key).to.be.eql('1');
      expect(value).to.be.eql({
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger'
      });
      return 'Test';
    });

    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        'Test',
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });

  });

  test('using the ‘books[2]’ notation', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'books[2]', function(path, key, value) {
      expect(path).to.be.eql('books[2]');
      expect(key).to.be.eql('2');
      expect(value).to.be.eql({
        title: 'Understanding Comics: The Invisible Art',
        author: 'Scott McCloud'
      });
      return 'Test';
    });

    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        'Test'
      ]
    });

  });

  test('using the ‘books[0].title’ notation', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'books[0].title', function(path, key, value) {
      expect(path).to.be.eql('books[0].title');
      expect(key).to.be.eql('title');
      expect(value).to.be.eql('Pro Git');
      return 'SVN';
    });

    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'SVN',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });

  });

  test('using the ‘books[1].title’ notation', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'books[1].title', function(path, key, value) {
      expect(path).to.be.eql('books[1].title');
      expect(key).to.be.eql('title');
      expect(value).to.be.eql('The Catcher in the Rye');
      return 'The Catcher';
    });

    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });

  });

  test('using the ‘books[2].title’ notation', function() {

    var testObject = clone(testObjectDefault);

    var result = pinch(testObject, 'books[2].title', function(path, key, value) {
      expect(path).to.be.eql('books[2].title');
      expect(key).to.be.eql('title');
      expect(value).to.be.eql('Understanding Comics: The Invisible Art');
      return 'The Invisible Art';
    });

    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });

  });

});

/**
 * Replacing an object
 * --------------------
 */
suite('Replacing an object', function() {

  var testObjectDefault = {
    name: 'František',
    surname: 'Hába',
    books: [
      {
        title: 'Pro Git',
        author: 'Scott Chacon'
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger'
      },
      {
        title: 'Understanding Comics: The Invisible Art',
        author: 'Scott McCloud'
      }
    ]
  };

  test('using the ‘name’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'name', 'Marjorie');
    expect(result).to.be.eql({
      name: 'Marjorie',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using the ‘surname’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'surname', 'Ridder');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Ridder',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using the ‘books[0]’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'books[0]', 'Test');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        'Test',
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using the ‘books[0]’ notation in order to replace an object', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'books[0]', { foo: 'bar' });
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          foo: 'bar'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using the ‘books[1]’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'books[1]', 'Test');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        'Test',
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using the ‘books[2]’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'books[2]', 'Test');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        'Test'
      ]
    });
  });

  test('using the ‘books[0].title’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'books[0].title', 'SVN');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'SVN',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using the ‘books[1].title’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'books[1].title', 'The Catcher');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using the ‘books[2].title’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'books[2].title', 'The Invisible Art');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using a regular expression to replace all books', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, /books\[.+\]/, 'Test');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        'Test',
        'Test',
        'Test'
      ]
    });
  });

  test('using a regular expression to replace all titles', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, /books\[.+\]\.title/, 'Test');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Test',
          author: 'Scott Chacon'
        },
        {
          title: 'Test',
          author: 'J.D. Salinger'
        },
        {
          title: 'Test',
          author: 'Scott McCloud'
        }
      ]
    });
  });

  test('using a regular expression to replace all authors', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, /books\[.+\]\.author/, 'Test');
    expect(result).to.be.eql({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Test'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'Test'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Test'
        }
      ]
    });
  });

});

/**
 * JSON
 * --------------------
 */
suite('JSON', function() {

  var testObject = {
    name: 'František',
    surname: 'Hába',
    books: [
      {
        title: 'Pro Git',
        author: 'Scott Chacon'
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger'
      },
      {
        title: 'Understanding Comics: The Invisible Art',
        author: 'Scott McCloud'
      }
    ]
  };

  // Converts the ‘testObject’ to JSON
  testObject = JSON.stringify(testObject);

  test('using the ‘name’ notation', function() {
    var result = pinch(testObject, 'name', 'Marjorie');
    expect(result).to.be.eql(JSON.stringify({
      name: 'Marjorie',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using the ‘surname’ notation', function() {
    var result = pinch(testObject, 'surname', 'Ridder');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Ridder',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using the ‘books[0]’ notation', function() {
    var result = pinch(testObject, 'books[0]', 'Test');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        'Test',
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using the ‘books[0]’ notation in order to replace an object', function() {
    var result = pinch(testObject, 'books[0]', { foo: 'bar' });
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          foo: 'bar'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using the ‘books[1]’ notation', function() {
    var result = pinch(testObject, 'books[1]', 'Test');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        'Test',
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using the ‘books[2]’ notation', function() {
    var result = pinch(testObject, 'books[2]', 'Test');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        'Test'
      ]
    }));
  });

  test('using the ‘books[0].title’ notation', function() {
    var result = pinch(testObject, 'books[0].title', 'SVN');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'SVN',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using the ‘books[1].title’ notation', function() {
    var result = pinch(testObject, 'books[1].title', 'The Catcher');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher',
          author: 'J.D. Salinger'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using the ‘books[2].title’ notation', function() {
    var result = pinch(testObject, 'books[2].title', 'The Invisible Art');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Scott Chacon'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger'
        },
        {
          title: 'The Invisible Art',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using a regular expression to replace all books', function() {
    var result = pinch(testObject, /books\[.+\]/, 'Test');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        'Test',
        'Test',
        'Test'
      ]
    }));
  });

  test('using a regular expression to replace all titles', function() {
    var result = pinch(testObject, /books\[.+\]\.title/, 'Test');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Test',
          author: 'Scott Chacon'
        },
        {
          title: 'Test',
          author: 'J.D. Salinger'
        },
        {
          title: 'Test',
          author: 'Scott McCloud'
        }
      ]
    }));
  });

  test('using a regular expression to replace all authors', function() {
    var result = pinch(testObject, /books\[.+\]\.author/, 'Test');
    expect(result).to.be.eql(JSON.stringify({
      name: 'František',
      surname: 'Hába',
      books: [
        {
          title: 'Pro Git',
          author: 'Test'
        },
        {
          title: 'The Catcher in the Rye',
          author: 'Test'
        },
        {
          title: 'Understanding Comics: The Invisible Art',
          author: 'Test'
        }
      ]
    }));
  });

});

/**
 * More ambitious notations
 * --------------------
 */
suite('More Ambitious Notations', function() {

  var testObjectDefault = {
    user: {
      profile: {
        name: {
          firstName: {
            "my First name": {
              name: 'František'
            }
          }
        }
      }
    }
  };

  test("using the ‘user.profile.name.firstName['my First name'].name’ notation", function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, "user.profile.name.firstName['my First name'].name", 'Test');
    expect(result.user.profile.name.firstName['my First name'].name).to.be.eql('Test');
  });

  test("using the ‘['user'].profile.name.firstName['my First name'].name’ notation", function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, "['user'].profile.name.firstName['my First name'].name", 'Test');
    expect(result.user.profile.name.firstName['my First name'].name).to.be.eql('Test');
  });

  test("using the ‘['user']['profile'].name.firstName['my First name'].name’ notation", function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, "['user']['profile'].name.firstName['my First name'].name", 'Test');
    expect(result.user.profile.name.firstName['my First name'].name).to.be.eql('Test');
  });

  test("using the ‘['user']['profile']['name'].firstName['my First name'].name’ notation", function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, "['user']['profile']['name'].firstName['my First name'].name", 'Test');
    expect(result.user.profile.name.firstName['my First name'].name).to.be.eql('Test');
  });

  test("using the ‘['user']['profile']['name']['firstName']['my First name'].name’ notation", function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, "['user']['profile']['name']['firstName']['my First name'].name", 'Test');
    expect(result.user.profile.name.firstName['my First name'].name).to.be.eql('Test');
  });

  test("using the ‘['user']['profile']['name']['firstName']['my First name']['name']’ notation", function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, "['user']['profile']['name']['firstName']['my First name']['name']", 'Test');
    expect(result.user.profile.name.firstName['my First name'].name).to.be.eql('Test');
  });

  // --------------------

  test('using the ‘user.profile.name.firstName["my First name"].name’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, 'user.profile.name.firstName["my First name"].name', "Test");
    expect(result.user.profile.name.firstName["my First name"].name).to.be.eql('Test');
  });

  test('using the ‘["user"].profile.name.firstName["my First name"].name’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, '["user"].profile.name.firstName["my First name"].name', "Test");
    expect(result.user.profile.name.firstName["my First name"].name).to.be.eql('Test');
  });

  test('using the ‘["user"]["profile"].name.firstName["my First name"].name’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, '["user"]["profile"].name.firstName["my First name"].name', "Test");
    expect(result.user.profile.name.firstName["my First name"].name).to.be.eql('Test');
  });

  test('using the ‘["user"]["profile"]["name"].firstName["my First name"].name’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, '["user"]["profile"]["name"].firstName["my First name"].name', "Test");
    expect(result.user.profile.name.firstName["my First name"].name).to.be.eql('Test');
  });

  test('using the ‘["user"]["profile"]["name"]["firstName"]["my First name"].name’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, '["user"]["profile"]["name"]["firstName"]["my First name"].name', "Test");
    expect(result.user.profile.name.firstName["my First name"].name).to.be.eql('Test');
  });

  test('using the ‘["user"]["profile"]["name"]["firstName"]["my First name"]["name"]’ notation', function() {
    var testObject = clone(testObjectDefault);
    var result = pinch(testObject, '["user"]["profile"]["name"]["firstName"]["my First name"]["name"]', "Test");
    expect(result.user.profile.name.firstName["my First name"].name).to.be.eql('Test');
  });

});