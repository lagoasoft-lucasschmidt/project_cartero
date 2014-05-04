(function() {
  var BaseConcatFilesAssetsProcessor, ConcatCssAssetsProcessor, Promise, editCssRelativeUrls, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Promise = require('bluebird');

  editCssRelativeUrls = require("../../utils/editCssRelativeUrls");

  BaseConcatFilesAssetsProcessor = require("./baseConcatFilesAssetsProcessor");

  ConcatCssAssetsProcessor = (function(_super) {
    __extends(ConcatCssAssetsProcessor, _super);

    function ConcatCssAssetsProcessor(grunt, options) {
      this.replaceUrls = __bind(this.replaceUrls, this);
      this.run = __bind(this.run, this);
      ConcatCssAssetsProcessor.__super__.constructor.call(this, "CONCAT_CSS_ASSETS_PROCESSOR", ["css"], "css", grunt, options);
    }

    ConcatCssAssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return this.concatTemplateViewFiles(carteroJSON).then((function(_this) {
        return function(filesCalculated) {
          return _this.replaceUrls(filesCalculated);
        };
      })(this)).then((function(_this) {
        return function(filesCalculated) {
          _this.debug({
            msg: "Successfully runned " + _this.name
          });
          return callback(null, filesCalculated);
        };
      })(this)).error((function(_this) {
        return function(error) {
          _this.error({
            msg: "rror while trying to run " + _this.name,
            error: error
          });
          return callback(new Error(error));
        };
      })(this));
    };

    ConcatCssAssetsProcessor.prototype.replaceUrls = function(filesCalculated) {
      var data, file, filepath, filesToModify, promises;
      filesToModify = [];
      for (file in filesCalculated) {
        data = filesCalculated[file];
        filesToModify = filesToModify.concat(data.src);
      }
      filesToModify = _.uniq(filesToModify);
      promises = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = filesToModify.length; _i < _len; _i++) {
          filepath = filesToModify[_i];
          _results.push(editCssRelativeUrls(filepath, filepath, this.options));
        }
        return _results;
      }).call(this);
      return Promise.all(promises).then((function(_this) {
        return function() {
          return filesCalculated;
        };
      })(this));
    };

    return ConcatCssAssetsProcessor;

  })(BaseConcatFilesAssetsProcessor);

  module.exports = ConcatCssAssetsProcessor;

}).call(this);
