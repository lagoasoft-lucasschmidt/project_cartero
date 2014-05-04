(function() {
  var Promise, fs, isFile, logger, path, readdir;

  Promise = require('bluebird');

  fs = require('fs');

  isFile = require('./isFile');

  path = require('path');

  logger = require('./logger').create("UTIL");

  readdir = Promise.promisify(fs.readdir, fs);

  module.exports = function(folder, matches) {
    logger.trace("Trying to read files inside path " + folder + ", with match condition=" + matches);
    return readdir(folder).then(function(stats) {
      var file, promises;
      logger.trace("Read directory " + folder + " with stats=" + stats);
      promises = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = stats.length; _i < _len; _i++) {
          file = stats[_i];
          _results.push(isFile(path.join(folder, file), /\*./));
        }
        return _results;
      })();
      return Promise.all(promises).then(function(results) {
        var files, i, result, _i, _len;
        files = [];
        for (i = _i = 0, _len = results.length; _i < _len; i = ++_i) {
          result = results[i];
          if (result === true && matches.test(path.join(folder, stats[i]).toString())) {
            files.push(path.join(folder, stats[i]).toString());
          }
        }
        logger.trace("Found " + files.length + " files inside path " + folder + ", with match condition=" + matches);
        return files;
      });
    });
  };

}).call(this);
