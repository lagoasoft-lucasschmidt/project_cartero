(function() {
  var AssetsProcessor, ConcatFilesAssetsProcessor, Q, fileExtension, fs, mkdirp, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  Q = require('q');

  fs = require('fs');

  path = require('path');

  fileExtension = require('../../utils/fileExtension');

  AssetsProcessor = require('../../../model/assetsProcessor');

  mkdirp = require('mkdirp');

  ConcatFilesAssetsProcessor = (function(_super) {
    __extends(ConcatFilesAssetsProcessor, _super);

    function ConcatFilesAssetsProcessor(name, extensions, resultExtension, grunt, options) {
      this.extensions = extensions;
      this.resultExtension = resultExtension;
      this.concatTemplatesFiles = __bind(this.concatTemplatesFiles, this);
      this.addFilesToConcatFromLibrary = __bind(this.addFilesToConcatFromLibrary, this);
      this.calculateTemplateViewFilesDestinationPath = __bind(this.calculateTemplateViewFilesDestinationPath, this);
      this.concatFilesInTemplate = __bind(this.concatFilesInTemplate, this);
      this.concatTemplateViewFiles = __bind(this.concatTemplateViewFiles, this);
      this.deleteSrcFiles = __bind(this.deleteSrcFiles, this);
      this.concatLibrariesFiles = __bind(this.concatLibrariesFiles, this);
      this.concatFilesInSubLibrary = __bind(this.concatFilesInSubLibrary, this);
      this.concatFilesInLibrary = __bind(this.concatFilesInLibrary, this);
      this.calculateLibraryPath = __bind(this.calculateLibraryPath, this);
      this.concatLibraries = __bind(this.concatLibraries, this);
      this.run = __bind(this.run, this);
      ConcatFilesAssetsProcessor.__super__.constructor.call(this, name, grunt, options);
      if (!(_.isArray(this.extensions) && this.extensions.length > 0)) {
        throw new Error("Extensions must be informed");
      }
      if (!(_.isString(this.resultExtension) && this.resultExtension.length > 0)) {
        throw new Error("Result Extension must be informed");
      }
      this.separator = grunt.util.linefeed;
    }

    ConcatFilesAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      var filesToDelete;
      filesToDelete = [];
      return this.concatLibraries(carteroJSON).then((function(_this) {
        return function(toDelete) {
          filesToDelete = filesToDelete.concat(toDelete);
          return _this.concatTemplateViewFiles(carteroJSON);
        };
      })(this)).then((function(_this) {
        return function(toDelete) {
          filesToDelete = filesToDelete.concat(toDelete);
          _this.deleteSrcFiles(_.uniq(filesToDelete));
          _this.info({
            msg: "Successfully runned " + _this.name
          });
          return callback(null, carteroJSON);
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

    ConcatFilesAssetsProcessor.prototype.concatLibraries = function(carteroJSON) {
      return Q.fcall((function(_this) {
        return function() {
          var data, file, files, filesToDelete, library, libraryId, _ref;
          files = {};
          _ref = carteroJSON.libraries;
          for (libraryId in _ref) {
            library = _ref[libraryId];
            _this.concatFilesInLibrary(carteroJSON, library, files);
          }
          _this.concatLibrariesFiles((function() {
            var _results;
            _results = [];
            for (file in files) {
              data = files[file];
              _results.push(data);
            }
            return _results;
          })());
          _this.rearrangeLibraries(carteroJSON, files);
          filesToDelete = [];
          for (file in files) {
            data = files[file];
            filesToDelete = filesToDelete.concat(data.src);
          }
          return filesToDelete;
        };
      })(this));
    };

    ConcatFilesAssetsProcessor.prototype.calculateLibraryPath = function(libraryId) {
      return path.resolve(this.options.librariesDestinationPath, "library-assets", libraryId);
    };

    ConcatFilesAssetsProcessor.prototype.concatFilesInLibrary = function(carteroJSON, library, files) {
      var concatFileName, dest, file, filesToConcat, isDynamic, libraryPath, otherLib, otherLibId, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      if (library.bundleJSON.keepSeparate) {
        return;
      }
      this.logger.debug("Trying to concat files in library id=" + library.id);
      libraryPath = this.calculateLibraryPath(library.id);
      filesToConcat = [];
      _ref = library.bundleJSON.dependencies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        otherLibId = _ref[_i];
        otherLib = carteroJSON.libraries[otherLibId];
        if (otherLib != null) {
          this.concatFilesInSubLibrary(carteroJSON, otherLib, filesToConcat);
        }
      }
      _ref1 = library.files;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        file = _ref1[_j];
        if (!(file.type === "LOCAL")) {
          continue;
        }
        isDynamic = _.contains(library.bundleJSON.dynamicallyLoadedFiles, path.relative(libraryPath, file.path));
        if ((_ref2 = fileExtension(file.path), __indexOf.call(this.extensions, _ref2) >= 0) && !isDynamic) {
          filesToConcat.push(file.path);
        }
      }
      if (filesToConcat.length > 1) {
        concatFileName = library.id.replace(/\//g, "_") + '-' + Date.now() + "." + this.resultExtension;
        dest = path.resolve(libraryPath, concatFileName);
        return files[library.id] = {
          src: filesToConcat,
          dest: dest
        };
      }
    };

    ConcatFilesAssetsProcessor.prototype.concatFilesInSubLibrary = function(carteroJSON, library, filesToConcat) {
      var file, isDynamic, libraryPath, otherLib, otherLibId, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
      if (library.bundleJSON.keepSeparate) {
        return;
      }
      libraryPath = this.calculateLibraryPath(library.id);
      _ref = library.dependencies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        otherLibId = _ref[_i];
        otherLib = carteroJSON.libraries[otherLibId];
        this.concatFilesInSubLibrary(carteroJSON, otherLib, filesToConcat);
      }
      _ref1 = library.files;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        file = _ref1[_j];
        if (!(file.type === "LOCAL")) {
          continue;
        }
        isDynamic = _.contains(library.bundleJSON.dynamicallyLoadedFiles, path.relative(libraryPath, file.path));
        if ((_ref2 = fileExtension(file.path), __indexOf.call(this.extensions, _ref2) >= 0) && !isDynamic) {
          _results.push(filesToConcat.push(file.path));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ConcatFilesAssetsProcessor.prototype.concatLibrariesFiles = function(files) {
      var concatOptions;
      concatOptions = {
        files: files,
        options: {
          separator: this.separator
        }
      };
      this.grunt.config(["concat", "project_cartero_concat_" + this.resultExtension + "_library_files"], concatOptions);
      this.grunt.task.run("concat:project_cartero_concat_" + this.resultExtension + "_library_files");
      return this.logger.debug("created concat grunt job with options " + (JSON.stringify(concatOptions, null, 2)));
    };

    ConcatFilesAssetsProcessor.prototype.rearrangeLibraries = function(carteroJSON, files) {
      var data, library, libraryId, _results;
      _results = [];
      for (libraryId in files) {
        data = files[libraryId];
        library = carteroJSON.libraries[libraryId];
        library.dependencies = _.filter(library.dependencies, function(dependency) {
          var dependencyLib;
          dependencyLib = carteroJSON.libraries[dependency];
          return dependencyLib.bundleJSON.dynamicallyLoadedFiles.length > 0 || dependencyLib.bundleJSON.keepSeparate;
        });
        library.files = _.filter(library.files, function(file) {
          return !_.contains(data.src, file.path);
        });
        _results.push(library.files.push({
          type: 'LOCAL',
          path: data.dest
        }));
      }
      return _results;
    };

    ConcatFilesAssetsProcessor.prototype.deleteSrcFiles = function(files) {
      this.grunt.config(["clean", "project_cartero_clean_concat_" + this.resultExtension + "_files"], files);
      this.grunt.task.run("clean:project_cartero_clean_concat_" + this.resultExtension + "_files");
      return this.logger.debug("created clean grunt job with options " + (JSON.stringify(files, null, 2)));
    };

    ConcatFilesAssetsProcessor.prototype.concatTemplateViewFiles = function(carteroJSON) {
      return Q.fcall((function(_this) {
        return function() {
          var data, file, files, filesToDelete, include, template, templateId, _i, _len, _ref, _ref1, _ref2;
          files = {};
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            _this.concatFilesInTemplate(carteroJSON, template, files);
          }
          _ref1 = carteroJSON.templates;
          for (templateId in _ref1) {
            template = _ref1[templateId];
            data = files[template.filePath] || {
              src: [],
              dest: _this.calculateTemplateViewFilesDestinationPath(template)
            };
            if ((template["extends"] != null) && (files[template["extends"]] != null)) {
              data.src = files[template["extends"]].src.concat(data.src);
            }
            if (template.includes != null) {
              _ref2 = template.includes;
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                include = _ref2[_i];
                if (files[include] != null) {
                  data.src = data.src.concat(files[include].src);
                }
              }
            }
            if (data.src.length > 0) {
              files[templateId] = data;
            }
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
          _this.rearrangeTemplates(carteroJSON, files);
          filesToDelete = [];
          for (file in files) {
            data = files[file];
            filesToDelete = filesToDelete.concat(data.src);
          }
          return filesToDelete;
        };
      })(this));
    };

    ConcatFilesAssetsProcessor.prototype.concatFilesInTemplate = function(carteroJSON, template, files) {
      var file, filesToConcat, libraryId, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      filesToConcat = [];
      _ref = template.libraryDependencies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        libraryId = _ref[_i];
        this.addFilesToConcatFromLibrary(carteroJSON.libraries[libraryId], filesToConcat);
      }
      if (template.ownFiles != null) {
        _ref1 = template.ownFiles.files;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          file = _ref1[_j];
          if (file.type === "LOCAL" && (_ref2 = fileExtension(file.path), __indexOf.call(this.extensions, _ref2) >= 0)) {
            filesToConcat.push(file.path);
          }
        }
      }
      if (filesToConcat.length > 0) {
        return files[template.filePath] = {
          src: filesToConcat,
          dest: this.calculateTemplateViewFilesDestinationPath(template)
        };
      }
    };

    ConcatFilesAssetsProcessor.prototype.calculateTemplateViewFilesDestinationPath = function(template) {
      var concatFileName, newPath;
      concatFileName = path.basename(template.filePath) + '-' + Date.now() + "." + this.resultExtension;
      newPath = path.join(this.options.librariesDestinationPath, "views-assets", path.relative(this.options.templatesPath, template.filePath));
      return path.resolve(newPath, "..", concatFileName);
    };

    ConcatFilesAssetsProcessor.prototype.addFilesToConcatFromLibrary = function(library, filesToConcat) {
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

    ConcatFilesAssetsProcessor.prototype.concatTemplatesFiles = function(files) {
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

    ConcatFilesAssetsProcessor.prototype.rearrangeTemplates = function(carteroJSON, files) {
      var data, template, templateId, _results;
      _results = [];
      for (templateId in files) {
        data = files[templateId];
        template = carteroJSON.templates[templateId];
        template.joinedFiles = template.joinedFiles || [];
        _results.push(template.joinedFiles.push({
          type: 'LOCAL',
          path: data.dest
        }));
      }
      return _results;
    };

    return ConcatFilesAssetsProcessor;

  })(AssetsProcessor);

  module.exports = ConcatFilesAssetsProcessor;

}).call(this);
