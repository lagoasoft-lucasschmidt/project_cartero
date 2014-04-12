(function() {
  var AssetsProcessor, CssMinAssetsProcessor, Q, fileExtension, fs, mkdirp, path, _,
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

  CssMinAssetsProcessor = (function(_super) {
    __extends(CssMinAssetsProcessor, _super);

    function CssMinAssetsProcessor(grunt, options) {
      this.cssMinViewsFiles = __bind(this.cssMinViewsFiles, this);
      this.cssMinViewsAssets = __bind(this.cssMinViewsAssets, this);
      this.cssMinLibraryFiles = __bind(this.cssMinLibraryFiles, this);
      this.cssMinFilesInLibrary = __bind(this.cssMinFilesInLibrary, this);
      this.cssMinLibraryAssets = __bind(this.cssMinLibraryAssets, this);
      this.run = __bind(this.run, this);
      CssMinAssetsProcessor.__super__.constructor.call(this, "CSS_MIN_ASSETS_PROCESSOR", grunt, options);
    }

    CssMinAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return Q(null).then((function(_this) {
        return function() {
          var promises;
          promises = [];
          promises.push(_this.cssMinLibraryAssets(carteroJSON));
          promises.push(_this.cssMinViewsAssets(carteroJSON));
          return Q.all(promises);
        };
      })(this)).then((function(_this) {
        return function() {
          _this.info({
            msg: "Successfully runned CssMinAssetsProcessor"
          });
          return callback(null, carteroJSON);
        };
      })(this)).fail((function(_this) {
        return function(error) {
          _this.error({
            msg: "rror while trying to run CssMinAssetsProcessor",
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    CssMinAssetsProcessor.prototype.cssMinLibraryAssets = function(carteroJSON) {
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
              _this.cssMinFilesInLibrary(carteroJSON, library, processedLibraries, files);
            }
          }
          return _this.cssMinLibraryFiles(files);
        };
      })(this));
    };

    CssMinAssetsProcessor.prototype.cssMinFilesInLibrary = function(carteroJSON, library, processedLibraries, files) {
      var file, otherLib, otherLibId, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (!_.contains(processedLibraries, library.id)) {
        processedLibraries.push(library.id);
        _ref = library.files;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (file.type === "LOCAL") {
            if (fileExtension(file.path) === "css") {
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
          _results.push(this.cssMinFilesInLibrary(carteroJSON, otherLib, processedLibraries, files));
        }
        return _results;
      }
    };

    CssMinAssetsProcessor.prototype.cssMinLibraryFiles = function(files) {
      this.grunt.config(["cssmin", "project_cartero_cssmin_library_files"], {
        files: files
      });
      this.grunt.task.run("cssmin:project_cartero_cssmin_library_files");
      return this.logger.debug("created cssmin grunt job with options " + (JSON.stringify({
        files: files
      }, null, 2)));
    };

    CssMinAssetsProcessor.prototype.cssMinViewsAssets = function(carteroJSON) {
      return Q.fcall((function(_this) {
        return function() {
          var files, processedLibraries, template, templateId, _ref;
          processedLibraries = [];
          files = [];
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            if (template.ownFiles != null) {
              _this.cssMinViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files);
            }
          }
          return _this.cssMinViewsFiles(files);
        };
      })(this));
    };

    CssMinAssetsProcessor.prototype.cssMinViewFilesInLibrary = function(carteroJSON, library, processedLibraries, files) {
      var file, _i, _len, _ref, _results;
      if (!_.contains(processedLibraries, library.id)) {
        processedLibraries.push(library.id);
        _ref = library.files;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          if (file.type === "LOCAL") {
            if (fileExtension(file.path) === "css") {
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

    CssMinAssetsProcessor.prototype.cssMinViewsFiles = function(files) {
      this.grunt.config(["cssmin", "project_cartero_cssmin_views_files"], {
        files: files
      });
      this.grunt.task.run("cssmin:project_cartero_cssmin_views_files");
      return this.logger.debug("created cssmin grunt job with options " + (JSON.stringify({
        files: files
      }, null, 2)));
    };

    return CssMinAssetsProcessor;

  })(AssetsProcessor);

  module.exports = CssMinAssetsProcessor;

}).call(this);
