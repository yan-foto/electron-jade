var app = require('app');
var fs = require('fs');
var path = require('path');
var jade = require('jade');
var extend = require('util')._extend;
var mime = require('mime');

var getPath = function(url) {
  var parsed = require('url').parse(url);
  var result = parsed.pathname;

  // Local files in windows start with slash if no host is given
  // file:///c:/something.jade
  if(process.platform === 'win32' && !parsed.host.trim()) {
    result = result.substr(1);
  }

  return result;
}

module.exports = function(jadeOptions, locals) {
  app.on('ready', function() {
    var protocol = require('protocol');
    var options = extend({}, jadeOptions || {});

    protocol.interceptBufferProtocol('file', function(request, callback) {
      var file = getPath(request.url);
      var content = null;

      // See if file actually exists
      try {
        content = fs.readFileSync(file);

        var ext = path.extname(file);
        if (ext === '.jade') {
          var compiled = jade.compileFile(file, jadeOptions)(locals);

          return callback({data: new Buffer(compiled), mimeType:'text/html'});
        } else {
          return callback({data: content, mimeType: mime.lookup(ext)});
        }
      } catch (e) {
       console.error(e);  
        // See here for error numbers:
        // https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
       if (e.code === 'ENOENT') {
         // NET_ERROR(FILE_NOT_FOUND, -6)
         return callback(6);
       }

       // All other possible errors return a generic failure
       // NET_ERROR(FAILED, -2)
       return callback(2);
      }
    }, function (error, scheme) {
      if (!error) {
        console.log('Jade interceptor registered successfully');
      } else {
        console.error('Jade interceptor failed:', error);
      }
    });
  });
};
