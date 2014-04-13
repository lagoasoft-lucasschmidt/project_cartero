(function() {
  var AssetsProcessor, ConcatAssetsProcessor, ConcatCssAssetsProcessor, ConcatJsAssetsProcessor, Q, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  ConcatJsAssetsProcessor = require('./concat/concatJsAssetsProcessor');

  ConcatCssAssetsProcessor = require('./concat/concatCssAssetsProcessor');

  AssetsProcessor = require('../../model/assetsProcessor');

  Q = require('q');

  ConcatAssetsProcessor = (function(_super) {
    __extends(ConcatAssetsProcessor, _super);

    function ConcatAssetsProcessor(grunt, options) {
      this.run = __bind(this.run, this);
      ConcatAssetsProcessor.__super__.constructor.call(this, "CONCAT_ASSETS_PROCESSOR", grunt, options);
      this.concatJsAssetsProcessor = new ConcatJsAssetsProcessor(grunt, options);
      this.concatCssAssetsProcessor = new ConcatCssAssetsProcessor(grunt, options);
    }

    ConcatAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return Q.all([Q.nfcall(this.concatJsAssetsProcessor.run, carteroJSON), Q.nfcall(this.concatCssAssetsProcessor.run, carteroJSON)]).spread((function(_this) {
        return function(jsFilesCalculated, cssFilesCalculated) {
          _this.rearrangeTemplates(carteroJSON, jsFilesCalculated);
          _this.rearrangeTemplates(carteroJSON, cssFilesCalculated);
          _this.debug({
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

    ConcatAssetsProcessor.prototype.rearrangeTemplates = function(carteroJSON, files) {
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

    return ConcatAssetsProcessor;

  })(AssetsProcessor);

  module.exports = ConcatAssetsProcessor;

}).call(this);
