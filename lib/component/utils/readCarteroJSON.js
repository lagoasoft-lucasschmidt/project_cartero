(function() {
  var Promise, fs, path, readFile;

  Promise = require('bluebird');

  path = require('path');

  fs = require('fs');

  readFile = Promise.promisify(fs.readFile, fs);

  module.exports = function(options) {
    var carteroJSONPath, filename;
    filename = "" + (options != null ? options.carteroFileDescriptorName : void 0) + "." + (options != null ? options.carteroFileDescriptorExtension : void 0);
    carteroJSONPath = path.join(options.carteroFileDescriptorPath, filename);
    return readFile(carteroJSONPath, "utf-8").then(function(fileContents) {
      var json;
      json = fileContents.toString();
      return JSON.parse(json);
    });
  };

}).call(this);
