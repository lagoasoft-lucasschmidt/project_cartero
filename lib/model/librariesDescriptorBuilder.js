(function() {
  var LibrariesDescriptorBuilder, LoggableObject, Promise,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Promise = require('bluebird');

  LoggableObject = require('../component/utils/logger');

  LibrariesDescriptorBuilder = (function(_super) {
    __extends(LibrariesDescriptorBuilder, _super);

    function LibrariesDescriptorBuilder(name, options) {
      this.getCalculatedLibraries = __bind(this.getCalculatedLibraries, this);
      this.getLibrary = __bind(this.getLibrary, this);
      LibrariesDescriptorBuilder.__super__.constructor.call(this, name, options);
    }

    LibrariesDescriptorBuilder.prototype.getLibrary = function(libraryId) {
      return Promise.resolve().then((function(_this) {
        return function() {
          throw new Error("Not Implemented");
        };
      })(this));
    };

    LibrariesDescriptorBuilder.prototype.getCalculatedLibraries = function() {
      throw new Error("Not Implemented");
    };

    return LibrariesDescriptorBuilder;

  })(LoggableObject);

  module.exports = LibrariesDescriptorBuilder;

}).call(this);
