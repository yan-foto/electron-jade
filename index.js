var app = require('app');
var fs = require('fs');
var path = require('path');
var jade = require('jade');
var extend = require('util')._extend;
var mime = require('mime');

module.exports = function(jadeOptions, locals) {
  app.on('ready', function() {
    var protocol = require('protocol');
    var options = extend({}, jadeOptions || {});

    protocol.interceptBufferProtocol('file', function(request, callback) {
      var file = request.url.substr(7);
      var content = null;

      // See if file actually exists
      try {
        content = fs.readFileSync(file, 'utf8');
      } catch (e) {
        // See here for error numbers:
        // https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
       if (e.code === 'ENOENT') {
         // NET_ERROR(FILE_NOT_FOUND, -6)
         callback(6);
       }

       // All other possible errors return a generic failure
       // NET_ERROR(FAILED, -2)
       callback(2);
      }

      var ext = path.extname(file);
      if (ext === '.jade') {
        var compiled = jade.compileFile(file, jadeOptions)(locals);

        callback({data: new Buffer(compiled), mimeType:'text/html'});
      } else {
        callback({data: new Buffer(content), mimeType: mime.lookup(ext)});
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
