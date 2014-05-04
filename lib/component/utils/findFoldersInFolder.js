(function() {
  var Promise, fs, isFolder, logger, path, readdir;

  Promise = require('bluebird');

  fs = require('fs');

  path = require('path');

  isFolder = require('./isFolder');

  logger = require('./logger').create("UTIL");

  readdir = Promise.promisify(fs.readdir, fs);

  module.exports = function(folder, matches) {
    logger.trace("Trying to read folders inside path " + folder + ", with match condition=" + matches);
    return readdir(folder).then(function(stats) {
      var file, promises;
      promises = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = stats.length; _i < _len; _i++) {
          file = stats[_i];
          _results.push(isFolder(path.join(folder, file), /\*./));
        }
        return _results;
      })();
      return Promise.all(promises).then(function(results) {
        var folders, i, result, _i, _len;
        folders = [];
        for (i = _i = 0, _len = results.length; _i < _len; i = ++_i) {
          result = results[i];
          if (result === true && matches.test(path.join(folder, stats[i]).toString())) {
            folders.push(path.join(folder, stats[i]).toString());
          }
        }
        logger.trace("Found " + folders.length + " folders inside path " + folder + ", with match condition=" + matches);
        return folders;
      });
    });
  };

}).call(this);
