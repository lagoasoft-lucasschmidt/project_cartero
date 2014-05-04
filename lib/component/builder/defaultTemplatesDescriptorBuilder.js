(function() {
  var DefaultScannedTemplatesDescriptorBuilder, DefaultTemplatesDescriptorBuilder, Q, ScannedTemplatesDescriptorBuilder, TemplatesDescriptorBuilder, defaultOptions, fs, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Q = require('q');

  fs = require('fs');

  path = require('path');

  DefaultScannedTemplatesDescriptorBuilder = require('./defaultScannedTemplatesDescriptorBuilder');

  TemplatesDescriptorBuilder = require('../../model/templatesDescriptorBuilder');

  ScannedTemplatesDescriptorBuilder = require('../../model/scannedTemplatesDescriptorBuilder');

  defaultOptions = {
    scannedTemplatesDescriptorBuilder: DefaultScannedTemplatesDescriptorBuilder
  };

  DefaultTemplatesDescriptorBuilder = (function(_super) {
    __extends(DefaultTemplatesDescriptorBuilder, _super);

    function DefaultTemplatesDescriptorBuilder(options) {
      this.buildTemplatesDescriptors = __bind(this.buildTemplatesDescriptors, this);
      DefaultTemplatesDescriptorBuilder.__super__.constructor.call(this, "DEFAULT_TEMPLATES_DESC_BUILDER", options);
      this.options = _.defaults(options, defaultOptions);
      if (!_.isFunction(this.options.scannedTemplatesDescriptorBuilder)) {
        throw new Error("scannedTemplatesDescriptorBuilder must be a function");
      }
      this.scanner = new this.options.scannedTemplatesDescriptorBuilder(this.options);
      if (!(this.scanner instanceof ScannedTemplatesDescriptorBuilder)) {
        throw new Error("scannedTemplatesDescriptorBuilder must be a instanceof ScannedTemplatesDescriptorBuilder");
      }
    }

    DefaultTemplatesDescriptorBuilder.prototype.buildTemplatesDescriptors = function(callback) {
      this.debug("Will build template descriptors");
      return Q.nfcall(this.scanner.scanTemplates).then((function(_this) {
        return function(scannedTemplates) {
          _this.info("ScannedTemplates=" + (JSON.stringify(scannedTemplates, null, 2)));
          return scannedTemplates;
        };
      })(this)).then((function(_this) {
        return function(result) {
          var librariesNames, templatesNames;
          templatesNames = _.map(result, function(tmpl) {
            return tmpl.filePath;
          });
          _this.info("Finished calculating all Template descriptors=" + result.length + "=" + (JSON.stringify(templatesNames, null, 2)));
          librariesNames = _.sortBy(_.keys(_this.scanner.getCalculatedLibraries()));
          _this.info("All Libraries generated during this were " + librariesNames.length + "=" + (JSON.stringify(librariesNames, null, 2)));
          return callback(null, {
            templates: result,
            libraries: _this.scanner.getCalculatedLibraries()
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

    return DefaultTemplatesDescriptorBuilder;

  })(TemplatesDescriptorBuilder);

  module.exports = DefaultTemplatesDescriptorBuilder;

}).call(this);
