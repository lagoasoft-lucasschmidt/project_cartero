(function() {
  var AssetsProcessor, LoggableObject,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LoggableObject = require('../component/utils/logger');

  AssetsProcessor = (function(_super) {
    __extends(AssetsProcessor, _super);

    function AssetsProcessor(name, grunt, options) {
      AssetsProcessor.__super__.constructor.call(this, name, options);
      this.name = name;
      this.grunt = grunt;
      this.options = options;
    }

    AssetsProcessor.prototype.run = function(carteroJSON, callback) {
      return callback(new Error("Not Implemented"));
    };

    return AssetsProcessor;

  })(LoggableObject);

  module.exports = AssetsProcessor;

}).call(this);
