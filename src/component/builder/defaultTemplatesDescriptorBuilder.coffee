_ = require 'lodash'
Promise = require 'bluebird'
fs = require 'fs'
path = require 'path'

DefaultScannedTemplatesDescriptorBuilder = require './defaultScannedTemplatesDescriptorBuilder'

TemplatesDescriptorBuilder = require '../../model/templatesDescriptorBuilder'
ScannedTemplatesDescriptorBuilder = require '../../model/scannedTemplatesDescriptorBuilder'

defaultOptions =
  scannedTemplatesDescriptorBuilder: DefaultScannedTemplatesDescriptorBuilder

class DefaultTemplatesDescriptorBuilder extends TemplatesDescriptorBuilder

  constructor:(options)->
    super("DEFAULT_TEMPLATES_DESC_BUILDER", options)
    @options = _.defaults options, defaultOptions

    # init templates scanner
    if !_.isFunction(@options.scannedTemplatesDescriptorBuilder)
      throw new Error("scannedTemplatesDescriptorBuilder must be a function")
    @scanner = new @options.scannedTemplatesDescriptorBuilder(@options)
    if !(@scanner instanceof ScannedTemplatesDescriptorBuilder)
      throw new Error("scannedTemplatesDescriptorBuilder must be a instanceof ScannedTemplatesDescriptorBuilder")

  buildTemplatesDescriptors:(callback)=>
    @debug "Will build template descriptors"

    Promise.promisify(@scanner.scanTemplates)()
    .then (scannedTemplates)=>
      @debug "ScannedTemplates=#{JSON.stringify(scannedTemplates, null, 2)}"
      return scannedTemplates
    .then (result)=>
      templatesNames = _.map result, (tmpl)-> return tmpl.filePath
      @info "Finished calculating all Template descriptors=#{result.length}=#{JSON.stringify(templatesNames, null, 2)}"
      librariesNames = _.sortBy(_.keys(@scanner.getCalculatedLibraries()))
      @info "All Libraries generated during this were #{librariesNames.length}=#{JSON.stringify(librariesNames, null, 2)}"
      callback(null, {templates:result, libraries: @scanner.getCalculatedLibraries()})
    .error (error)=>
      @error msg:"Error while trying to build template descriptors", error: error
      callback(error)


module.exports = DefaultTemplatesDescriptorBuilder
