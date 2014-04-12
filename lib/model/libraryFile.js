(function() {
  var LibraryFile, availableTypes, _;

  _ = require('lodash');

  availableTypes = ["LOCAL", "REMOTE"];

  LibraryFile = (function() {
    function LibraryFile(data) {
      this.type = data != null ? data.type : void 0;
      if (!_.contains(availableTypes, this.type)) {
        throw new Error("File type must be specified and in " + availableTypes);
      }
      this.path = data != null ? data.path : void 0;
      if (!(_.isString(this.path) && this.path.length > 0)) {
        throw new Error("File path must be specified");
      }
    }

    return LibraryFile;

  })();

  module.exports = LibraryFile;

}).call(this);
