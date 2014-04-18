(function() {
  var AssetsProcessor, GruntAssetsProcessor, Q, fileExtension, fs, mkdirp, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Q = require('q');

  fs = require('fs');

  path = require('path');

  fileExtension = require('../utils/fileExtension');

  AssetsProcessor = require('../../model/assetsProcessor');

  mkdirp = require('mkdirp');

  GruntAssetsProcessor = (function(_super) {
    __extends(GruntAssetsProcessor, _super);

    function GruntAssetsProcessor(processorOptions, grunt, options) {
      this.deleteSrcFiles = __bind(this.deleteSrcFiles, this);
      this.gruntCompileViewsFiles = __bind(this.gruntCompileViewsFiles, this);
      this.gruntCompileViewsAssets = __bind(this.gruntCompileViewsAssets, this);
      this.gruntCompileLibraryFiles = __bind(this.gruntCompileLibraryFiles, this);
      this.gruntCompileFilesInLibrary = __bind(this.gruntCompileFilesInLibrary, this);
      this.gruntCompileLibraryAssets = __bind(this.gruntCompileLibraryAssets, this);
      this.run = __bind(this.run, this);
      GruntAssetsProcessor.__super__.constructor.call(this, "GRUNT_ASSETS_PROCESSOR", grunt, options);
      this.destExt = processorOptions.destExt;
      this.fileExt = processorOptions.fileExt;
      this.task = processorOptions.task;
      this.clean = processorOptions.clean;
    }

    GruntAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return Q(null).then((function(_this) {
        return function() {
          var promises;
          promises = [];
          promises.push(_this.gruntCompileLibraryAssets(carteroJSON));
          promises.push(_this.gruntCompileViewsAssets(carteroJSON));
          return Q.all(promises);
        };
      })(this)).spread((function(_this) {
        return function(filesToDelete, otherFilesToDelete) {
          filesToDelete = filesToDelete.concat(otherFilesToDelete);
          _this.deleteSrcFiles(filesToDelete);
          _this.debug({
            msg: "Successfully runned GruntAssetsProcessor"
          });
          return callback(null, carteroJSON);
        };
      })(this)).fail((function(_this) {
        return function(error) {
          _this.error({
            msg: "rror while trying to run GruntAssetsProcessor",
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    GruntAssetsProcessor.prototype.renameDestinationFile = function(filePath) {
      var newPath;
      newPath = path.resolve(filePath, '..');
      return path.resolve(newPath, path.basename(filePath, "." + this.fileExt) + ("." + this.destExt));
    };

    GruntAssetsProcessor.prototype.gruntCompileLibraryAssets = function(carteroJSON) {
      return Q.fcall((function(_this) {
        return function() {
          var file, files, library, libraryId, processedLibraries, template, templateId, _i, _len, _ref, _ref1;
          processedLibraries = [];
          files = [];
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            _ref1 = template.libraryDependencies;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              libraryId = _ref1[_i];
              library = carteroJSON.libraries[libraryId];
              _this.gruntCompileFilesInLibrary(carteroJSON, library, processedLibraries, files);
            }
          }
          _this.gruntCompileLibraryFiles(files);
          return (function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
              file = files[_j];
              _results.push(file.src);
            }
            return _results;
          })();
        };
      })(this));
    };

    GruntAssetsProcessor.prototype.gruntCompileFilesInLibrary = function(carteroJSON, library, processedLibraries, files) {
      var dest, file, index, otherLib, otherLibId, relativeLibPath, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (!_.contains(processedLibraries, library.id)) {
        processedLibraries.push(library.id);
        _ref = library.files;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (file.type === "LOCAL") {
            if (fileExtension(file.path) === this.fileExt) {
              dest = this.renameDestinationFile(file.path);
              files.push({
                src: file.path,
                dest: dest
              });
              relativeLibPath = path.relative(path.resolve(this.options.librariesDestinationPath, "library-assets", library.id), file.path);
              if (_.contains(library.bundleJSON.dynamicallyLoadedFiles, relativeLibPath)) {
                index = library.bundleJSON.dynamicallyLoadedFiles.indexOf(relativeLibPath);
                library.bundleJSON.dynamicallyLoadedFiles[index] = path.relative(path.resolve(this.options.librariesDestinationPath, "library-assets", library.id), dest);
              }
              file.path = dest;
            }
          }
        }
        _ref1 = library.dependencies;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          otherLibId = _ref1[_j];
          otherLib = carteroJSON.libraries[otherLibId];
          _results.push(this.gruntCompileFilesInLibrary(carteroJSON, otherLib, processedLibraries, files));
        }
        return _results;
      }
    };

    GruntAssetsProcessor.prototype.gruntCompileLibraryFiles = function(files) {
      this.grunt.config([this.task, "project_cartero_" + this.task + "_library_files"], {
        files: files
      });
      this.grunt.task.run("" + this.task + ":project_cartero_" + this.task + "_library_files");
      return this.logger.debug("created " + this.task + " grunt job with options " + (JSON.stringify({
        files: files
      }, null, 2)));
    };

    GruntAssetsProcessor.prototype.gruntCompileViewsAssets = function(carteroJSON) {
      return Q.fcall((function(_this) {
        return function() {
          var file, files, processedLibraries, template, templateId, _ref;
          processedLibraries = [];
          files = [];
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            if (template.ownFiles != null) {
              _this.gruntCompileViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files);
            }
          }
          _this.gruntCompileViewsFiles(files);
          return (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              file = files[_i];
              _results.push(file.src);
            }
            return _results;
          })();
        };
      })(this));
    };

    GruntAssetsProcessor.prototype.gruntCompileViewFilesInLibrary = function(carteroJSON, library, processedLibraries, files) {
      var dest, file, _i, _len, _ref, _results;
      if (!_.contains(processedLibraries, library.id)) {
        processedLibraries.push(library.id);
        _ref = library.files;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (file.type === "LOCAL") {
            if (fileExtension(file.path) === this.fileExt) {
              dest = this.renameDestinationFile(file.path);
              files.push({
                src: file.path,
                dest: dest
              });
              _results.push(file.path = dest);
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      }
    };

    GruntAssetsProcessor.prototype.gruntCompileViewsFiles = function(files) {
      this.grunt.config([this.task, "project_cartero_" + this.task + "_views_files"], {
        files: files
      });
      this.grunt.task.run("" + this.task + ":project_cartero_" + this.task + "_views_files");
      return this.logger.debug("created " + this.task + " grunt job with options " + (JSON.stringify({
        files: files
      }, null, 2)));
    };

    GruntAssetsProcessor.prototype.deleteSrcFiles = function(files) {
      if (!this.clean) {
        return;
      }
      this.grunt.config(["clean", "project_cartero_clean_" + this.task + "_files"], files);
      this.grunt.task.run("clean:project_cartero_clean_" + this.task + "_files");
      return this.logger.debug("created clean grunt job with options " + (JSON.stringify(files, null, 2)));
    };

    return GruntAssetsProcessor;

  })(AssetsProcessor);

  module.exports = GruntAssetsProcessor;

}).call(this);
