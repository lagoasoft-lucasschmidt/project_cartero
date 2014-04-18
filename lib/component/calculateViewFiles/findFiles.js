(function() {
  var fileExtension, path, _;

  path = require('path');

  _ = require('lodash');

  fileExtension = require('../utils/fileExtension');

  module.exports = function(opts) {
    var carteroJSON, convertWebPath, filterFile, findFiles, web;
    web = opts != null ? opts.web : void 0;
    carteroJSON = opts.carteroJSON || (function() {
      throw new Error("CarteroJSON must be informed");
    })();
    filterFile = opts.filterFile || function() {
      return true;
    };
    convertWebPath = function(filePath) {
      return path.join(carteroJSON.options.contextPath || "/", path.relative(carteroJSON.options.publicFilesPath, filePath));
    };
    return findFiles = function(files, library) {
      var allFiles, excludeFiles, excludedLocalFiles, file, libraryId, localFiles, _i, _len;
      excludeFiles = (library != null ? library.bundleJSON.dynamicallyLoadedFiles : void 0) || [];
      libraryId = library != null ? library.id : void 0;
      allFiles = [];
      localFiles = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        if (!(filterFile(file.path, fileExtension(file), file, library))) {
          continue;
        }
        allFiles.push(file.path);
        if (file.type === "LOCAL") {
          localFiles.push(file.path);
        }
      }
      if ((excludeFiles != null ? excludeFiles.length : void 0) && (libraryId != null)) {
        excludedLocalFiles = _.filter(localFiles, function(localFile) {
          var relativeToLibrary;
          relativeToLibrary = path.resolve(carteroJSON.options.librariesDestinationPath, "library-assets", libraryId);
          relativeToLibrary = path.relative(relativeToLibrary, localFile);
          return _.contains(excludeFiles, relativeToLibrary);
        });
        allFiles = _.filter(allFiles, function(filePath) {
          return !_.contains(excludedLocalFiles, filePath);
        });
      }
      allFiles = _.map(allFiles, function(filePath) {
        if (_.contains(localFiles, filePath) && web) {
          return convertWebPath(filePath);
        }
        return filePath;
      });
      return _.uniq(allFiles);
    };
  };

}).call(this);
