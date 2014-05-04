(function() {
  var CarteroFileDescriptorBuilder, DefaultCarteroFileDescriptorBuilder, Q, ScannedTemplate, fs, mkdirp, path, saveCarteroJSON, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  path = require('path');

  Q = require('q');

  fs = require('fs');

  mkdirp = require('mkdirp');

  saveCarteroJSON = require("../utils/saveCarteroJSON");

  CarteroFileDescriptorBuilder = require('../../model/carteroFileDescriptorBuilder');

  ScannedTemplate = require('../../model/scannedTemplate');

  DefaultCarteroFileDescriptorBuilder = (function(_super) {
    __extends(DefaultCarteroFileDescriptorBuilder, _super);

    function DefaultCarteroFileDescriptorBuilder(options) {
      this.validateTemplates = __bind(this.validateTemplates, this);
      this.createFile = __bind(this.createFile, this);
      DefaultCarteroFileDescriptorBuilder.__super__.constructor.call(this, "DEFAULT_CARTERO_FILE_DESC_BUILDER", options);
      this.options = options;
      if (!_.isString(this.options.carteroFileDescriptorPath) || this.options.carteroFileDescriptorPath.length === 0) {
        throw new Error("carteroFileDescriptorPath is required");
      }
    }

    DefaultCarteroFileDescriptorBuilder.prototype.createFile = function(templates, libraries, callback) {
      var filePath;
      filePath = path.join(this.options.carteroFileDescriptorPath, "" + this.options.carteroFileDescriptorName + "." + this.options.carteroFileDescriptorExtension);
      callback = callback || function() {};
      return this.validateTemplates(templates).then((function(_this) {
        return function() {
          var carteroJson, template, _i, _len;
          _this.trace("Will create Cartero File Descriptor on " + filePath);
          carteroJson = {
            options: _this.options,
            templates: {},
            libraries: libraries
          };
          for (_i = 0, _len = templates.length; _i < _len; _i++) {
            template = templates[_i];
            carteroJson.templates[template.filePath] = template;
          }
          return saveCarteroJSON(carteroJson, _this.options).then(function() {
            _this.debug("Successfully wrote Cartero File Descritor on " + filePath);
            return callback(null, filePath);
          });
        };
      })(this)).fail((function(_this) {
        return function(error) {
          _this.error({
            msg: "Error while trying to create Cartero File Descritor",
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    DefaultCarteroFileDescriptorBuilder.prototype.validateTemplates = function(templates) {
      if (templates == null) {
        templates = [];
      }
      return Q.fcall((function(_this) {
        return function() {
          var template, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = templates.length; _i < _len; _i++) {
            template = templates[_i];
            if (!(template instanceof ScannedTemplate)) {
              throw new Error("Template must be instanceof ScannedTemplate");
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
    };

    return DefaultCarteroFileDescriptorBuilder;

  })(CarteroFileDescriptorBuilder);

  module.exports = DefaultCarteroFileDescriptorBuilder;

}).call(this);
