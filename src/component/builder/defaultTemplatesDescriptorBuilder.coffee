_ = require 'lodash'
Q = require 'q'
fs = require 'fs'
path = require 'path'

DefaultLibrariesDescriptorBuilder = require './defaultLibrariesDescriptorBuilder'
DefaultScannedTemplatesDescriptorBuilder = require './defaultScannedTemplatesDescriptorBuilder'

DefaultTemplateOwnFilesLibraryCreator = require('../libraryCreator/defaultTemplateOwnFilesLibraryCreator')


TemplatesDescriptorBuilder = require '../../model/templatesDescriptorBuilder'
ScannedTemplatesDescriptorBuilder = require '../../model/scannedTemplatesDescriptorBuilder'
LibrariesDescriptorBuilder = require '../../model/librariesDescriptorBuilder'

LibraryCreator = require '../../model/libraryCreator'
Library = require '../../model/library'
Template = require '../../model/template'
ScannedTemplate = require '../../model/scannedTemplate'

defaultOptions =
  templateOwnFilesLibraryCreator: DefaultTemplateOwnFilesLibraryCreator
  scannedTemplatesDescriptorBuilder: DefaultScannedTemplatesDescriptorBuilder
  librariesDescriptorBuilder: DefaultLibrariesDescriptorBuilder

class DefaultTemplatesDescriptorBuilder extends TemplatesDescriptorBuilder

  constructor:(options)->
    super("DEFAULT_TEMPLATES_DESC_BUILDER", options)
    @options = _.defaults options, defaultOptions
    # init templates own files creator
    if !_.isFunction(@options.templateOwnFilesLibraryCreator)
      throw new Error("templateOwnFilesLibraryCreator must be a function")
    @templateOwnFilesLibraryCreator = new @options.templateOwnFilesLibraryCreator(@options)
    if !(@templateOwnFilesLibraryCreator instanceof LibraryCreator)
      throw new Error("templateOwnFilesLibraryCreator must be a instanceof LibraryCreator")

    # init templates scanner
    if !_.isFunction(@options.scannedTemplatesDescriptorBuilder)
      throw new Error("scannedTemplatesDescriptorBuilder must be a function")
    @scanner = new @options.scannedTemplatesDescriptorBuilder(@options)
    if !(@scanner instanceof ScannedTemplatesDescriptorBuilder)
      throw new Error("scannedTemplatesDescriptorBuilder must be a instanceof ScannedTemplatesDescriptorBuilder")

    # init libraries builder
    if !_.isFunction(@options.librariesDescriptorBuilder)
      throw new Error("librariesDescriptorBuilder must be a function")
    @libraries = new @options.librariesDescriptorBuilder(@options)
    if !(@libraries instanceof LibrariesDescriptorBuilder)
      throw new Error("libraries must be a instanceof LibrariesDescriptorBuilder")
    # caches
    @scannedTemplatesMap = {}
    @templatesMap = {}

  buildTemplatesDescriptors:(callback)=>
    @debug "Will build template descriptors"
    Q.nfcall(@scanner.scanTemplates)
    .then (scannedTemplates)=>
      @debug "Created scannedTemplates, now, will build real templates descriptions"
      @scannedTemplatesMap[scannedTemplate.filePath] = scannedTemplate for scannedTemplate in scannedTemplates
      @debug "ScannedTemplates #{_.keys(@scannedTemplatesMap).length}=#{JSON.stringify(_.keys(@scannedTemplatesMap), null, 2)}"
      promises = (@internalBuildTemplateDescriptor(scannedTemplate) for scannedTemplate in scannedTemplates)
      Q.all(promises)
    .then (result)=>
      templatesNames = _.map result, (tmpl)-> return tmpl.filePath
      @info "Finished calculating all Template descriptors=#{result.length}=#{JSON.stringify(templatesNames, null, 2)}"
      librariesNames = _.sortBy(_.keys(@libraries.getCalculatedLibraries()))
      @info "All Libraries generated during this were #{librariesNames.length}=#{JSON.stringify(librariesNames, null, 2)}"
      callback(null, {templates:result, libraries: @libraries.getCalculatedLibraries()})
    .fail (error)=>
      @error msg:"Error while trying to build template descriptors", error: error
      callback(error)
    .done()

  internalBuildTemplateDescriptor:(scannedTemplate)=>
    @trace "Trying to create Template descriptor for scannedTemplate=#{scannedTemplate?.filePath}"
    if !(scannedTemplate instanceof ScannedTemplate)
      return Q.fcall ()-> throw new Error("scannedTemplate must be instanceof Scanned Template, but got=#{scannedTemplate}")
    # try on cache
    if @templatesMap[scannedTemplate.filePath]? then return Q.fcall ()=> @templatesMap[scannedTemplate.filePath]
    # process
    promises = []
    promises.push @internalCreateTemplateLibraryDependencies(scannedTemplate)
    if scannedTemplate.extend? and !@scannedTemplatesMap[scannedTemplate.extend]?
      return Q.fcall ()-> throw new Error("extend=#{scannedTemplate.extend} is not in ScannedTemplates map")
    if scannedTemplate.extend?
      promises.push @internalBuildTemplateDescriptor(@scannedTemplatesMap[scannedTemplate.extend])
    else
      promises.push Q.fcall ()=> return null
    promises.push @internalCreateTemplateIncludeDependencies(scannedTemplate)
    promises.push @internalCreateTemplateOwnFilesLibrary(scannedTemplate)
    Q.all(promises)
    .spread (libraries, extend, includes, ownFiles)=>
      @trace "Created scannedTemplate #{scannedTemplate.filePath} with libraries=#{libraries.length}, extend=#{extend?},
      includes=#{includes.length}, ownFiles=#{ownFiles.length}"
      newTemplate = new Template
        filePath: scannedTemplate.filePath
        extend: extend?.filePath
        includes: _.map includes, (incl)-> incl.filePath
        ownFiles: ownFiles
        libraryDependencies: _.map libraries, (lib)-> return lib.id
      @templatesMap[scannedTemplate.filePath] = newTemplate
      return newTemplate

  internalCreateTemplateLibraryDependencies:(scannedTemplate)=>
    @trace "Trying to find library dependencies for template #{scannedTemplate.filePath}"
    promises = (@libraries.getLibrary(lib) for lib in scannedTemplate.libraryDependencies)
    Q.all(promises).then (libs)-> return libs

  internalCreateTemplateIncludeDependencies:(scannedTemplate)=>
    @trace "Trying to find included dependencies for template #{scannedTemplate.filePath}"
    promises = (@internalBuildTemplateDescriptor(@scannedTemplatesMap[incl]) for incl in scannedTemplate.includes)
    Q.all(promises).then (deps)-> return deps

  internalCreateTemplateOwnFilesLibrary:(scannedTemplate)=>
    @trace "Trying to create Library for Own Files of template #{scannedTemplate.filePath}"
    deferred = Q.defer()
    createOpts = _.defaults {ownFiles: scannedTemplate.ownFiles or []}, @options
    @templateOwnFilesLibraryCreator.createLibrary scannedTemplate.filePath, @libraries, createOpts, (error, newLibrary)->
      if error then return deferred.reject(new Error(error))
      else deferred.resolve(newLibrary)
    return deferred.promise

module.exports = DefaultTemplatesDescriptorBuilder
