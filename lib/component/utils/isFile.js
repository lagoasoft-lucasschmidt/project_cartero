(function() {
  var Q, fs;

  Q = require('q');

  fs = require('fs');

  module.exports = function(filePath) {
    var deferred;
    deferred = Q.defer();
    fs.stat(filePath, function(error, stat) {
      if (error) {
        return deferred.reject(error);
      } else {
        return deferred.resolve((stat != null ? stat.isFile() : void 0) || false);
      }
    });
    return deferred.promise;
  };

}).call(this);
