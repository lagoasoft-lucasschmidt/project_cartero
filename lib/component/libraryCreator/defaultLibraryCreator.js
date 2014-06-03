(function() {
  var DefaultLibraryCreator, Library, LibraryCreator, LibraryFile, Promise, fileExists, findFilesInFolder, findFilesInFolders, findFoldersInFolder, fs, isFolder, kBundleDefaults, path, readFile, _, _s,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  _s = require('underscore.string');

  fs = require('fs');

  path = require('path');

  Promise = require('bluebird');

  isFolder = require('../utils/isFolder');

  fileExists = require('../utils/fileExists');

  findFilesInFolder = require('../utils/findFilesInFolder');

  findFilesInFolders = require('../utils/findFilesInFolders');

  findFoldersInFolder = require('../utils/findFoldersInFolder');

  readFile = Promise.promisify(fs.readFile, fs);

  LibraryCreator = require('../../model/libraryCreator');

  Library = require('../../model/library');

  LibraryFile = require('../../model/libraryFile');

  kBundleDefaults = LibraryCreator.bundleDefaults;

  DefaultLibraryCreator = (function(_super) {
    __extends(DefaultLibraryCreator, _super);

    function DefaultLibraryCreator(name, options) {
      this.internalCreateSubLibraries = __bind(this.internalCreateSubLibraries, this);
      this.internalCreateLibraryRemoteFiles = __bind(this.internalCreateLibraryRemoteFiles, this);
      this.sortLibraryFiles = __bind(this.sortLibraryFiles, this);
      this.internalCreateLibraryFiles = __bind(this.internalCreateLibraryFiles, this);
      this.internalDiscoverParentLibraries = __bind(this.internalDiscoverParentLibraries, this);
      this.internalCreateDependencies = __bind(this.internalCreateDependencies, this);
      this.internalLoadBundleJSON = __bind(this.internalLoadBundleJSON, this);
      this.createLibrary = __bind(this.createLibrary, this);
      this.canCreateLibrary = __bind(this.canCreateLibrary, this);
      if (_.isUndefined(options)) {
        options = name;
        name = "DEFAULT_LIBRARY_CREATOR";
      }
      DefaultLibraryCreator.__super__.constructor.call(this, name, options);
    }

    DefaultLibraryCreator.prototype.canCreateLibrary = function(libraryId, libraries, options, callback) {
      return isFolder(path.join(options.librariesPath, libraryId)).then((function(_this) {
        return function(isFolder) {
          _this.trace("Can libraryId=" + libraryId + " be handled by " + _this.name + "=" + isFolder);
          return callback(null, isFolder);
        };
      })(this)).error(function(error) {
        return callback(null, false);
      });
    };

    DefaultLibraryCreator.prototype.createLibrary = function(libraryId, libraries, options, callback) {
      var libraryPath;
      libraryPath = this.internalCreateLibraryPath(libraryId, libraries, options);
      this.trace("Trying to create library for id=" + libraryId + ", path=" + libraryPath);
      return this.internalLoadBundleJSON(libraryId, libraryPath, libraries, options).then((function(_this) {
        return function(bundleJSON) {
          var promises;
          promises = [];
          promises.push(_this.internalCreateDependencies(libraryId, libraryPath, libraries, options, bundleJSON));
          promises.push(_this.internalCreateLibraryFiles(libraryId, libraryPath, libraries, options, bundleJSON));
          promises.push(_this.internalCreateLibraryRemoteFiles(libraryId, libraryPath, libraries, options, bundleJSON));
          promises.push(_this.internalCreateSubLibraries(libraryId, libraryPath, libraries, options, bundleJSON));
          return Promise.all(promises).spread(function(dependencies, libraryFiles, libraryRemoteFiles, subLibraries) {
            _this.trace("Correctly calculated everything for library id=" + libraryId);
            return new Library({
              libraryId: libraryId,
              bundleJSON: bundleJSON,
              dependencies: dependencies,
              files: libraryFiles.concat(libraryRemoteFiles),
              options: options
            });
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

    DefaultLibraryCreator.prototype.internalCreateLibraryPath = function(libraryId, libraries, options) {
      return path.join(options.librariesPath, libraryId);
    };

    DefaultLibraryCreator.prototype.internalLoadBundleJSON = function(libraryId, libraryPath, libraries, options) {
      var bundleJSONPath;
      this.trace("Loading bundleJSON for library id=" + libraryId);
      bundleJSONPath = path.join(libraryPath, "bundle.json").toString();
      return fileExists(bundleJSONPath).then((function(_this) {
        return function(exists) {
          _this.trace("Does bundleJSON  exists for library id=" + libraryId + "=" + exists);
          if (!exists) {
            return {};
          } else {
            return readFile(bundleJSONPath, "utf-8").then(function(fileContents) {
              var jsonString;
              _this.trace("Read bundleJSON for library id=" + libraryId);
              jsonString = fileContents.toString();
              return JSON.parse(jsonString);
            }).error(function(error) {
              _this.trace(error.stack || error);
              _this.trace("Error while trying to read bundle.json of library id=" + libraryId);
              return {};
            });
          }
        };
      })(this)).then((function(_this) {
        return function(bundleJSON) {
          _this.trace("Correctly loaded bundleJSON for library id=" + libraryId);
          return _.defaults(bundleJSON, kBundleDefaults);
        };
      })(this));
    };

    DefaultLibraryCreator.prototype.internalCreateDependencies = function(libraryId, libraryPath, libraries, options, bundleJSON) {
      var dependencies, dependency, promises;
      dependencies = this.internalDiscoverParentLibraries(libraryId).concat(bundleJSON.dependencies || []);
      this.trace("Trying to create dependencies for library id=" + libraryId + " with dependencies=" + (JSON.stringify(dependencies)));
      if (!(_.isArray(dependencies) && dependencies.length > 0)) {
        this.trace("No dependencies to create for library id=" + libraryId);
        return [];
      } else {
        promises = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = dependencies.length; _i < _len; _i++) {
            dependency = dependencies[_i];
            _results.push(libraries.getLibrary(dependency));
          }
          return _results;
        })();
        return Promise.all(promises).then((function(_this) {
          return function(results) {
            _this.trace("Correctly created dependencies for library id=" + libraryId);
            return _.map(results, function(result) {
              return result.id;
            });
          };
        })(this));
      }
    };

    DefaultLibraryCreator.prototype.internalDiscoverParentLibraries = function(libraryId) {
      var base, parentDependencies, toRemove;
      if (_s.include(libraryId, "/")) {
        parentDependencies = [];
        base = libraryId;
        while (_s.include(base, "/")) {
          toRemove = _s.strRightBack(base, "/");
          base = _s.strLeft(base, "/" + toRemove);
          parentDependencies.unshift(base);
        }
        return parentDependencies;
      }
      return [];
    };

    DefaultLibraryCreator.prototype.internalCreateLibraryFiles = function(libraryId, libraryPath, libraries, options, bundleJSON) {
      var directoriesToFlatten, folders;
      directoriesToFlatten = _.map(bundleJSON.directoriesToFlatten, function(dir) {
        return path.join(libraryPath, dir).toString();
      });
      if (bundleJSON.prioritizeFlattenedDirectories) {
        folders = [].concat(directoriesToFlatten, [libraryPath]);
      } else {
        folders = [libraryPath].concat(directoriesToFlatten);
      }
      this.trace("Trying to create library files for library id=" + libraryId + " in folders=" + folders);
      return findFilesInFolders(folders, options.libraryFilesExtensions).then((function(_this) {
        return function(filePaths) {
          var dynamicallyLoadedFiles, notIgnoredFiles, sortedFiles;
          dynamicallyLoadedFiles = _.map(bundleJSON.dynamicallyLoadedFiles, function(relativePath) {
            return path.resolve(libraryPath, relativePath);
          });
          filePaths = _.uniq(filePaths.concat(dynamicallyLoadedFiles));
          _this.trace("Found " + filePaths.length + " total of library files in folder of library id=" + libraryId);
          notIgnoredFiles = _.filter(filePaths, function(filePath) {
            return !_.contains(bundleJSON.filesToIgnore, path.relative(libraryPath, filePath));
          });
          sortedFiles = _this.sortLibraryFiles(libraryId, libraryPath, libraries, options, bundleJSON, notIgnoredFiles);
          return _.map(sortedFiles, function(filteredFilePath) {
            return new LibraryFile({
              type: "LOCAL",
              path: filteredFilePath
            });
          });
        };
      })(this));
    };

    DefaultLibraryCreator.prototype.sortLibraryFiles = function(libraryId, libraryPath, libraries, options, bundleJSON, notIgnoredFiles) {
      var notIgnoredRelativeFiles, notSortedRelativeFiles, sortedRelativeFiles;
      if (!(_.isArray(bundleJSON.filePriority) && bundleJSON.filePriority.length > 0)) {
        return notIgnoredFiles;
      }
      notIgnoredRelativeFiles = _.map(notIgnoredFiles, function(filePath) {
        return path.relative(libraryPath, filePath);
      });
      notSortedRelativeFiles = _.difference(notIgnoredRelativeFiles, bundleJSON.filePriority);
      sortedRelativeFiles = _.union(bundleJSON.filePriority, notSortedRelativeFiles);
      return _.map(sortedRelativeFiles, function(relativeFilePath) {
        return path.join(libraryPath, relativeFilePath);
      });
    };

    DefaultLibraryCreator.prototype.internalCreateLibraryRemoteFiles = function(libraryId, libraryPath, libraries, options, bundleJSON) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var remoteFiles;
          _this.trace("Trying to create remote files for library id=" + libraryId);
          remoteFiles = _.map(bundleJSON.remoteFiles, function(remotePath) {
            return new LibraryFile({
              type: "REMOTE",
              path: remotePath
            });
          });
          _this.trace("Created " + remoteFiles.length + " remoteFiles library id=" + libraryId);
          return remoteFiles;
        };
      })(this));
    };

    DefaultLibraryCreator.prototype.internalCreateSubLibraries = function(libraryId, libraryPath, libraries, options, bundleJSON) {
      this.trace("Trying to create sub-libraries for library id=" + libraryId);
      return findFoldersInFolder(libraryPath, /\*./).then((function(_this) {
        return function(folders) {
          var filteredFolders, folder, promises;
          filteredFolders = _.filter(folders, function(folderPath) {
            var relativePath;
            relativePath = path.relative(libraryPath, folderPath);
            return !_.contains(bundleJSON.directoriesToIgnore, relativePath) && !_.contains(bundleJSON.directoriesToFlatten, relativePath);
          });
          promises = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = filteredFolders.length; _i < _len; _i++) {
              folder = filteredFolders[_i];
              _results.push(libraries.getLibrary(path.relative(options.librariesPath, folder)));
            }
            return _results;
          })();
          _this.trace("Trying to create sub-libraries for library id=" + libraryId + " with folders=" + folders + ", " + filteredFolders);
          return Promise.all(promises);
        };
      })(this));
    };

    return DefaultLibraryCreator;

  })(LibraryCreator);

  module.exports = DefaultLibraryCreator;

}).call(this);
