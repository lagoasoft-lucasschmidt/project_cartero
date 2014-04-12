(function() {
  var Q, fs, isFolder, logger, path;

  Q = require('q');

  fs = require('fs');

  path = require('path');

  isFolder = require('./isFolder');

  logger = require('./logger').create("UTIL");

  module.exports = function(folder, matches) {
    logger.trace("Trying to read folders inside path " + folder + ", with match condition=" + matches);
    return Q.nfcall(fs.readdir, folder).then(function(stats) {
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
      return Q.all(promises).then(function(results) {
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
