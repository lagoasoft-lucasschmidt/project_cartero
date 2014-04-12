(function() {
  var Q, cordell, logger;

  Q = require('q');

  cordell = require('cordell');

  logger = require('./logger').create("UTIL");

  module.exports = function(folder, matches) {
    var deferred, walker;
    logger.trace("Trying to read all files recursively with path " + folder + ", with match condition=" + matches);
    deferred = Q.defer();
    walker = cordell.walk(folder, {
      match: matches
    });
    walker.on("error", function(path, error) {
      logger.error({
        msg: "Error while trying to scan all files inside path=" + folder,
        error: error
      });
      return deferred.reject(new Error(error));
    });
    walker.on("end", function(files, stats) {
      var file;
      logger.trace("Finished scanning files on dir " + folder + ", found " + files.length + " files");
      return deferred.resolve((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          _results.push(file.toString());
        }
        return _results;
      })());
    });
    return deferred.promise;
  };

}).call(this);
