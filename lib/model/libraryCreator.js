(function() {
  var LibraryCreator, LoggableObject, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  LoggableObject = require('../component/utils/logger');

  LibraryCreator = (function(_super) {
    __extends(LibraryCreator, _super);

    LibraryCreator.bundleDefaults = {
      keepSeparate: false,
      dependencies: [],
      directoriesToIgnore: [],
      directoriesToFlatten: [],
      prioritizeFlattenedDirectories: false,
      filePriority: [],
      filesToIgnore: [],
      dynamicallyLoadedFiles: [],
      remoteFiles: []
    };

    function LibraryCreator(name, options) {
      this.name = name;
      this.options = options;
      LibraryCreator.__super__.constructor.call(this, this.name, this.options);
      if (!(_.isString(this.name) && this.name.length > 0)) {
        throw new Error("Name must be defined");
      }
      if (!_.isObject(this.options)) {
        throw new Error("Options must be informed, but got " + (JSON.stringify(this.options)));
      }
    }

    LibraryCreator.prototype.canCreateLibrary = function(libraryId, libraries, options, callback) {
      return callback(null, false);
    };

    LibraryCreator.prototype.createLibrary = function(libraryId, libraries, options, callback) {
      return callback(null, null);
    };

    return LibraryCreator;

  })(LoggableObject);

  module.exports = LibraryCreator;

}).call(this);
