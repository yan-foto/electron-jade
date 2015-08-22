var app = require('app');
var fs = require('fs');
var path = require('path');
var jade = require('jade');
var extend = require('util')._extend;

module.exports = function(jadeOptions, locals) {
  app.on('ready', function() {
    var protocol = require('protocol');
    var options = extend({}, jadeOptions || {});

    protocol.interceptProtocol('file', function(request) {
      var file = request.url.substr(7);

      // See if file actually exists
      try {
        fs.readFileSync(file, 'utf8');
      } catch (e) {
        // See here for error numbers:
        // https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
       if (e.code === 'ENOENT') {
         // NET_ERROR(FILE_NOT_FOUND, -6)
         return new protocol.RequestErrorJob(6);
       }

       // All other possible errors return a generic failure
       // NET_ERROR(FAILED, -2)
       return new protocol.RequestErrorJob(2);
      }

      if (path.extname(file) === '.jade') {
        var compiled = jade.compileFile(file, jadeOptions)(locals);

        return new protocol.RequestStringJob({
          mimeType: 'text/html',
          data: compiled
        });
      } else {
        // Use original handler
        return null;
      }
    }, function (error, scheme) {
      if (!error) {
        console.log('jade interceptor registered successfully');
      } else {
        console.error('Error while bootstraping electron-jade', error);
      }
    });
  });
};
