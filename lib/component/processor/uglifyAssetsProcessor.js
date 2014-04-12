(function() {
  var AssetsProcessor, Q, UglifyAssetsProcessor, fileExtension, fs, mkdirp, path, _,
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

  UglifyAssetsProcessor = (function(_super) {
    __extends(UglifyAssetsProcessor, _super);

    function UglifyAssetsProcessor(grunt, options) {
      this.uglifyViewsFiles = __bind(this.uglifyViewsFiles, this);
      this.uglifyViewsAssets = __bind(this.uglifyViewsAssets, this);
      this.uglifyLibraryFiles = __bind(this.uglifyLibraryFiles, this);
      this.uglifyFilesInLibrary = __bind(this.uglifyFilesInLibrary, this);
      this.uglifyLibraryAssets = __bind(this.uglifyLibraryAssets, this);
      this.run = __bind(this.run, this);
      UglifyAssetsProcessor.__super__.constructor.call(this, "UGLIFY_ASSETS_PROCESSOR", grunt, options);
    }

    UglifyAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return Q(null).then((function(_this) {
        return function() {
          var promises;
          promises = [];
          promises.push(_this.uglifyLibraryAssets(carteroJSON));
          promises.push(_this.uglifyViewsAssets(carteroJSON));
          return Q.all(promises);
        };
      })(this)).then((function(_this) {
        return function() {
          _this.info({
            msg: "Successfully runned UglifyAssetsProcessor"
          });
          return callback(null, carteroJSON);
        };
      })(this)).fail((function(_this) {
        return function(error) {
          _this.error({
            msg: "rror while trying to run UglifyAssetsProcessor",
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    UglifyAssetsProcessor.prototype.uglifyLibraryAssets = function(carteroJSON) {
      return Q.fcall((function(_this) {
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
              _this.uglifyFilesInLibrary(carteroJSON, library, processedLibraries, files);
            }
          }
          return _this.uglifyLibraryFiles(files);
        };
      })(this));
    };

    UglifyAssetsProcessor.prototype.uglifyFilesInLibrary = function(carteroJSON, library, processedLibraries, files) {
      var file, otherLib, otherLibId, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (!_.contains(processedLibraries, library.id)) {
        processedLibraries.push(library.id);
        _ref = library.files;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (file.type === "LOCAL") {
            if (fileExtension(file.path) === "js") {
              files.push({
                src: file.path,
                dest: file.path
              });
            }
          }
        }
        _ref1 = library.dependencies;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          otherLibId = _ref1[_j];
          otherLib = carteroJSON.libraries[otherLibId];
          _results.push(this.uglifyFilesInLibrary(carteroJSON, otherLib, processedLibraries, files));
        }
        return _results;
      }
    };

    UglifyAssetsProcessor.prototype.uglifyLibraryFiles = function(files) {
      this.grunt.config(["uglify", "project_cartero_uglify_library_files"], {
        files: files
      });
      this.grunt.task.run("uglify:project_cartero_uglify_library_files");
      return this.logger.debug("created uglify grunt job with options " + (JSON.stringify({
        files: files
      }, null, 2)));
    };

    UglifyAssetsProcessor.prototype.uglifyViewsAssets = function(carteroJSON) {
      return Q.fcall((function(_this) {
        return function() {
          var files, processedLibraries, template, templateId, _ref;
          processedLibraries = [];
          files = [];
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            if (template.ownFiles != null) {
              _this.uglifyViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files);
            }
          }
          return _this.uglifyViewsFiles(files);
        };
      })(this));
    };

    UglifyAssetsProcessor.prototype.uglifyViewFilesInLibrary = function(carteroJSON, library, processedLibraries, files) {
      var file, _i, _len, _ref, _results;
      if (!_.contains(processedLibraries, library.id)) {
        processedLibraries.push(library.id);
        _ref = library.files;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (file.type === "LOCAL") {
            if (fileExtension(file.path) === "js") {
              _results.push(files.push({
                src: file.path,
                dest: file.path
              }));
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      }
    };

    UglifyAssetsProcessor.prototype.uglifyViewsFiles = function(files) {
      this.grunt.config(["uglify", "project_cartero_uglify_views_files"], {
        files: files
      });
      this.grunt.task.run("uglify:project_cartero_uglify_views_files");
      return this.logger.debug("created uglify grunt job with options " + (JSON.stringify({
        files: files
      }, null, 2)));
    };

    return UglifyAssetsProcessor;

  })(AssetsProcessor);

  module.exports = UglifyAssetsProcessor;

}).call(this);
