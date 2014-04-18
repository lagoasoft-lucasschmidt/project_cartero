(function() {
  var DefaultLibrariesDescriptorBuilder, DefaultScannedTemplatesDescriptorBuilder, DefaultTemplateOwnFilesLibraryCreator, DefaultTemplatesDescriptorBuilder, LibrariesDescriptorBuilder, Library, LibraryCreator, Q, ScannedTemplate, ScannedTemplatesDescriptorBuilder, Template, TemplatesDescriptorBuilder, defaultOptions, fs, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Q = require('q');

  fs = require('fs');

  path = require('path');

  DefaultLibrariesDescriptorBuilder = require('./defaultLibrariesDescriptorBuilder');

  DefaultScannedTemplatesDescriptorBuilder = require('./defaultScannedTemplatesDescriptorBuilder');

  DefaultTemplateOwnFilesLibraryCreator = require('../libraryCreator/defaultTemplateOwnFilesLibraryCreator');

  TemplatesDescriptorBuilder = require('../../model/templatesDescriptorBuilder');

  ScannedTemplatesDescriptorBuilder = require('../../model/scannedTemplatesDescriptorBuilder');

  LibrariesDescriptorBuilder = require('../../model/librariesDescriptorBuilder');

  LibraryCreator = require('../../model/libraryCreator');

  Library = require('../../model/library');

  Template = require('../../model/template');

  ScannedTemplate = require('../../model/scannedTemplate');

  defaultOptions = {
    templateOwnFilesLibraryCreator: DefaultTemplateOwnFilesLibraryCreator,
    scannedTemplatesDescriptorBuilder: DefaultScannedTemplatesDescriptorBuilder,
    librariesDescriptorBuilder: DefaultLibrariesDescriptorBuilder
  };

  DefaultTemplatesDescriptorBuilder = (function(_super) {
    __extends(DefaultTemplatesDescriptorBuilder, _super);

    function DefaultTemplatesDescriptorBuilder(options) {
      this.internalCreateTemplateOwnFilesLibrary = __bind(this.internalCreateTemplateOwnFilesLibrary, this);
      this.internalCreateTemplateIncludeDependencies = __bind(this.internalCreateTemplateIncludeDependencies, this);
      this.internalCreateTemplateLibraryDependencies = __bind(this.internalCreateTemplateLibraryDependencies, this);
      this.internalBuildTemplateDescriptor = __bind(this.internalBuildTemplateDescriptor, this);
      this.buildTemplatesDescriptors = __bind(this.buildTemplatesDescriptors, this);
      DefaultTemplatesDescriptorBuilder.__super__.constructor.call(this, "DEFAULT_TEMPLATES_DESC_BUILDER", options);
      this.options = _.defaults(options, defaultOptions);
      if (!_.isFunction(this.options.templateOwnFilesLibraryCreator)) {
        throw new Error("templateOwnFilesLibraryCreator must be a function");
      }
      this.templateOwnFilesLibraryCreator = new this.options.templateOwnFilesLibraryCreator(this.options);
      if (!(this.templateOwnFilesLibraryCreator instanceof LibraryCreator)) {
        throw new Error("templateOwnFilesLibraryCreator must be a instanceof LibraryCreator");
      }
      if (!_.isFunction(this.options.scannedTemplatesDescriptorBuilder)) {
        throw new Error("scannedTemplatesDescriptorBuilder must be a function");
      }
      this.scanner = new this.options.scannedTemplatesDescriptorBuilder(this.options);
      if (!(this.scanner instanceof ScannedTemplatesDescriptorBuilder)) {
        throw new Error("scannedTemplatesDescriptorBuilder must be a instanceof ScannedTemplatesDescriptorBuilder");
      }
      if (!_.isFunction(this.options.librariesDescriptorBuilder)) {
        throw new Error("librariesDescriptorBuilder must be a function");
      }
      this.libraries = new this.options.librariesDescriptorBuilder(this.options);
      if (!(this.libraries instanceof LibrariesDescriptorBuilder)) {
        throw new Error("libraries must be a instanceof LibrariesDescriptorBuilder");
      }
      this.scannedTemplatesMap = {};
      this.templatesMap = {};
    }

    DefaultTemplatesDescriptorBuilder.prototype.buildTemplatesDescriptors = function(callback) {
      this.debug("Will build template descriptors");
      return Q.nfcall(this.scanner.scanTemplates).then((function(_this) {
        return function(scannedTemplates) {
          var promises, scannedTemplate, _i, _len;
          _this.debug("Created scannedTemplates, now, will build real templates descriptions");
          for (_i = 0, _len = scannedTemplates.length; _i < _len; _i++) {
            scannedTemplate = scannedTemplates[_i];
            _this.scannedTemplatesMap[scannedTemplate.filePath] = scannedTemplate;
          }
          _this.debug("ScannedTemplates " + (_.keys(_this.scannedTemplatesMap).length) + "=" + (JSON.stringify(_.keys(_this.scannedTemplatesMap), null, 2)));
          promises = (function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = scannedTemplates.length; _j < _len1; _j++) {
              scannedTemplate = scannedTemplates[_j];
              _results.push(this.internalBuildTemplateDescriptor(scannedTemplate));
            }
            return _results;
          }).call(_this);
          return Q.all(promises);
        };
      })(this)).then((function(_this) {
        return function(result) {
          var librariesNames, templatesNames;
          templatesNames = _.map(result, function(tmpl) {
            return tmpl.filePath;
          });
          _this.info("Finished calculating all Template descriptors=" + result.length + "=" + (JSON.stringify(templatesNames, null, 2)));
          librariesNames = _.sortBy(_.keys(_this.libraries.getCalculatedLibraries()));
          _this.info("All Libraries generated during this were " + librariesNames.length + "=" + (JSON.stringify(librariesNames, null, 2)));
          return callback(null, {
            templates: result,
            libraries: _this.libraries.getCalculatedLibraries()
          });
        };
      })(this)).fail((function(_this) {
        return function(error) {
          _this.error({
            msg: "Error while trying to build template descriptors",
            error: error
          });
          return callback(error);
        };
      })(this)).done();
    };

    DefaultTemplatesDescriptorBuilder.prototype.internalBuildTemplateDescriptor = function(scannedTemplate) {
      var promises;
      this.trace("Trying to create Template descriptor for scannedTemplate=" + (scannedTemplate != null ? scannedTemplate.filePath : void 0));
      if (!(scannedTemplate instanceof ScannedTemplate)) {
        return Q.fcall(function() {
          throw new Error("scannedTemplate must be instanceof Scanned Template, but got=" + scannedTemplate);
        });
      }
      if (this.templatesMap[scannedTemplate.filePath] != null) {
        return Q.fcall((function(_this) {
          return function() {
            return _this.templatesMap[scannedTemplate.filePath];
          };
        })(this));
      }
      promises = [];
      promises.push(this.internalCreateTemplateLibraryDependencies(scannedTemplate));
      if ((scannedTemplate.extend != null) && (this.scannedTemplatesMap[scannedTemplate.extend] == null)) {
        return Q.fcall(function() {
          throw new Error("extend=" + scannedTemplate.extend + " is not in ScannedTemplates map");
        });
      }
      if (scannedTemplate.extend != null) {
        promises.push(this.internalBuildTemplateDescriptor(this.scannedTemplatesMap[scannedTemplate.extend]));
      } else {
        promises.push(Q.fcall((function(_this) {
          return function() {
            return null;
          };
        })(this)));
      }
      promises.push(this.internalCreateTemplateIncludeDependencies(scannedTemplate));
      promises.push(this.internalCreateTemplateOwnFilesLibrary(scannedTemplate));
      return Q.all(promises).spread((function(_this) {
        return function(libraries, extend, includes, ownFiles) {
          var newTemplate;
          _this.trace("Created scannedTemplate " + scannedTemplate.filePath + " with libraries=" + libraries.length + ", extend=" + (extend != null) + ", includes=" + includes.length + ", ownFiles=" + ownFiles.length);
          newTemplate = new Template({
            filePath: scannedTemplate.filePath,
            extend: extend != null ? extend.filePath : void 0,
            includes: _.map(includes, function(incl) {
              return incl.filePath;
            }),
            ownFiles: ownFiles,
            libraryDependencies: _.map(libraries, function(lib) {
              return lib.id;
            })
          });
          _this.templatesMap[scannedTemplate.filePath] = newTemplate;
          return newTemplate;
        };
      })(this));
    };

    DefaultTemplatesDescriptorBuilder.prototype.internalCreateTemplateLibraryDependencies = function(scannedTemplate) {
      var lib, promises;
      this.trace("Trying to find library dependencies for template " + scannedTemplate.filePath);
      promises = (function() {
        var _i, _len, _ref, _results;
        _ref = scannedTemplate.libraryDependencies;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          lib = _ref[_i];
          _results.push(this.libraries.getLibrary(lib));
        }
        return _results;
      }).call(this);
      return Q.all(promises).then(function(libs) {
        return libs;
      });
    };

    DefaultTemplatesDescriptorBuilder.prototype.internalCreateTemplateIncludeDependencies = function(scannedTemplate) {
      var incl, promises;
      this.trace("Trying to find included dependencies for template " + scannedTemplate.filePath);
      promises = (function() {
        var _i, _len, _ref, _results;
        _ref = scannedTemplate.includes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          incl = _ref[_i];
          _results.push(this.internalBuildTemplateDescriptor(this.scannedTemplatesMap[incl]));
        }
        return _results;
      }).call(this);
      return Q.all(promises).then(function(deps) {
        return deps;
      });
    };

    DefaultTemplatesDescriptorBuilder.prototype.internalCreateTemplateOwnFilesLibrary = function(scannedTemplate) {
      var createOpts, deferred;
      this.trace("Trying to create Library for Own Files of template " + scannedTemplate.filePath);
      deferred = Q.defer();
      createOpts = _.defaults({
        ownFiles: scannedTemplate.ownFiles || []
      }, this.options);
      this.templateOwnFilesLibraryCreator.createLibrary(scannedTemplate.filePath, this.libraries, createOpts, function(error, newLibrary) {
        if (error) {
          return deferred.reject(new Error(error));
        } else {
          return deferred.resolve(newLibrary);
        }
      });
      return deferred.promise;
    };

    return DefaultTemplatesDescriptorBuilder;

  })(TemplatesDescriptorBuilder);

  module.exports = DefaultTemplatesDescriptorBuilder;

}).call(this);
