_ = require 'lodash'
Q = require 'q'
path = require 'path'
fs = require 'fs'
readCarteroJSON = require "../component/utils/readCarteroJSON"
saveCarteroJSON = require "../component/utils/saveCarteroJSON"
AssetsProcessor = require "../model/assetsProcessor"

module.exports = (grunt)->

  grunt.registerMultiTask 'project_cartero_assets_processor', ()->

    options = @options({})
    assetsProcessors = options.assetsProcessors
    ProcessorClass = assetsProcessors?[options.assetsProcessorsIndex]

    if !( _.isString(ProcessorClass) or _.isFunction(ProcessorClass) )
      grunt.log.error "AssetsProcessor must be informed, otherwise cant process in currentIndex=#{options.assetsProcessorsIndex}"
      return false


    ProcessorClass =  assetsProcessors[options.assetsProcessorsIndex]
    if _.isString(ProcessorClass) then ProcessorClass = require ProcessorClass
    processor = new ProcessorClass(grunt, options)

    if !(processor instanceof AssetsProcessor)
      grunt.log.error "AssetsProcessor must be instanceof AssetsProcessor, but got function/class= #{ProcessorClass}"
      return false

    done = @async()

    readCarteroJSON(options)
    .then (carteroJSON)->
      Q.nfcall(processor.run, carteroJSON)
    .then (carteroJSON)->
      saveCarteroJSON(carteroJSON, options)
    .then ()->
      options.assetsProcessorsIndex++
      if assetsProcessors[options.assetsProcessorsIndex]?
        grunt.config ["project_cartero_assets_processor", "index#{options.assetsProcessorsIndex}", "options"], options
        grunt.task.run "project_cartero_assets_processor:index#{options.assetsProcessorsIndex}"
      done()
    .fail (error)->
      grunt.log.error error.stack or error
      grunt.log.error "Error while trying to execute project_cartero_move_process"
      done(error)
