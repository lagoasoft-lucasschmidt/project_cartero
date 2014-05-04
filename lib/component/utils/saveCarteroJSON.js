(function() {
  var Promise, fileExists, fs, logger, mkdirp, path, runmkdirp, writeFile;

  Promise = require('bluebird');

  fs = require('fs');

  path = require('path');

  mkdirp = require('mkdirp');

  fileExists = require('./fileExists');

  logger = require('./logger').create("UTIL");

  runmkdirp = Promise.promisify(mkdirp);

  writeFile = Promise.promisify(fs.writeFile, fs);

  module.exports = function(carteroJSON, options) {
    var filePath;
    filePath = path.join(options.carteroFileDescriptorPath, "" + options.carteroFileDescriptorName + "." + options.carteroFileDescriptorExtension);
    return fileExists(options.carteroFileDescriptorPath).then(function(exists) {
      if (!exists) {
        return runmkdirp(options.carteroFileDescriptorPath);
      } else {
        return Promise.resolve();
      }
    }).then(function() {
      logger.debug("will try to write " + filePath);
      return writeFile(filePath, JSON.stringify(carteroJSON, null, 2));
    });
  };

}).call(this);
