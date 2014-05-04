(function() {
  var LoggableObject, ScannedTemplatesDescriptorBuilder,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LoggableObject = require('../component/utils/logger');

  ScannedTemplatesDescriptorBuilder = (function(_super) {
    __extends(ScannedTemplatesDescriptorBuilder, _super);

    function ScannedTemplatesDescriptorBuilder(name, options) {
      ScannedTemplatesDescriptorBuilder.__super__.constructor.call(this, name, options);
    }

    ScannedTemplatesDescriptorBuilder.prototype.scanTemplates = function(callback) {
      return callback(new Error("Not Implemented"));
    };

    ScannedTemplatesDescriptorBuilder.prototype.getCalculatedLibraries = function() {
      throw new Error("Not Implemented");
    };

    return ScannedTemplatesDescriptorBuilder;

  })(LoggableObject);

  module.exports = ScannedTemplatesDescriptorBuilder;

}).call(this);
