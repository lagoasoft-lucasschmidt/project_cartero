(function() {
  var Q, fs;

  Q = require('q');

  fs = require('fs');

  module.exports = function(filePath) {
    var deferred;
    deferred = Q.defer();
    fs.exists(filePath, function(exists) {
      return deferred.resolve(exists);
    });
    return deferred.promise;
  };

}).call(this);
