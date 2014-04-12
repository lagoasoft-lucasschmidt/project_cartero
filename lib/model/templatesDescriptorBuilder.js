(function() {
  var LoggableObject, TemplatesDescriptorBuilder,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LoggableObject = require('../component/utils/logger');

  TemplatesDescriptorBuilder = (function(_super) {
    __extends(TemplatesDescriptorBuilder, _super);

    function TemplatesDescriptorBuilder(name, options) {
      this.buildTemplatesDescriptors = __bind(this.buildTemplatesDescriptors, this);
      TemplatesDescriptorBuilder.__super__.constructor.call(this, name, options);
    }

    TemplatesDescriptorBuilder.prototype.buildTemplatesDescriptors = function(callback) {
      return callback(new Error("Not Implemented"));
    };

    return TemplatesDescriptorBuilder;

  })(LoggableObject);

  module.exports = TemplatesDescriptorBuilder;

}).call(this);
