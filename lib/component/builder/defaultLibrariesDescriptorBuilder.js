(function() {
  var BowerLibraryCreator, DefaultLibrariesDescriptorBuilder, DefaultLibraryCreator, LibrariesDescriptorBuilder, Library, LibraryCreator, Promise, defaultOptions, path, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  path = require('path');

  Promise = require('bluebird');

  LibrariesDescriptorBuilder = require('../../model/librariesDescriptorBuilder');

  Library = require('../../model/library');

  LibraryCreator = require('../../model/libraryCreator');

  DefaultLibraryCreator = require('../libraryCreator/DefaultLibraryCreator');

  BowerLibraryCreator = require('../libraryCreator/BowerLibraryCreator');

  defaultOptions = {
    libraryCreators: [DefaultLibraryCreator]
  };

  DefaultLibrariesDescriptorBuilder = (function(_super) {
    __extends(DefaultLibrariesDescriptorBuilder, _super);

    function DefaultLibrariesDescriptorBuilder(options) {
      this.getCreatorsNames = __bind(this.getCreatorsNames, this);
      this.getCalculatedLibraries = __bind(this.getCalculatedLibraries, this);
      this.getLibrary = __bind(this.getLibrary, this);
      this.internalCanLibraryCreatorCreateLibrary = __bind(this.internalCanLibraryCreatorCreateLibrary, this);
      this.internalCreateLibraryByLibraryCreator = __bind(this.internalCreateLibraryByLibraryCreator, this);
      this.internalChooseLibraryCreator = __bind(this.internalChooseLibraryCreator, this);
      this.internalCreateLibrary = __bind(this.internalCreateLibrary, this);
      this.internalSetupLibraryCreator = __bind(this.internalSetupLibraryCreator, this);
      this.internalSetupLibraryCreators = __bind(this.internalSetupLibraryCreators, this);
      DefaultLibrariesDescriptorBuilder.__super__.constructor.call(this, "DEFAULT_LIBRARIES_DESC_BUILDER", options);
      this.options = _.defaults(options, defaultOptions);
      if (!_.isString(this.options.librariesPath) || this.options.librariesPath.length === 0) {
        throw new Error("librariesPath is required");
      }
      if (!_.isArray(this.options.libraryCreators)) {
        throw new Error("libraryCreators must be specified");
      }
      this.internalSetupLibraryCreators();
      if (this.libraryCreators.length === 0) {
        throw new Error("libraryCreators must be valid LibraryCreator instances");
      }
      this.info("Initiated libraryCreators as " + (this.getCreatorsNames()));
      this._allLibraries = {};
    }

    DefaultLibrariesDescriptorBuilder.prototype.internalSetupLibraryCreators = function() {
      var creator, hasBowerCreator, _i, _len, _ref;
      this.libraryCreators = _.map(this.options.libraryCreators, (function(_this) {
        return function(libraryCreator) {
          var creator, error;
          _this.trace("Initiating libraryCreator " + libraryCreator);
          creator = null;
          if (_.isFunction(libraryCreator)) {
            creator = libraryCreator;
          } else if (_.isString(libraryCreator) && libraryCreator.length > 0) {
            try {
              creator = require(libraryCreator);
            } catch (_error) {
              error = _error;
              _this.trace({
                msg: "Error while trying to require libraryCreator=" + libraryCreator,
                error: error
              });
            }
          }
          if (_.isFunction(creator)) {
            return _this.internalSetupLibraryCreator(creator);
          } else {
            throw new Error("Cant initiate libraryCreator=" + libraryCreator + ", since its not a function");
          }
        };
      })(this));
      this.libraryCreators = _.filter(this.libraryCreators, function(libraryCreator) {
        return libraryCreator != null;
      });
      if (this.options.bowerComponentsPath != null) {
        hasBowerCreator = false;
        _ref = this.libraryCreators;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          creator = _ref[_i];
          if (creator instanceof BowerLibraryCreator) {
            hasBowerCreator = true;
          }
        }
        if (!hasBowerCreator) {
          return this.libraryCreators.push(new BowerLibraryCreator(this.options));
        }
      }
    };

    DefaultLibrariesDescriptorBuilder.prototype.internalSetupLibraryCreator = function(creator) {
      var libraryCreator;
      libraryCreator = new creator(this.options);
      if (libraryCreator instanceof LibraryCreator) {
        return libraryCreator;
      } else {
        this.warn("LibraryCreator " + libraryCreator + " isnt instanceof LibraryCreator, this shouldnt happen");
        return null;
      }
    };

    DefaultLibrariesDescriptorBuilder.prototype.internalCreateLibrary = function(libraryId) {
      return Promise.resolve().then((function(_this) {
        return function() {
          if (!_.isString(libraryId)) {
            throw new Error("LibraryId must be informed");
          }
          _this.trace("Trying to create library id=" + libraryId + ", will attempt to choose libraryCreator");
          return _this.internalChooseLibraryCreator(libraryId);
        };
      })(this)).then((function(_this) {
        return function(libraryCreator) {
          if (!libraryCreator) {
            throw new Error("LibraryCreator couldnt be found for library id=" + libraryId);
          }
          return _this.internalCreateLibraryByLibraryCreator(libraryId, libraryCreator);
        };
      })(this)).then((function(_this) {
        return function(library) {
          if (!library) {
            throw new Error("LibraryCreator couldnt create library id=" + libraryId + ", no errors were given, this shoudnt happen");
          }
          _this._allLibraries[libraryId] = library;
          return library;
        };
      })(this)).error((function(_this) {
        return function(error) {
          _this.trace({
            msg: "Error while trying to create library id=" + libraryId,
            error: error
          });
          return null;
        };
      })(this));
    };

    DefaultLibrariesDescriptorBuilder.prototype.internalChooseLibraryCreator = function(libraryId) {
      var creator, promises;
      this.trace("Trying to choose library creator for library id=" + libraryId + " and creators=" + (this.getCreatorsNames()));
      promises = (function() {
        var _i, _len, _ref, _results;
        _ref = this.libraryCreators;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          creator = _ref[_i];
          _results.push(this.internalCanLibraryCreatorCreateLibrary(libraryId, creator));
        }
        return _results;
      }).call(this);
      return Promise.all(promises).then((function(_this) {
        return function(answers) {
          var answer, i, _i, _len;
          for (i = _i = 0, _len = answers.length; _i < _len; i = ++_i) {
            answer = answers[i];
            if (answer === true) {
              creator = _this.libraryCreators[i];
              _this.trace("Creator with name " + creator.name + " can create library id=" + libraryId);
              return creator;
            }
          }
          _this.warn("No creators can create library id=" + libraryId + ", answers=" + answers + " and creators=" + (_this.getCreatorsNames()));
          return null;
        };
      })(this));
    };

    DefaultLibrariesDescriptorBuilder.prototype.internalCreateLibraryByLibraryCreator = function(libraryId, creator) {
      var deferred;
      deferred = Promise.defer();
      creator.createLibrary(libraryId, this, this.options, (function(_this) {
        return function(error, newLibrary) {
          if (error) {
            return deferred.reject(new Error(error));
          } else {
            return deferred.resolve(newLibrary);
          }
        };
      })(this));
      return deferred.promise;
    };

    DefaultLibrariesDescriptorBuilder.prototype.internalCanLibraryCreatorCreateLibrary = function(libraryId, creator) {
      var deferred;
      deferred = Promise.defer();
      creator.canCreateLibrary(libraryId, this, this.options, (function(_this) {
        return function(error, can) {
          if (error) {
            return deferred.reject(new Error(error));
          } else {
            return deferred.resolve(can);
          }
        };
      })(this));
      return deferred.promise;
    };

    DefaultLibrariesDescriptorBuilder.prototype.getLibrary = function(libraryId) {
      return Promise.resolve().then((function(_this) {
        return function() {
          if (!_.isString(libraryId)) {
            throw new Error("LibraryId must be informed");
          }
          _this.trace("Trying to get library id=" + libraryId);
          if ((_this._allLibraries[libraryId] != null) && _this._allLibraries[libraryId] instanceof Library) {
            _this.trace("Found library id=" + libraryId + " already cached");
            return Promise.resolve(_this._allLibraries[libraryId]);
          } else {
            _this.trace("Couldnt find library id=" + libraryId + " into cache, will attempt to load properly");
            return _this.internalCreateLibrary(libraryId);
          }
        };
      })(this));
    };

    DefaultLibrariesDescriptorBuilder.prototype.getCalculatedLibraries = function() {
      return this._allLibraries;
    };

    DefaultLibrariesDescriptorBuilder.prototype.getCreatorsNames = function() {
      return _.map(this.libraryCreators, function(c) {
        return c.name;
      });
    };

    return DefaultLibrariesDescriptorBuilder;

  })(LibrariesDescriptorBuilder);

  module.exports = DefaultLibrariesDescriptorBuilder;

}).call(this);
