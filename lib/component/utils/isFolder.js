(function() {
  var Q, fs;

  Q = require('q');

  fs = require('fs');

  module.exports = function(filePath) {
    var deferred;
    deferred = Q.defer();
    fs.stat(filePath, function(error, stat) {
      if (error) {
        return deferred.reject(new Error(error));
      } else {
        return deferred.resolve((stat != null ? stat.isDirectory() : void 0) || false);
      }
    });
    return deferred.promise;
  };

}).call(this);
