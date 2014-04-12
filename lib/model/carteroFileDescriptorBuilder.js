(function() {
  var CarteroFileDescriptorBuilder, LoggableObject,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LoggableObject = require('../component/utils/logger');

  CarteroFileDescriptorBuilder = (function(_super) {
    __extends(CarteroFileDescriptorBuilder, _super);

    function CarteroFileDescriptorBuilder(name, options) {
      CarteroFileDescriptorBuilder.__super__.constructor.call(this, name, options);
    }

    CarteroFileDescriptorBuilder.prototype.createFile = function(templates, libraries, callback) {
      return callback(new Error("Not Implemented"));
    };

    return CarteroFileDescriptorBuilder;

  })(LoggableObject);

  module.exports = CarteroFileDescriptorBuilder;

}).call(this);
