# electron jade
This module is a simple protocol handler for [electron](https://github.com/atom/electron) which takes care of all URLs with `jade` scheme. It compiles `.jade` files on the fly and the rest of the requests are just handles as simple (local) file requests.

# Usage
Just initialize this module with desired options for [Jade](https://www.npmjs.com/package/jade) package after the main `BrowserWindow` is created:

```js
'use strict';

var app = require('app');
var j = require('./util/jade-protocol.js');
var BrowserWindow = require('browser-window');

// Standard stuff

app.on('ready', function () {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  j(); // <-- IT SHOULD BE INITIATED AFTER BROWSERWINDOW IS CREATED

  mainWindow.loadUrl('jade://' + __dirname + '/index.jade');
  // the rest...
});
```

**Disclaimer**: this module is in its very early stages and the logic is still not mature enough.

# Even more!
If you want to have least effort when developing electron packages, take a look at [neutron](https://github.com/yan-foto/neutron)!
