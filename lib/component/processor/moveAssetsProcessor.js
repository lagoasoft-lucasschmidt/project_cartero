(function() {
  var AssetsProcessor, MoveAssetsProcessor, Promise, fs, mkdirp, path, readCarteroJSON, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Promise = require('bluebird');

  fs = require('fs');

  path = require('path');

  readCarteroJSON = require('../utils/readCarteroJSON');

  AssetsProcessor = require('../../model/assetsProcessor');

  mkdirp = require('mkdirp');

  MoveAssetsProcessor = (function(_super) {
    __extends(MoveAssetsProcessor, _super);

    function MoveAssetsProcessor(grunt, options) {
      this.copyViewsFiles = __bind(this.copyViewsFiles, this);
      this.moveViewFilesInLibrary = __bind(this.moveViewFilesInLibrary, this);
      this.moveViewsAssets = __bind(this.moveViewsAssets, this);
      this.copyLibraryFiles = __bind(this.copyLibraryFiles, this);
      this.moveFilesInLibrary = __bind(this.moveFilesInLibrary, this);
      this.moveLibraryAssets = __bind(this.moveLibraryAssets, this);
      this.run = __bind(this.run, this);
      MoveAssetsProcessor.__super__.constructor.call(this, "MOVE_ASSETS_PROCESSOR", grunt, options);
    }

    MoveAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var promises;
          promises = [];
          promises.push(_this.moveLibraryAssets(carteroJSON));
          promises.push(_this.moveViewsAssets(carteroJSON));
          return Promise.all(promises);
        };
      })(this)).then((function(_this) {
        return function() {
          _this.debug({
            msg: "Successfully runned MoveAssetsProcessor"
          });
          return callback(null, carteroJSON);
        };
      })(this)).error((function(_this) {
        return function(error) {
          _this.error({
            msg: "Error while trying to run MoveAssetsProcessor",
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    MoveAssetsProcessor.prototype.moveLibraryAssets = function(carteroJSON) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var files, library, libraryId, processedLibraries, template, templateId, _i, _len, _ref, _ref1;
          processedLibraries = [];
          files = [];
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            _ref1 = template.libraryDependencies;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              libraryId = _ref1[_i];
              library = carteroJSON.libraries[libraryId];
              _this.moveFilesInLibrary(carteroJSON, library, processedLibraries, files);
            }
          }
          return _this.copyLibraryFiles(files);
        };
      })(this));
    };

    MoveAssetsProcessor.prototype.moveFilesInLibrary = function(carteroJSON, library, processedLibraries, files) {
      var file, newPath, otherLib, otherLibId, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (!_.contains(processedLibraries, library.id)) {
        processedLibraries.push(library.id);
        _ref = library.files;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (!(file.type === "LOCAL")) {
            continue;
          }
          newPath = path.join(this.options.librariesDestinationPath, "library-assets", path.relative(this.options.librariesPath, file.path));
          files.push({
            src: file.path,
            dest: newPath
          });
          file.path = newPath;
        }
        _ref1 = library.dependencies;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          otherLibId = _ref1[_j];
          otherLib = carteroJSON.libraries[otherLibId];
          _results.push(this.moveFilesInLibrary(carteroJSON, otherLib, processedLibraries, files));
        }
        return _results;
      }
    };

    MoveAssetsProcessor.prototype.copyLibraryFiles = function(files) {
      var copyOptions;
      copyOptions = {
        files: files
      };
      this.grunt.config(["copy", "project_cartero_move_library_files"], copyOptions);
      this.grunt.task.run("copy:project_cartero_move_library_files");
      return this.logger.debug("created copy grunt job with options " + (JSON.stringify(copyOptions, null, 2)));
    };

    MoveAssetsProcessor.prototype.moveViewsAssets = function(carteroJSON) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var files, processedLibraries, template, templateId, _ref;
          processedLibraries = [];
          files = [];
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            if (template.ownFiles != null) {
              _this.moveViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files);
            }
          }
          return _this.copyViewsFiles(files);
        };
      })(this));
    };

    MoveAssetsProcessor.prototype.moveViewFilesInLibrary = function(carteroJSON, library, processedLibraries, files) {
      var file, newPath, _i, _len, _ref, _results;
      if (!_.contains(processedLibraries, library.id)) {
        processedLibraries.push(library.id);
        _ref = library.files;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (!(file.type === "LOCAL")) {
            continue;
          }
          newPath = path.join(this.options.librariesDestinationPath, "views-assets", path.relative(this.options.templatesPath, file.path));
          files.push({
            src: file.path,
            dest: newPath
          });
          _results.push(file.path = newPath);
        }
        return _results;
      }
    };

    MoveAssetsProcessor.prototype.copyViewsFiles = function(files) {
      var copyOptions;
      copyOptions = {
        files: files
      };
      this.grunt.config(["copy", "project_cartero_move_views_files"], copyOptions);
      this.grunt.task.run("copy:project_cartero_move_views_files");
      return this.logger.debug("created copy grunt job with options " + (JSON.stringify(copyOptions, null, 2)));
    };

    return MoveAssetsProcessor;

  })(AssetsProcessor);

  module.exports = MoveAssetsProcessor;

}).call(this);
