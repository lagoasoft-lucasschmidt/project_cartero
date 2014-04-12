(function() {
  var Q, fs, isFile, logger, path;

  Q = require('q');

  fs = require('fs');

  isFile = require('./isFile');

  path = require('path');

  logger = require('./logger').create("UTIL");

  module.exports = function(folder, matches) {
    logger.trace("Trying to read files inside path " + folder + ", with match condition=" + matches);
    return Q.nfcall(fs.readdir, folder).then(function(stats) {
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
      return Q.all(promises).then(function(results) {
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
