(function() {
  var ConcatFilesAssetsProcessor, ConcatJsAssetsProcessor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ConcatFilesAssetsProcessor = require("./base/concatFilesAssetsProcessor");

  ConcatJsAssetsProcessor = (function(_super) {
    __extends(ConcatJsAssetsProcessor, _super);

    function ConcatJsAssetsProcessor(grunt, options) {
      ConcatJsAssetsProcessor.__super__.constructor.call(this, "CONCAT_JS_ASSETS_PROCESSOR", ["js"], "js", grunt, options);
      this.separator = ";";
    }

    return ConcatJsAssetsProcessor;

  })(ConcatFilesAssetsProcessor);

  module.exports = ConcatJsAssetsProcessor;

}).call(this);
