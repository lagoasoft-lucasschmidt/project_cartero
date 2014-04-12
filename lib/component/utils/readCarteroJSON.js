(function() {
  var Q, fs, path;

  Q = require('q');

  path = require('path');

  fs = require('fs');

  module.exports = function(options) {
    var carteroJSONPath, filename;
    filename = "" + (options != null ? options.carteroFileDescriptorName : void 0) + "." + (options != null ? options.carteroFileDescriptorExtension : void 0);
    carteroJSONPath = path.join(options.carteroFileDescriptorPath, filename);
    return Q.nfcall(fs.readFile, carteroJSONPath, "utf-8").then(function(fileContents) {
      var json;
      json = fileContents.toString();
      return JSON.parse(json);
    });
  };

}).call(this);
