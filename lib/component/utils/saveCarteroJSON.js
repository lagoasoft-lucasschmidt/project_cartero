(function() {
  var Q, fileExists, fs, logger, mkdirp, path;

  Q = require('q');

  fs = require('fs');

  path = require('path');

  mkdirp = require('mkdirp');

  fileExists = require('./fileExists');

  logger = require('./logger').create("UTIL");

  module.exports = function(carteroJSON, options) {
    var filePath;
    filePath = path.join(options.carteroFileDescriptorPath, "" + options.carteroFileDescriptorName + "." + options.carteroFileDescriptorExtension);
    return fileExists(options.carteroFileDescriptorPath).then(function(exists) {
      if (!exists) {
        return Q.nfcall(mkdirp, options.carteroFileDescriptorPath);
      } else {
        return Q.fcall(function() {});
      }
    }).then(function() {
      logger.info("will try to write " + filePath);
      return Q.nfcall(fs.writeFile, filePath, JSON.stringify(carteroJSON, null, 2));
    });
  };

}).call(this);
