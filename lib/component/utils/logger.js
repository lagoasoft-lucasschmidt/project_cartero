(function() {
  var LoggableObject, colors, defaultOptions, moment, winston, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  winston = require('winston');

  moment = require('moment');

  colors = require('colors');

  colors.setTheme({
    path: 'magenta',
    date: 'white',
    tags: 'inverse',
    info: 'green',
    data: 'grey',
    warn: 'yellow',
    warning: 'yellow',
    debug: 'blue',
    error: 'red',
    emerg: 'underline',
    trace: 'cyan'
  });

  defaultOptions = {
    logLevel: "info",
    logLevels: {
      "emerg": 8,
      "alert": 7,
      "crit": 6,
      "error": 5,
      "warning": 4,
      "notice": 3,
      "info": 2,
      "debug": 1,
      "trace": 0
    }
  };

  LoggableObject = (function() {
    var CustomConsoleTransport;

    CustomConsoleTransport = (function(_super) {
      __extends(CustomConsoleTransport, _super);

      function CustomConsoleTransport() {
        this.log = __bind(this.log, this);
        return CustomConsoleTransport.__super__.constructor.apply(this, arguments);
      }

      CustomConsoleTransport.prototype.log = function(level, message, meta, callback) {
        var tags, _ref, _ref1;
        if (_.isString(meta != null ? meta.path : void 0)) {
          console.log("" + (meta != null ? meta.pid : void 0) + " - " + (meta != null ? (_ref = meta.path) != null ? _ref['path'] : void 0 : void 0));
        }
        if (((meta != null ? meta.error : void 0) != null) && meta.error.stack) {
          console.log(("" + (meta != null ? meta.pid : void 0) + " " + meta.error.stack).error);
        }
        tags = '';
        if ((meta != null ? meta.tags : void 0) != null) {
          tags = meta.tags.toString();
        }
        console.log("" + (meta != null ? meta.pid : void 0) + " - " + ((meta != null ? (_ref1 = meta.user) != null ? _ref1.email : void 0 : void 0) || 'anon') + " " + tags['tags'] + " " + (moment().format("MMMM Do YYYY, h:mm:ss:SSS a").date) + " - " + level[level] + " - " + message[level]);
        return callback();
      };

      return CustomConsoleTransport;

    })(winston.transports.Console);

    function LoggableObject(tags, opts) {
      var options;
      this.tags = tags;
      if (opts == null) {
        opts = {};
      }
      this.__generateMetadata = __bind(this.__generateMetadata, this);
      this.addTag = __bind(this.addTag, this);
      this.warn = __bind(this.warn, this);
      this.trace = __bind(this.trace, this);
      this.debug = __bind(this.debug, this);
      this.emerg = __bind(this.emerg, this);
      this.error = __bind(this.error, this);
      this.info = __bind(this.info, this);
      this.log = __bind(this.log, this);
      this.pid = process.pid;
      if (_.isString(this.tags)) {
        this.tags = [this.tags];
      } else if (!(_.isArray(this.tags))) {
        this.tags = [];
      }
      options = _.defaults(_.cloneDeep(opts), defaultOptions);
      this.logger = new winston.Logger({
        exitOnError: false
      });
      if (!_.isObject(options != null ? options.logLevels : void 0)) {
        throw new Error("LogLevels must be informed, but got=" + (JSON.stringify(options)));
      }
      this.logger.setLevels(options.logLevels);
      this.logger.add(CustomConsoleTransport, {
        level: LoggableObject.detectLogLevel(this.tags, options)
      });
    }

    LoggableObject.prototype.log = function(optsOrMessage, level) {
      var message;
      if (_.isString(optsOrMessage)) {
        return this.logger.log(level, optsOrMessage, this.__generateMetadata({}));
      } else if (_.isObject(optsOrMessage)) {
        message = optsOrMessage.message;
        message = message || optsOrMessage.msg || '';
        return this.logger.log(level, message, this.__generateMetadata(optsOrMessage));
      }
    };

    LoggableObject.prototype.info = function(optsOrMessage) {
      return this.log(optsOrMessage, 'info');
    };

    LoggableObject.prototype.error = function(optsOrMessage) {
      return this.log(optsOrMessage, 'error');
    };

    LoggableObject.prototype.emerg = function(optsOrMessage) {
      return this.log(optsOrMessage, 'emerg');
    };

    LoggableObject.prototype.debug = function(optsOrMessage) {
      return this.log(optsOrMessage, 'debug');
    };

    LoggableObject.prototype.trace = function(optsOrMessage) {
      return this.log(optsOrMessage, 'trace');
    };

    LoggableObject.prototype.warn = function(optsOrMessage) {
      return this.log(optsOrMessage, 'warning');
    };

    LoggableObject.prototype.addTag = function(ctx, tag) {
      if (ctx && _.isObject(ctx) && _.isString(tag)) {
        if (!((ctx.tags != null) && _.isArray(ctx.tags))) {
          ctx.tags = [];
        }
        ctx.tags.push(tag);
      }
      return ctx;
    };

    LoggableObject.prototype.__generateMetadata = function(optsOrMessage) {
      var opts;
      if (!_.isObject(optsOrMessage)) {
        opts = {};
      } else {
        opts = optsOrMessage.ctx || {};
      }
      opts = _.clone(opts);
      opts.pid = this.pid;
      if (!(_.isArray(opts.tags))) {
        opts.tags = [];
      }
      opts.tags = opts.tags.concat(this.tags);
      if (optsOrMessage.error != null) {
        opts.error = optsOrMessage.error;
      }
      if ((opts.error != null) && (opts.error.stack != null)) {
        opts.stack = opts.error.stack;
      }
      return opts;
    };

    LoggableObject.create = function(tags) {
      return new LoggableObject(tags);
    };

    LoggableObject.detectLogLevel = function(tags, options) {
      var tag, _i, _len;
      if (_.isString(options.logLevel)) {
        return options.logLevel;
      } else if (_.isObject(options.logLevel)) {
        if (_.isArray(tags)) {
          for (_i = 0, _len = tags.length; _i < _len; _i++) {
            tag = tags[_i];
            if (_.isString(options.logLevel[tag])) {
              return options.logLevel[tag];
            }
          }
        } else if (_.isString(tags)) {
          if (_.isString(options.logLevel[tags])) {
            return options.logLevel[tags];
          }
        }
      }
      return defaultOptions.logLevel;
    };

    return LoggableObject;

  })();

  module.exports = LoggableObject;

}).call(this);
