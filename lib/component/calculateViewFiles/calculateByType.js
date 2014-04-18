(function() {
  var path, _;

  _ = require("lodash");

  path = require("path");

  module.exports = function(opts) {
    var calculateFullViewFiles, calculateLibraryFiles, carteroJSON, filterFile, filterLibrary, findFiles, findLibraryFiles, runFindFiles, web;
    web = opts != null ? opts.web : void 0;
    filterFile = opts != null ? opts.filterFile : void 0;
    filterLibrary = (opts != null ? opts.filterLibrary : void 0) || function() {
      return true;
    };
    carteroJSON = (opts != null ? opts.carteroJSON : void 0) || (function() {
      throw new Error("CarteroJSON must be informed");
    })();
    runFindFiles = require('./findFiles')({
      web: web,
      carteroJSON: carteroJSON,
      filterFile: filterFile
    });
    findFiles = function(files, library) {
      return runFindFiles(files, library);
    };
    findLibraryFiles = function(library) {
      return findFiles(library.files, library);
    };
    calculateLibraryFiles = function(library) {
      var dep, localFiles, otherLib, _i, _len, _ref, _ref1;
      localFiles = [];
      if ((_ref = library.dependencies) != null ? _ref.length : void 0) {
        _ref1 = library.dependencies;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          dep = _ref1[_i];
          otherLib = carteroJSON.libraries[dep];
          localFiles = localFiles.concat(calculateLibraryFiles(otherLib));
        }
      }
      if ((library.files != null) && filterLibrary(library)) {
        localFiles = localFiles.concat(findLibraryFiles(library));
      }
      return _.uniq(localFiles);
    };
    return calculateFullViewFiles = function(viewJSON) {
      var extendView, include, includedView, library, libraryId, localFiles, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      localFiles = [];
      if (viewJSON.extend != null) {
        extendView = carteroJSON.templates[viewJSON.extend];
        localFiles = localFiles.concat(calculateFullViewFiles(extendView));
      }
      if ((_ref = viewJSON.libraryDependencies) != null ? _ref.length : void 0) {
        _ref1 = viewJSON.libraryDependencies;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          libraryId = _ref1[_i];
          library = carteroJSON.libraries[libraryId];
          localFiles = localFiles.concat(calculateLibraryFiles(library));
        }
      }
      if (viewJSON.ownFiles != null) {
        localFiles = localFiles.concat(findFiles(viewJSON.ownFiles.files));
      }
      if ((_ref2 = viewJSON.includes) != null ? _ref2.length : void 0) {
        _ref3 = viewJSON.includes;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          include = _ref3[_j];
          includedView = carteroJSON.templates[include];
          localFiles = localFiles.concat(calculateFullViewFiles(includedView));
        }
      }
      return _.uniq(localFiles);
    };
  };

}).call(this);
