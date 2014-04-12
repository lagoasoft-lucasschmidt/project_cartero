(function() {
  var Library, LibraryFile, _;

  _ = require('lodash');

  LibraryFile = require('./libraryFile');

  Library = (function() {
    function Library(data) {
      var dependency, file, _i, _j, _len, _len1, _ref, _ref1;
      this.id = (data != null ? data.libraryId : void 0) || (function() {
        throw new Error("Library id must be specified");
      })();
      this.bundleJSON = (data != null ? data.bundleJSON : void 0) || (function() {
        throw new Error("Bundle JSON must be informed");
      })();
      this.dependencies = (data != null ? data.dependencies : void 0) || [];
      if (!_.isArray(this.dependencies)) {
        throw new Error("Dependencies must be an array");
      }
      _ref = this.dependencies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dependency = _ref[_i];
        if (!_.isString(dependency)) {
          throw new Error("Dependencies must be instances of String");
        }
      }
      this.files = (data != null ? data.files : void 0) || [];
      if (!_.isArray(this.files)) {
        throw new Error("files must be an array");
      }
      _ref1 = this.files;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        file = _ref1[_j];
        if (!(file instanceof LibraryFile)) {
          throw new Error("Files must be instances of LibraryFile");
        }
      }
    }

    return Library;

  })();

  module.exports = Library;

}).call(this);
