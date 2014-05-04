_ = require 'lodash'
Promise = require 'bluebird'
path = require 'path'
fs = require 'fs'
readCarteroJSON = require "../component/utils/readCarteroJSON"
saveCarteroJSON = require "../component/utils/saveCarteroJSON"
AssetsProcessor = require "../model/assetsProcessor"
GruntAssetsProcessor = require "../component/processor/gruntAssetsProcessor"

module.exports = (grunt)->

  grunt.registerMultiTask 'project_cartero_assets_processor', ()->

    options = @options({})
    assetsProcessors = options.assetsProcessors
    ProcessorClass = assetsProcessors?[options.assetsProcessorsIndex]

    if !( _.isString(ProcessorClass) or _.isFunction(ProcessorClass) or _.isObject(ProcessorClass) )
      grunt.log.error "AssetsProcessor must be informed as Function (AssetsProcessor class), String (to require) or Object (Grunt task description), otherwise cant process in currentIndex=#{options.assetsProcessorsIndex}"
      return false


    if _.isString(ProcessorClass) then ProcessorClass = require ProcessorClass
    else if !_.isFunction(ProcessorClass)
      gruntProcessorOpts = ProcessorClass
      if !_.isString(gruntProcessorOpts.task) or !_.isString(gruntProcessorOpts.fileExt) or !_.isString(gruntProcessorOpts.destExt)
        grunt.log.error "Grunt Assets Processor must have defined: task, fileExt and destExt, but got #{JSON.stringify(gruntProcessorOpts)}"
        return false
      processor = new GruntAssetsProcessor(gruntProcessorOpts, grunt, options)
    else processor = new ProcessorClass(grunt, options)

    if !(processor instanceof AssetsProcessor)
      grunt.log.error "AssetsProcessor must be instanceof AssetsProcessor, but got function/class= #{ProcessorClass}"
      return false

    done = @async()

    readCarteroJSON(options)
    .then (carteroJSON)->
      Promise.promisify(processor.run, processor)(carteroJSON)
    .then (carteroJSON)->
      saveCarteroJSON(carteroJSON, options)
    .then ()->
      options.assetsProcessorsIndex++
      if assetsProcessors[options.assetsProcessorsIndex]?
        grunt.config ["project_cartero_assets_processor", "index#{options.assetsProcessorsIndex}", "options"], options
        grunt.task.run "project_cartero_assets_processor:index#{options.assetsProcessorsIndex}"
      done()
    .error (error)->
      grunt.log.error error.stack or error
      grunt.log.error "Error while trying to execute project_cartero_move_process"
      done(error)
