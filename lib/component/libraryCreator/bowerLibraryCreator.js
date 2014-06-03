(function() {
  var BowerLibraryCreator, Library, LibraryCreator, LibraryFile, Promise, findBowerDependencies, fs, isFolder, path, readFile, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  fs = require('fs');

  path = require('path');

  Promise = require('bluebird');

  isFolder = require('../utils/isFolder');

  readFile = Promise.promisify(fs.readFile, fs);

  LibraryCreator = require('../../model/libraryCreator');

  Library = require('../../model/library');

  LibraryFile = require('../../model/libraryFile');

  findBowerDependencies = require('bower-files/lib/process-dependencies');

  BowerLibraryCreator = (function(_super) {
    __extends(BowerLibraryCreator, _super);

    function BowerLibraryCreator(options) {
      this.readBowerLibrary = __bind(this.readBowerLibrary, this);
      this.createLibrary = __bind(this.createLibrary, this);
      this.canCreateLibrary = __bind(this.canCreateLibrary, this);
      BowerLibraryCreator.__super__.constructor.call(this, "BOWER_LIBRARY_CREATOR", options);
    }

    BowerLibraryCreator.prototype.canCreateLibrary = function(libraryId, libraries, options, callback) {
      return isFolder(path.join(options.bowerComponentsPath, libraryId)).then((function(_this) {
        return function(isFolder) {
          _this.trace("Can libraryId=" + libraryId + " be handled by " + _this.name + "=" + isFolder);
          return callback(null, isFolder);
        };
      })(this)).error(function(error) {
        return callback(null, false);
      });
    };

    BowerLibraryCreator.prototype.createLibrary = function(libraryId, libraries, options, callback) {
      var libraryPath;
      libraryPath = path.resolve(options.bowerComponentsPath, libraryId);
      this.trace("Trying to create library for id=" + libraryId + ", path=" + libraryPath);
      return this.readBowerLibrary(libraryPath, libraryId, libraries, options).then((function(_this) {
        return function(filesFound) {
          var scannedFiles;
          scannedFiles = _.map(filesFound, function(fileFound) {
            return new LibraryFile({
              type: "BOWER",
              path: fileFound
            });
          });
          _this.trace("Correctly calculated everything for library id=" + libraryId);
          return new Library({
            libraryId: libraryId,
            bundleJSON: _.cloneDeep(LibraryCreator.bundleDefaults),
            dependencies: [],
            files: scannedFiles,
            options: options
          });
        };
      })(this)).then((function(_this) {
        return function(library) {
          _this.trace("Sucessfully created library " + libraryId);
          return callback(null, library);
        };
      })(this)).error((function(_this) {
        return function(error) {
          _this.error({
            msg: "Error while trying to create library id=" + libraryId,
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    BowerLibraryCreator.prototype.readBowerLibrary = function(libraryPath, libraryId, libraries, options) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var fakeDependencies, filesFound;
          fakeDependencies = {};
          fakeDependencies[libraryId] = null;
          filesFound = findBowerDependencies(fakeDependencies, options.bowerComponentsPath);
          _this.debug("Found bower dependencies for " + libraryId + " as " + (JSON.stringify(filesFound, null, 2)));
          if (filesFound.error != null) {
            throw new Error(filesFound.error);
          }
          return filesFound.paths || [];
        };
      })(this));
    };

    return BowerLibraryCreator;

  })(LibraryCreator);

  module.exports = BowerLibraryCreator;

}).call(this);
