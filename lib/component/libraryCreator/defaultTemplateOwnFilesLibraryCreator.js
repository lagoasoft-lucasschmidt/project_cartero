(function() {
  var DefaultLibraryCreator, DefaultTemplateOwnFilesLibraryCreator, LibraryFile, Promise, fs, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  fs = require('fs');

  path = require('path');

  Promise = require('bluebird');

  DefaultLibraryCreator = require('./defaultLibraryCreator');

  LibraryFile = require('../../model/libraryFile');

  DefaultTemplateOwnFilesLibraryCreator = (function(_super) {
    __extends(DefaultTemplateOwnFilesLibraryCreator, _super);

    function DefaultTemplateOwnFilesLibraryCreator(options) {
      this.internalLoadBundleJSON = __bind(this.internalLoadBundleJSON, this);
      this.canCreateLibrary = __bind(this.canCreateLibrary, this);
      DefaultTemplateOwnFilesLibraryCreator.__super__.constructor.call(this, options);
      this.name = "TEMPLATE_OWN_FILES_LIBRARY_CREATOR";
    }

    DefaultTemplateOwnFilesLibraryCreator.prototype.canCreateLibrary = function(libraryId, libraries, options, callback) {
      return callback(new Error("This Template should only be used internally, not exposed"));
    };

    DefaultTemplateOwnFilesLibraryCreator.prototype.internalCreateLibraryPath = function(libraryId, libraries, options) {
      return libraryId;
    };

    DefaultTemplateOwnFilesLibraryCreator.prototype.internalLoadBundleJSON = function(libraryId, libraryPath, libraries, options) {
      this.trace("Loading bundleJSON for library id=" + libraryId);
      return Promise.resolve(_.cloneDeep(DefaultLibraryCreator.bundleDefaults));
    };

    DefaultTemplateOwnFilesLibraryCreator.prototype.internalCreateDependencies = function(libraryId, libraryPath, libraries, options, bundleJSON) {
      return Promise.resolve([]);
    };

    DefaultTemplateOwnFilesLibraryCreator.prototype.internalCreateLibraryFiles = function(libraryId, libraryPath, libraries, options, bundleJSON) {
      var file, ownFiles;
      ownFiles = options.ownFiles || [];
      return Promise.resolve((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = ownFiles.length; _i < _len; _i++) {
          file = ownFiles[_i];
          _results.push(new LibraryFile({
            type: "LOCAL",
            path: file
          }));
        }
        return _results;
      })());
    };

    DefaultTemplateOwnFilesLibraryCreator.prototype.internalCreateLibraryRemoteFiles = function(libraryId, libraryPath, libraries, options, bundleJSON) {
      return Promise.resolve([]);
    };

    DefaultTemplateOwnFilesLibraryCreator.prototype.internalCreateSubLibraries = function(libraryId, libraryPath, libraries, options, bundleJSON) {
      return Promise.resolve([]);
    };

    return DefaultTemplateOwnFilesLibraryCreator;

  })(DefaultLibraryCreator);

  module.exports = DefaultTemplateOwnFilesLibraryCreator;

}).call(this);
