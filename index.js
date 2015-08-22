var app = require('app');
var path = require('path');
var jade = require('jade');
var extend = require('util')._extend;

module.exports = function(jadeOptions, locals) {
  app.on('ready', function() {
    var protocol = require('protocol');
    var options = extend({}, jadeOptions || {});

    protocol.interceptProtocol('file', function(request) {
        if(request) {
          var file = request.url.substr(8);
          if(file.endsWith('.jade')) {
            var compiled = jade.compileFile(file, jadeOptions)(locals);

            return new protocol.RequestStringJob({
              mimeType: 'text/html',
              data: compiled
            });
          } else {
            return null;
          }
        }
    }, function() {
        console.log("jade active")
    });
  });
};
