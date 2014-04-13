(function() {
  var AssetsProcessor, BaseConcatFilesAssetsProcessor, Q, calculateViewFilesByType, fileExtension, fs, mkdirp, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  Q = require('q');

  fs = require('fs');

  path = require('path');

  fileExtension = require('../../utils/fileExtension');

  calculateViewFilesByType = require('../../calculateViewFiles/calculateByType');

  AssetsProcessor = require('../../../model/assetsProcessor');

  mkdirp = require('mkdirp');

  BaseConcatFilesAssetsProcessor = (function(_super) {
    __extends(BaseConcatFilesAssetsProcessor, _super);

    function BaseConcatFilesAssetsProcessor(name, extensions, resultExtension, grunt, options) {
      this.extensions = extensions;
      this.resultExtension = resultExtension;
      this.concatTemplatesFiles = __bind(this.concatTemplatesFiles, this);
      this.addFilesToConcatFromLibrary = __bind(this.addFilesToConcatFromLibrary, this);
      this.calculateTemplateViewFilesDestinationPath = __bind(this.calculateTemplateViewFilesDestinationPath, this);
      this.concatFilesInTemplate = __bind(this.concatFilesInTemplate, this);
      this.concatTemplateViewFiles = __bind(this.concatTemplateViewFiles, this);
      this.calculateLibraryPath = __bind(this.calculateLibraryPath, this);
      this.run = __bind(this.run, this);
      BaseConcatFilesAssetsProcessor.__super__.constructor.call(this, name, grunt, options);
      if (!(_.isArray(this.extensions) && this.extensions.length > 0)) {
        throw new Error("Extensions must be informed");
      }
      if (!(_.isString(this.resultExtension) && this.resultExtension.length > 0)) {
        throw new Error("Result Extension must be informed");
      }
      this.separator = grunt.util.linefeed;
    }

    BaseConcatFilesAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return this.concatTemplateViewFiles(carteroJSON).then((function(_this) {
        return function(filesCalculated) {
          _this.debug({
            msg: "Successfully runned " + _this.name
          });
          return callback(null, filesCalculated);
        };
      })(this)).fail((function(_this) {
        return function(error) {
          _this.error({
            msg: "rror while trying to run " + _this.name,
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    BaseConcatFilesAssetsProcessor.prototype.calculateLibraryPath = function(libraryId) {
      return path.resolve(this.options.librariesDestinationPath, "library-assets", libraryId);
    };

    BaseConcatFilesAssetsProcessor.prototype.concatTemplateViewFiles = function(carteroJSON) {
      return Q.fcall((function(_this) {
        return function() {
          var data, file, files, template, templateId, _ref;
          files = {};
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            _this.concatFilesInTemplate(carteroJSON, template, files);
          }
          _this.concatTemplatesFiles((function() {
            var _results;
            _results = [];
            for (file in files) {
              data = files[file];
              _results.push(data);
            }
            return _results;
          })());
          return files;
        };
      })(this));
    };

    BaseConcatFilesAssetsProcessor.prototype.concatFilesInTemplate = function(carteroJSON, template, files) {
      var filesToConcat, opts;
      opts = {
        carteroJSON: carteroJSON,
        web: false,
        fileType: "LOCAL",
        fileExtension: this.resultExtension
      };
      filesToConcat = calculateViewFilesByType(opts)(template);
      if (filesToConcat.length > 0) {
        this.logger.debug("Found the following files for template " + template.filePath + " " + (JSON.stringify(filesToConcat, null, 2)));
        return files[template.filePath] = {
          src: filesToConcat,
          dest: this.calculateTemplateViewFilesDestinationPath(template)
        };
      }
    };

    BaseConcatFilesAssetsProcessor.prototype.calculateTemplateViewFilesDestinationPath = function(template) {
      var concatFileName, newPath;
      concatFileName = path.basename(template.filePath) + '-' + Date.now() + "." + this.resultExtension;
      newPath = path.join(this.options.librariesDestinationPath, "views-assets", path.relative(this.options.templatesPath, template.filePath));
      return path.resolve(newPath, "..", concatFileName);
    };

    BaseConcatFilesAssetsProcessor.prototype.addFilesToConcatFromLibrary = function(library, filesToConcat) {
      var file, isDynamic, libraryPath, _i, _len, _ref, _ref1, _results;
      libraryPath = this.calculateLibraryPath(library.id);
      _ref = library.files;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (!(file.type === "LOCAL")) {
          continue;
        }
        isDynamic = _.contains(library.bundleJSON.dynamicallyLoadedFiles, path.relative(libraryPath, file.path));
        if ((_ref1 = fileExtension(file.path), __indexOf.call(this.extensions, _ref1) >= 0) && !isDynamic) {
          _results.push(filesToConcat.push(file.path));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BaseConcatFilesAssetsProcessor.prototype.concatTemplatesFiles = function(files) {
      var concatOptions;
      concatOptions = {
        files: files,
        options: {
          separator: this.separator
        }
      };
      this.grunt.config(["concat", "project_cartero_concat_" + this.resultExtension + "_views_files"], concatOptions);
      this.grunt.task.run("concat:project_cartero_concat_" + this.resultExtension + "_views_files");
      return this.logger.debug("created concat grunt job with options " + (JSON.stringify(concatOptions, null, 2)));
    };

    return BaseConcatFilesAssetsProcessor;

  })(AssetsProcessor);

  module.exports = BaseConcatFilesAssetsProcessor;

}).call(this);
