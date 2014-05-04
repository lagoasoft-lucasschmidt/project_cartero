(function() {
  var DefaultLibrariesDescriptorBuilder, DefaultScannedTemplatesDescriptorBuilder, DefaultTemplateOwnFilesLibraryCreator, LibrariesDescriptorBuilder, Library, LibraryCreator, Promise, ScannedTemplate, ScannedTemplatesDescriptorBuilder, carteroExtendsRegExp, carteroRequiresRegExp, defaultOptions, findAllFilesBelowFolder, findFilesInFolder, fs, kCarteroExtendsDirective, kCarteroRequiresDirective, path, readFile, _, _s,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  _s = require('underscore.string');

  Promise = require('bluebird');

  fs = require('fs');

  path = require('path');

  findAllFilesBelowFolder = require('../utils/findAllFilesBelowFolder');

  findFilesInFolder = require('../utils/findFilesInFolder');

  readFile = Promise.promisify(fs.readFile);

  LibraryCreator = require('../../model/libraryCreator');

  Library = require('../../model/library');

  ScannedTemplate = require('../../model/scannedTemplate');

  ScannedTemplatesDescriptorBuilder = require('../../model/scannedTemplatesDescriptorBuilder');

  LibrariesDescriptorBuilder = require('../../model/librariesDescriptorBuilder');

  DefaultLibrariesDescriptorBuilder = require('./defaultLibrariesDescriptorBuilder');

  DefaultTemplateOwnFilesLibraryCreator = require('../libraryCreator/defaultTemplateOwnFilesLibraryCreator');

  defaultOptions = {
    templatesPath: "",
    templatesExtensions: /.*\.jade$/,
    templatesOwnFilesExtensions: /.*\.(coffee|js|css|less)$/,
    librariesDescriptorBuilder: DefaultLibrariesDescriptorBuilder,
    templateOwnFilesLibraryCreator: DefaultTemplateOwnFilesLibraryCreator
  };

  kCarteroRequiresDirective = "##cartero_requires";

  kCarteroExtendsDirective = "##cartero_extends";

  carteroRequiresRegExp = /##cartero_requires((\s*['"].*?['"]\s*,?\s*\n?)+)/;

  carteroExtendsRegExp = new RegExp(kCarteroExtendsDirective + " [\"'](.*?)[\"']");

  DefaultScannedTemplatesDescriptorBuilder = (function(_super) {
    __extends(DefaultScannedTemplatesDescriptorBuilder, _super);

    function DefaultScannedTemplatesDescriptorBuilder(options) {
      this.getCalculatedLibraries = __bind(this.getCalculatedLibraries, this);
      this.internalFindOwnFiles = __bind(this.internalFindOwnFiles, this);
      this.internalFindLibraryDependencies = __bind(this.internalFindLibraryDependencies, this);
      this.internalFindIncludedTemplates = __bind(this.internalFindIncludedTemplates, this);
      this.internalFindExtendsDependency = __bind(this.internalFindExtendsDependency, this);
      this.internalScanTemplate = __bind(this.internalScanTemplate, this);
      this.scanTemplates = __bind(this.scanTemplates, this);
      DefaultScannedTemplatesDescriptorBuilder.__super__.constructor.call(this, "SCANNED_TEMPLATES_DESC_BUILDER", options);
      this.options = _.defaults(options, defaultOptions);
      if (!_.isString(this.options.templatesPath) || this.options.templatesPath.length === 0) {
        throw new Error("templatesPath must be specified, otherwise, whats the point?");
      }
      if (!(this.options.templatesExtensions instanceof RegExp)) {
        throw new Error("templatesExtensions must be specified, and a RegExp, otherwise, whats the point?");
      }
      if (!_.isFunction(this.options.templateOwnFilesLibraryCreator)) {
        throw new Error("templateOwnFilesLibraryCreator must be a function");
      }
      this.templateOwnFilesLibraryCreator = new this.options.templateOwnFilesLibraryCreator(this.options);
      if (!(this.templateOwnFilesLibraryCreator instanceof LibraryCreator)) {
        throw new Error("templateOwnFilesLibraryCreator must be a instanceof LibraryCreator");
      }
      if (!_.isFunction(this.options.librariesDescriptorBuilder)) {
        throw new Error("librariesDescriptorBuilder must be a function");
      }
      this.libraries = new this.options.librariesDescriptorBuilder(this.options);
      if (!(this.libraries instanceof LibrariesDescriptorBuilder)) {
        throw new Error("libraries must be a instanceof LibrariesDescriptorBuilder");
      }
      this.templatesCache = {};
    }

    DefaultScannedTemplatesDescriptorBuilder.prototype.scanTemplates = function(callback) {
      return findAllFilesBelowFolder(this.options.templatesPath, this.options.templatesExtensions).then((function(_this) {
        return function(files) {
          var file, promises;
          promises = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              file = files[_i];
              _results.push(this.internalScanTemplate(file));
            }
            return _results;
          }).call(_this);
          return Promise.all(promises);
        };
      })(this)).then(function(scannedTemplates) {
        return callback(null, scannedTemplates);
      }).error((function(_this) {
        return function(error) {
          _this.error({
            msg: "Error while trying to scan templates",
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalScanTemplate = function(file) {
      if (this.templatesCache[file] != null) {
        this.debug("Found template " + file + " already cached");
        return Promise.resolve(this.templatesCache[file]);
      }
      this.trace("Found template " + file + ", will process it");
      return readFile(file, 'utf-8').then((function(_this) {
        return function(data) {
          var fileContents, promises;
          fileContents = data.toString();
          promises = [];
          promises.push(_this.internalFindExtendsDependency(file, fileContents));
          promises.push(_this.internalFindIncludedTemplates(file, fileContents));
          promises.push(_this.internalFindLibraryDependencies(file, fileContents));
          promises.push(_this.internalFindOwnFiles(file, fileContents));
          return Promise.all(promises).spread(function(extend, includes, libraryDependencies, ownFiles) {
            var template;
            template = new ScannedTemplate({
              filePath: file,
              extend: extend,
              includes: includes,
              libraryDependencies: libraryDependencies,
              ownFiles: ownFiles
            });
            _this.templatesCache[file] = template;
            return template;
          });
        };
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalFindExtendsDependency = function(filePath, fileContents) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var carteroExtendsMatches, matches, myRegex, partialMatches;
          carteroExtendsMatches = carteroExtendsRegExp.exec(fileContents);
          if (!_.isNull(carteroExtendsMatches)) {
            return path.join(_this.options.templatesPath, carteroExtendsMatches[1]);
          } else {
            myRegex = /extends\s.*/g;
            matches = [];
            while ((partialMatches = myRegex.exec(fileContents)) !== null) {
              matches.push(partialMatches[0]);
            }
            if (!_.isArray(matches)) {
              return null;
            }
            matches = _.map(matches, function(match) {
              match = _s.strRight(match, "extends ");
              return path.resolve(filePath, "..", match + ".jade");
            });
            matches = _.filter(matches, function(match) {
              return fs.existsSync(match);
            });
            if (matches.length > 0) {
              return matches[0];
            } else {
              return null;
            }
          }
        };
      })(this)).then((function(_this) {
        return function(extend) {
          if (!(extend != null ? extend.length : void 0)) {
            return;
          }
          return _this.internalScanTemplate(extend).then(function() {
            return extend;
          });
        };
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalFindIncludedTemplates = function(filePath, fileContents) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var matches, myRegex, partialMatches;
          myRegex = /include\s.*/g;
          matches = [];
          while ((partialMatches = myRegex.exec(fileContents)) !== null) {
            matches.push(partialMatches[0]);
          }
          if (!_.isArray(matches)) {
            return null;
          }
          matches = _.map(matches, function(match) {
            match = _s.strRight(match, "include ");
            return path.resolve(filePath, "..", match + ".jade");
          });
          return matches = _.filter(matches, function(match) {
            return fs.existsSync(match);
          });
        };
      })(this)).then((function(_this) {
        return function(deps) {
          var dep, promises;
          if (!(deps != null ? deps.length : void 0)) {
            return [];
          }
          promises = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = deps.length; _i < _len; _i++) {
              dep = deps[_i];
              _results.push(this.internalScanTemplate(dep));
            }
            return _results;
          }).call(_this);
          return Promise.all(promises).then(function() {
            return deps;
          });
        };
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalFindLibraryDependencies = function(filePath, fileContents) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var carteroRequiresMatches, directiveParamsString, error, libraryDependencies;
          libraryDependencies = [];
          carteroRequiresMatches = carteroRequiresRegExp.exec(fileContents);
          if (_.isNull(carteroRequiresMatches)) {
            return libraryDependencies;
          }
          directiveParamsString = carteroRequiresMatches[1];
          try {
            libraryDependencies = JSON.parse("[" + directiveParamsString + "]");
          } catch (_error) {
            error = _error;
            _this.error("Requires directive is wrong for filePath=" + filePath + ". Given data is " + directiveParamsString + ". It needs to be parsed as a JSON, if added array brackets around it", {
              error: error
            });
          }
          return libraryDependencies;
        };
      })(this)).then((function(_this) {
        return function(libraryDependencies) {
          var lib, promises;
          promises = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = libraryDependencies.length; _i < _len; _i++) {
              lib = libraryDependencies[_i];
              _results.push(this.libraries.getLibrary(lib));
            }
            return _results;
          }).call(_this);
          return Promise.all(promises).then(function() {
            return libraryDependencies;
          });
        };
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalFindOwnFiles = function(filePath, fileContents) {
      return findFilesInFolder(path.join(filePath, ".."), this.options.templatesOwnFilesExtensions).then((function(_this) {
        return function(filePaths) {
          var createOpts, deferred;
          deferred = Promise.defer();
          createOpts = _.defaults({
            ownFiles: filePaths || []
          }, _this.options);
          _this.templateOwnFilesLibraryCreator.createLibrary(filePath, _this.libraries, createOpts, function(error, newLibrary) {
            if (error) {
              return deferred.reject(new Error(error));
            } else {
              return deferred.resolve(newLibrary);
            }
          });
          return deferred.promise;
        };
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.getCalculatedLibraries = function() {
      return this.libraries.getCalculatedLibraries();
    };

    return DefaultScannedTemplatesDescriptorBuilder;

  })(ScannedTemplatesDescriptorBuilder);

  module.exports = DefaultScannedTemplatesDescriptorBuilder;

}).call(this);
