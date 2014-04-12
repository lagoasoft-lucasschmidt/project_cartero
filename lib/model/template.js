(function() {
  var Library, Template, _;

  _ = require('lodash');

  Library = require('./library');

  Template = (function() {
    function Template(data) {
      var lib, templ, _i, _j, _len, _len1, _ref, _ref1;
      this.filePath = (data != null ? data.filePath : void 0) || (function() {
        throw new Error("File Path must be specified");
      })();
      if (!(_.isString(this.filePath) && this.filePath.length > 0)) {
        throw new Error("Filepath must be informed and a valid string");
      }
      this.extend = data != null ? data.extend : void 0;
      if ((this.extend != null) && !_.isString(this.extend)) {
        throw new Error("Extends must be null or String");
      }
      this.libraryDependencies = (data != null ? data.libraryDependencies : void 0) || [];
      if (!_.isArray(this.libraryDependencies)) {
        throw new Error("Library Dependencies must be Array");
      }
      _ref = this.libraryDependencies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lib = _ref[_i];
        if (!_.isString(lib)) {
          throw new Error("Library Dependencies must be String instances");
        }
      }
      this.includes = (data != null ? data.includes : void 0) || [];
      if (!_.isArray(this.includes)) {
        throw new Error("Includes must be Array");
      }
      _ref1 = this.includes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        templ = _ref1[_j];
        if (!_.isString(templ)) {
          throw new Error("Includes must be String instances");
        }
      }
      this.ownFiles = data != null ? data.ownFiles : void 0;
      if ((this.ownFiles != null) && !(this.ownFiles instanceof Library)) {
        throw new Error("Own Files must be Library instance or null");
      }
    }

    return Template;

  })();

  module.exports = Template;

}).call(this);
