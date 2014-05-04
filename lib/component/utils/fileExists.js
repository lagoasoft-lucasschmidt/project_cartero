(function() {
  var Promise, fs;

  Promise = require('bluebird');

  fs = require('fs');

  module.exports = function(filePath) {
    var deferred;
    deferred = Promise.defer();
    fs.exists(filePath, function(exists) {
      return deferred.resolve(exists);
    });
    return deferred.promise;
  };

}).call(this);
