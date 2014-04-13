(function() {
  var DefaultScannedTemplatesDescriptorBuilder, Q, ScannedTemplate, ScannedTemplatesDescriptorBuilder, carteroExtendsRegExp, carteroRequiresRegExp, defaultOptions, findAllFilesBelowFolder, findFilesInFolder, fs, kCarteroExtendsDirective, kCarteroRequiresDirective, path, _, _s,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  _s = require('underscore.string');

  Q = require('q');

  fs = require('fs');

  path = require('path');

  findAllFilesBelowFolder = require('../utils/findAllFilesBelowFolder');

  findFilesInFolder = require('../utils/findFilesInFolder');

  ScannedTemplate = require('../../model/scannedTemplate');

  ScannedTemplatesDescriptorBuilder = require('../../model/scannedTemplatesDescriptorBuilder');

  defaultOptions = {
    templatesPath: "",
    templatesExtensions: /.*\.jade$/,
    templatesOwnFilesExtensions: /.*\.(coffee|js|css|less)$/
  };

  kCarteroRequiresDirective = "##cartero_requires";

  kCarteroExtendsDirective = "##cartero_extends";

  carteroRequiresRegExp = /##cartero_requires((\s*['"].*?['"]\s*,?\s*\n?)+)/;

  carteroExtendsRegExp = new RegExp(kCarteroExtendsDirective + " [\"'](.*?)[\"']");

  DefaultScannedTemplatesDescriptorBuilder = (function(_super) {
    __extends(DefaultScannedTemplatesDescriptorBuilder, _super);

    function DefaultScannedTemplatesDescriptorBuilder(options) {
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
          return Q.all(promises);
        };
      })(this)).then(function(scannedTemplates) {
        return callback(null, scannedTemplates);
      }).fail((function(_this) {
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
      this.trace("Found template " + file + ", will process it");
      return Q.nfcall(fs.readFile, file, "utf-8").then((function(_this) {
        return function(data) {
          var fileContents, promises;
          fileContents = data.toString();
          promises = [];
          promises.push(_this.internalFindExtendsDependency(file, fileContents));
          promises.push(_this.internalFindIncludedTemplates(file, fileContents));
          promises.push(_this.internalFindLibraryDependencies(file, fileContents));
          promises.push(_this.internalFindOwnFiles(file, fileContents));
          return Q.all(promises).spread(function(extend, includes, libraryDependencies, ownFiles) {
            return new ScannedTemplate({
              filePath: file,
              extend: extend,
              includes: includes,
              libraryDependencies: libraryDependencies,
              ownFiles: ownFiles
            });
          });
        };
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalFindExtendsDependency = function(filePath, fileContents) {
      return Q.fcall((function(_this) {
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
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalFindIncludedTemplates = function(filePath, fileContents) {
      return Q.fcall((function(_this) {
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
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalFindLibraryDependencies = function(filePath, fileContents) {
      return Q.fcall((function(_this) {
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
      })(this));
    };

    DefaultScannedTemplatesDescriptorBuilder.prototype.internalFindOwnFiles = function(filePath, fileContents) {
      return findFilesInFolder(path.join(filePath, ".."), this.options.templatesOwnFilesExtensions);
    };

    return DefaultScannedTemplatesDescriptorBuilder;

  })(ScannedTemplatesDescriptorBuilder);

  module.exports = DefaultScannedTemplatesDescriptorBuilder;

}).call(this);
