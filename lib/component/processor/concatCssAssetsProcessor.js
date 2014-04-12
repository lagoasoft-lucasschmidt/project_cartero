(function() {
  var ConcatCssAssetsProcessor, ConcatFilesAssetsProcessor,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ConcatFilesAssetsProcessor = require("./base/concatFilesAssetsProcessor");

  ConcatCssAssetsProcessor = (function(_super) {
    __extends(ConcatCssAssetsProcessor, _super);

    function ConcatCssAssetsProcessor(grunt, options) {
      ConcatCssAssetsProcessor.__super__.constructor.call(this, "CONCAT_CSS_ASSETS_PROCESSOR", ["css"], "css", grunt, options);
    }

    return ConcatCssAssetsProcessor;

  })(ConcatFilesAssetsProcessor);

  module.exports = ConcatCssAssetsProcessor;

}).call(this);
