(function() {
  var calculateByType, path, _;

  _ = require("lodash");

  path = require("path");

  calculateByType = require('./calculateByType');

  module.exports = function(opts) {
    var calculateViewFiles, filterFileByExtension, filterFileByExtensionAndType, findLocalFiles, web;
    web = opts != null ? opts.web : void 0;
    filterFileByExtension = function(extension) {
      return function(path, ext, fileDesc) {
        return ext === extension;
      };
    };
    filterFileByExtensionAndType = function(extension, type) {
      return function(path, ext, fileDesc) {
        return ext === extension && fileDesc.type === type;
      };
    };
    findLocalFiles = function(files, carteroJSON, extension) {
      return require('./findFiles')({
        web: web,
        carteroJSON: carteroJSON,
        filterFile: filterFileByExtensionAndType(extension, "LOCAL")
      })(files);
    };
    return calculateViewFiles = function(viewJSON, carteroJSON) {
      var cssFiles, filterRemoteAndKeepSeparatedLibraryFiles, jsFiles;
      if (viewJSON.joinedFiles != null) {
        filterRemoteAndKeepSeparatedLibraryFiles = function(extension) {
          return function(path, ext, fileDesc, library) {
            if (ext !== extension) {
              return false;
            }
            if (!library) {
              return false;
            }
            if (library.bundleJSON.keepSeparate) {
              return ext === extension;
            } else {
              return ext === extension && fileDesc.type === "REMOTE";
            }
          };
        };
        cssFiles = calculateByType({
          carteroJSON: carteroJSON,
          filterFile: filterRemoteAndKeepSeparatedLibraryFiles('css'),
          web: true
        })(viewJSON);
        jsFiles = calculateByType({
          carteroJSON: carteroJSON,
          filterFile: filterRemoteAndKeepSeparatedLibraryFiles('js'),
          web: true
        })(viewJSON);
        cssFiles = cssFiles.concat(findLocalFiles(viewJSON.joinedFiles, carteroJSON, "css"));
        jsFiles = jsFiles.concat(findLocalFiles(viewJSON.joinedFiles, carteroJSON, "js"));
      } else {
        cssFiles = calculateByType({
          carteroJSON: carteroJSON,
          filterFile: filterFileByExtension('css'),
          web: true
        })(viewJSON);
        jsFiles = calculateByType({
          carteroJSON: carteroJSON,
          filterFile: filterFileByExtension('js'),
          web: true
        })(viewJSON);
      }
      return {
        cssFiles: _.uniq(cssFiles),
        jsFiles: _.uniq(jsFiles)
      };
    };
  };

}).call(this);
