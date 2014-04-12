(function() {
  var Library, ScannedTemplate, _;

  _ = require('lodash');

  Library = require('./library');

  ScannedTemplate = (function() {
    function ScannedTemplate(data) {
      this.filePath = (data != null ? data.filePath : void 0) || (function() {
        throw new Error("File Path must be specified");
      })();
      this.extend = data != null ? data.extend : void 0;
      this.libraryDependencies = (data != null ? data.libraryDependencies : void 0) || [];
      this.includes = (data != null ? data.includes : void 0) || [];
      this.ownFiles = (data != null ? data.ownFiles : void 0) || [];
    }

    return ScannedTemplate;

  })();

  module.exports = ScannedTemplate;

}).call(this);
