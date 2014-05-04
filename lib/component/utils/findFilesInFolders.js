(function() {
  var Promise, findFilesInFolder, fs, logger, _;

  Promise = require('bluebird');

  fs = require('fs');

  _ = require('lodash');

  findFilesInFolder = require('./findFilesInFolder');

  logger = require('./logger').create("UTIL");

  module.exports = function(folders, matches) {
    var folder, promises;
    logger.trace("Trying to find files in folders=" + folders);
    if (!(_.isArray(folders) && folders.length > 0)) {
      return Promise.resolve([]);
    }
    promises = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = folders.length; _i < _len; _i++) {
        folder = folders[_i];
        _results.push(findFilesInFolder(folder, matches));
      }
      return _results;
    })();
    return Promise.all(promises).then(function(arrays) {
      var array, file, files, _i, _j, _len, _len1;
      files = [];
      for (_i = 0, _len = arrays.length; _i < _len; _i++) {
        array = arrays[_i];
        for (_j = 0, _len1 = array.length; _j < _len1; _j++) {
          file = array[_j];
          files.push(file);
        }
      }
      return files;
    });
  };

}).call(this);
