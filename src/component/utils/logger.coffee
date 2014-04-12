_ = require 'lodash'
winston = require 'winston'
moment = require('moment')
colors = require('colors')
colors.setTheme {
  path: 'magenta'
  date: 'white'
  tags: 'inverse'
  info: 'green',
  data: 'grey',
  warn: 'yellow',
  warning: 'yellow',
  debug: 'blue',
  error: 'red',
  emerg: 'underline',
  trace: 'cyan',
}

defaultOptions =
  logLevel: "info"
  logLevels: {"emerg":8,"alert":7,"crit":6,"error":5,"warning":4,"notice":3,"info":2,"debug":1, "trace":0}

class LoggableObject

  class CustomConsoleTransport extends winston.transports.Console

    log:(level, message, meta, callback)=>
      if _.isString(meta?.path)
        console.log "#{meta?.pid} - #{meta?.path?['path']}"
      if meta?.error? and meta.error.stack
        console.log "#{meta?.pid} #{meta.error.stack}".error
      tags = ''
      tags = meta.tags.toString() if meta?.tags?
      console.log "#{meta?.pid} - #{meta?.user?.email or 'anon'} #{tags['tags']}
      #{moment().format("MMMM Do YYYY, h:mm:ss a").date} - #{level[level]} - #{message[level]}"
      callback()

  constructor: (@tags, opts={}) ->
    @pid = process.pid
    if _.isString(@tags) then @tags = [@tags]
    else if not(_.isArray(@tags)) then @tags = []
    # start logger
    options = _.defaults(_.cloneDeep(opts), defaultOptions)
    @logger = new (winston.Logger)({exitOnError:false})
    throw new Error("LogLevels must be informed, but got=#{JSON.stringify(options)}") if !_.isObject(options?.logLevels)
    @logger.setLevels(options.logLevels)
    @logger.add CustomConsoleTransport, { level: LoggableObject.detectLogLevel(@tags, options) }

  log:(optsOrMessage, level)=>
    if _.isString(optsOrMessage)
      @logger.log level, optsOrMessage, @__generateMetadata({})
    else if _.isObject(optsOrMessage)
      message = optsOrMessage.message
      message = message or optsOrMessage.msg or ''
      @logger.log level, message, @__generateMetadata(optsOrMessage)

  info:(optsOrMessage)=> @log optsOrMessage, 'info'
  error:(optsOrMessage)=> @log optsOrMessage, 'error'
  emerg:(optsOrMessage)=> @log optsOrMessage, 'emerg'
  debug:(optsOrMessage)=> @log optsOrMessage, 'debug'
  trace:(optsOrMessage)=> @log optsOrMessage, 'trace'
  warn:(optsOrMessage)=> @log optsOrMessage, 'warning'

  addTag:(ctx, tag)=>
    if ctx and _.isObject(ctx) and _.isString(tag)
      if not (ctx.tags? and _.isArray(ctx.tags))
        ctx.tags = []
      ctx.tags.push tag
    return ctx

  __generateMetadata:(optsOrMessage)=>
    if not _.isObject(optsOrMessage) then opts = {} else opts = optsOrMessage.ctx or {}
    opts = _.clone(opts)
    opts.pid = @pid
    if not(_.isArray(opts.tags)) then opts.tags = []
    opts.tags = opts.tags.concat @tags
    if optsOrMessage.error? then opts.error = optsOrMessage.error
    if opts.error? and opts.error.stack? then opts.stack = opts.error.stack
    return opts

  @create:(tags)-> new LoggableObject(tags)

  @detectLogLevel:(tags, options)->
    if _.isString(options.logLevel)
      return options.logLevel
    else if _.isObject(options.logLevel)
      if _.isArray(tags)
        for tag in tags
          if _.isString(options.logLevel[tag]) then return options.logLevel[tag]
      else if _.isString(tags)
        if _.isString(options.logLevel[tags]) then return options.logLevel[tags]
    return defaultOptions.logLevel

module.exports = LoggableObject
