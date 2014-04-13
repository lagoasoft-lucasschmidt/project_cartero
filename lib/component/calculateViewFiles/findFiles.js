(function() {
  var fileExtension, path, _;

  path = require('path');

  _ = require('lodash');

  fileExtension = require('../utils/fileExtension');

  module.exports = function(opts) {
    var carteroJSON, convertPath, extension, fileType, findFiles, web;
    web = opts != null ? opts.web : void 0;
    fileType = (opts != null ? opts.fileType : void 0) || (function() {
      throw new Error("File Type must be informed");
    })();
    extension = (opts != null ? opts.fileExtension : void 0) || (function() {
      throw new Error("File Extension must be informed");
    })();
    carteroJSON = opts.carteroJSON || (function() {
      throw new Error("CarteroJSON must be informed");
    })();
    convertPath = function(filePath) {
      if (web && fileType === "LOCAL") {
        return path.join(carteroJSON.options.contextPath || "/", path.relative(carteroJSON.options.publicFilesPath, filePath));
      } else {
        return filePath;
      }
    };
    return findFiles = function(files, excludeFiles, libraryId) {
      var file, localFiles;
      excludeFiles = excludeFiles || [];
      localFiles = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          if (file.type === fileType && fileExtension(file.path) === extension) {
            _results.push(file.path);
          }
        }
        return _results;
      })();
      if ((excludeFiles != null ? excludeFiles.length : void 0) && (libraryId != null)) {
        localFiles = _.filter(localFiles, function(localFile) {
          var relativeToLibrary;
          relativeToLibrary = path.resolve(carteroJSON.options.librariesDestinationPath, "library-assets", libraryId);
          relativeToLibrary = path.relative(relativeToLibrary, localFile);
          return !_.contains(excludeFiles, relativeToLibrary);
        });
      }
      localFiles = _.map(localFiles, convertPath);
      return _.uniq(localFiles);
    };
  };

}).call(this);
