# Pinch

[![Build Status](https://secure.travis-ci.org/Baggz/Pinch.png)](http://travis-ci.org/Baggz/Pinch)

Pinch is a small JavaScript utility which is able to **replace any data in a JavaScript object** (or JSON). You just need to provide a key *(for instance `users[0].name`)* in a *dot notation* or a *square bracket notation* and a replacement. The replacement can be a *string* or a *function* to be called for each match. Pinch returns a *new* JavaScript object (or JSON).

### Example

```javascript
var data = {
  users: [
    {
      name: 'John'
    },
    {
      name: 'Kenneth',
    },
    {
      name: 'Brent'
    }
  ]
};

// This step is optional. Pinch accepts JSON as well
// as a regular JavaScript object.
data = JSON.stringify(data);

pinch(data, 'users[0].name', 'Juan');
```

To be honest, in the first example Pinch is overkill. Pinch is very useful for **replacing multiple keys**, e.g. converting some values to a number. See the following example.

```javascript
var data = {
  user: {
    id: '123'
  },
  request: {
    id: '456'
  },
  book: {
    id: '789'
  }
};

// Converts all ids to a number
pinch(data, /id/, function(path, key, value) {
  return parseInt(value);
});
```

<a name="Contents"></a>
### Contents

<ul>
  <li><a href="#Download">Download</a>
  <li><a href="#Usage">Usage</a>
  <li><a href="#Documentation">Documentation</a>
  <li><a href="#Compatibility">Compatibility</a>
  <li><a href="#Tests">Tests</a>
  <li><a href="#Contributors">Contributors</a>
  <li><a href="#License">License</a>
</ul>

<a name="Download"></a>
## Download [&uarr;](#Contents)

To install **Pinch**, use [NPM](http://npmjs.org/).

```
$ npm install pinch
```

Releases are available for download from GitHub.

| **Version** | **Description** | **Size** | **Action** |
|:------------|:----------------|:---------|:-----------|
| `pinch.js` | *uncompressed, with comments* | 4.59 KB (1.46 KB gzipped) | [Download](https://raw.github.com/Baggz/Pinch/master/dist/latest.js) |
| `pinch.min.js` | *compressed, without comments* | 1.7 KB (746 bytes gzipped) | [Download](https://raw.github.com/Baggz/Pinch/master/dist/latest.min.js) |

<a name="Usage"></a>
## Usage [&uarr;](#contents)

### Browser

```
<script src="./path/to/pinch.js"></script>
```

### Node.js, RingoJS, Narwhal

```javascript
var pinch = require('pinch');
```

### RequireJS

```javascript
// Configuration options, the path should not include the .js extension
require.config({
  paths: {
    "pinch": "path/to/pinch"
  }
});

// Load Pinch
require(['pinch'], function(pinch) {
  // Do something...
});
```

<a name="Documentation"></a>
## Documentation [&uarr;](#contents)

### pinch(instance, pattern, replacement[, callback])

**Parameters**

* `instance` An instance could be a string as well as a regular JavaScript object
* `pattern` A pattern could be a regular expression or a string
* `replacement` A replacement could be a string or a function
* `callback`

**Notation**

Here are just a few examples of a dot notation and a square bracket notation.

* `users[0]`
* `users[0].books[0].title`
* `users[0]["full name"]`
* `user.name.en`

*Examples*

```javascript
var instance = {
  name: 'František'
};

pinch(instance, 'name', 'Juan'); // => { name: 'Juan' }
```

```javascript
var instance = [
  {
    user: {
      name: 'Edwin'
    }
  },
  {
    user: {
      name: 'Teresa'
    }
  }
];

pinch(instance, '[0].user.name', 'Juan'); =>  [{ user: { name: 'Juan' } }, ... ]
```

```javascript
var instance = [
  {
    user: {
      id: '123'
    },
    request: {
      id: '456'
    }
  }
];

pinch(instance, /id/, function(path, key, value) {
  return parseInt(value);
});
```

<a name="Compatibility"></a>
## Compatibility [&uarr;](#contents)

### Node.js

From version **0.6.0**.

### Browsers

**Desktop**

| **Browser** | **Supported** |
|:------------|:-----------:|
| Google Chrome | ✔ |
| Safari | n/a |
| Firefox | n/a |
| Opera | n/a |
| Internet Explorer | n/a |

*Testing in progress...*

<a name="Tests"></a>
## Tests [&uarr;](#tests)

```
$ npm test
```

<a name="Contributors"></a>
## Contributors [&uarr;](#contents)

The following are the major contributors of Amanda (in random order).

* **František Hába** ([@Baggz](https://github.com/Baggz))

<a name="License"></a>
## License [&uarr;](#contents)

(The MIT License)

Copyright (c) 2011 František Hába &lt;hello@frantisekhaba.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.