(function() {
  var AssetsProcessor, CalculateAssetsProcessor, Promise, calculateViewFiles, fileExtension, fs, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Promise = require('bluebird');

  fs = require('fs');

  path = require('path');

  fileExtension = require('../utils/fileExtension');

  AssetsProcessor = require('../../model/assetsProcessor');

  calculateViewFiles = require('../calculateViewFiles/calculateAllViewFiles')({
    web: true
  });

  CalculateAssetsProcessor = (function(_super) {
    __extends(CalculateAssetsProcessor, _super);

    function CalculateAssetsProcessor(processorOptions, grunt, options) {
      this.calculateTemplateAssets = __bind(this.calculateTemplateAssets, this);
      this.calculateAssets = __bind(this.calculateAssets, this);
      this.run = __bind(this.run, this);
      CalculateAssetsProcessor.__super__.constructor.call(this, "CALCULATE_ASSETS_PROCESSOR", grunt, options);
    }

    CalculateAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return Promise.resolve().then((function(_this) {
        return function() {
          return _this.calculateAssets(carteroJSON);
        };
      })(this)).then((function(_this) {
        return function() {
          _this.debug({
            msg: "Successfully runned CalculateAssetsProcessor"
          });
          return callback(null, carteroJSON);
        };
      })(this)).error((function(_this) {
        return function(error) {
          _this.error({
            msg: "rror while trying to run CalculateAssetsProcessor",
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    CalculateAssetsProcessor.prototype.calculateAssets = function(carteroJSON) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var promises, template, templateId, _ref;
          promises = [];
          _ref = carteroJSON.templates;
          for (templateId in _ref) {
            template = _ref[templateId];
            promises.push(_this.calculateTemplateAssets(templateId, template, carteroJSON));
          }
          return Promise.all(promises).then(function() {
            return carteroJSON;
          });
        };
      })(this));
    };

    CalculateAssetsProcessor.prototype.calculateTemplateAssets = function(templateId, template, carteroJSON) {
      return Promise.resolve().then((function(_this) {
        return function() {
          var calculatedFiles;
          calculatedFiles = calculateViewFiles(template, carteroJSON);
          return template["calculatedFiles"] = calculatedFiles;
        };
      })(this));
    };

    return CalculateAssetsProcessor;

  })(AssetsProcessor);

  module.exports = CalculateAssetsProcessor;

}).call(this);
