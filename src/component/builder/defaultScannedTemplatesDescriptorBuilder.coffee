_ = require 'lodash'
_s = require 'underscore.string'
Q = require 'q'
fs = require 'fs'
path = require 'path'
findAllFilesBelowFolder = require '../utils/findAllFilesBelowFolder'
findFilesInFolder = require '../utils/findFilesInFolder'

LibraryCreator = require '../../model/libraryCreator'
Library = require '../../model/library'
ScannedTemplate = require '../../model/scannedTemplate'
ScannedTemplatesDescriptorBuilder = require '../../model/scannedTemplatesDescriptorBuilder'
LibrariesDescriptorBuilder = require '../../model/librariesDescriptorBuilder'

DefaultLibrariesDescriptorBuilder = require './defaultLibrariesDescriptorBuilder'
DefaultTemplateOwnFilesLibraryCreator = require('../libraryCreator/defaultTemplateOwnFilesLibraryCreator')

defaultOptions =
  templatesPath: ""
  templatesExtensions: /.*\.jade$/
  templatesOwnFilesExtensions: /.*\.(coffee|js|css|less)$/
  librariesDescriptorBuilder: DefaultLibrariesDescriptorBuilder
  templateOwnFilesLibraryCreator: DefaultTemplateOwnFilesLibraryCreator


kCarteroRequiresDirective = "##cartero_requires"
kCarteroExtendsDirective = "##cartero_extends"

carteroRequiresRegExp = /##cartero_requires((\s*['"].*?['"]\s*,?\s*\n?)+)/
carteroExtendsRegExp = new RegExp( kCarteroExtendsDirective + " [\"'](.*?)[\"']" )

class DefaultScannedTemplatesDescriptorBuilder extends ScannedTemplatesDescriptorBuilder

  constructor:(options)->
    super("SCANNED_TEMPLATES_DESC_BUILDER", options)
    @options = _.defaults options, defaultOptions
    throw new Error("templatesPath must be specified, otherwise, whats the point?") if !_.isString(@options.templatesPath) or @options.templatesPath.length is 0
    throw new Error("templatesExtensions must be specified, and a RegExp, otherwise, whats the point?") if !(@options.templatesExtensions instanceof RegExp)

    # init templates own files creator
    if !_.isFunction(@options.templateOwnFilesLibraryCreator)
      throw new Error("templateOwnFilesLibraryCreator must be a function")
    @templateOwnFilesLibraryCreator = new @options.templateOwnFilesLibraryCreator(@options)
    if !(@templateOwnFilesLibraryCreator instanceof LibraryCreator)
      throw new Error("templateOwnFilesLibraryCreator must be a instanceof LibraryCreator")

    # init libraries builder
    if !_.isFunction(@options.librariesDescriptorBuilder)
      throw new Error("librariesDescriptorBuilder must be a function")
    @libraries = new @options.librariesDescriptorBuilder(@options)
    if !(@libraries instanceof LibrariesDescriptorBuilder)
      throw new Error("libraries must be a instanceof LibrariesDescriptorBuilder")

    @templatesCache = {}

  scanTemplates:(callback)=>
    findAllFilesBelowFolder(@options.templatesPath, @options.templatesExtensions)
    .then (files)=>
      promises = (@internalScanTemplate(file) for file in files)
      Q.all promises
    .then (scannedTemplates)-> callback(null, scannedTemplates)
    .fail (error)=>
      @error msg: "Error while trying to scan templates", error: error
      callback(new Error(error))

  internalScanTemplate:(file)=>
    if @templatesCache[file]? then return Q.fcall ()=>
      @debug "Found template #{file} already cached"
      return @templatesCache[file]

    @trace "Found template #{file}, will process it"
    Q.nfcall(fs.readFile, file, "utf-8")
    .then (data)=>
      fileContents = data.toString()
      promises = []
      promises.push @internalFindExtendsDependency(file, fileContents)
      promises.push @internalFindIncludedTemplates(file, fileContents)
      promises.push @internalFindLibraryDependencies(file, fileContents)
      promises.push @internalFindOwnFiles(file, fileContents)
      Q.all promises
      .spread (extend, includes, libraryDependencies, ownFiles)=>
        return new ScannedTemplate
          filePath: file
          extend: extend
          includes: includes
          libraryDependencies: libraryDependencies
          ownFiles: ownFiles
    .then (template)=>
      @templatesCache[file] = template
      return template

  internalFindExtendsDependency:(filePath, fileContents)=>
    Q.fcall ()=>
      carteroExtendsMatches = carteroExtendsRegExp.exec(fileContents)
      if !_.isNull(carteroExtendsMatches)
        return path.join @options.templatesPath, carteroExtendsMatches[1]
      else
        myRegex = /extends\s.*/g;
        matches = []
        while ((partialMatches = myRegex.exec(fileContents)) != null)
          matches.push partialMatches[0]
        if !_.isArray(matches) then return null
        matches = _.map matches, (match)->
          match = _s.strRight(match, "extends ")
          return path.resolve filePath, "..", match+".jade"
        matches = _.filter matches, (match)->
          return fs.existsSync(match)
        if matches.length > 0 then return matches[0] else return null
    .then (extend)=>
      # scan extend but return only name
      if not extend?.length then return
      @internalScanTemplate(extend).then ()-> return extend

  internalFindIncludedTemplates:(filePath, fileContents)=>
    Q.fcall ()=>
      myRegex = /include\s.*/g;
      matches = []
      while ((partialMatches = myRegex.exec(fileContents)) != null)
        matches.push partialMatches[0]
      if !_.isArray(matches) then return null
      matches = _.map matches, (match)->
        match = _s.strRight(match, "include ")
        return path.resolve filePath, "..", match+".jade"
      matches = _.filter matches, (match)->
        return fs.existsSync(match)
    .then (deps)=>
      # scan each included dep, but return only the filepaths
      if not deps?.length then return []
      promises = @internalScanTemplate(dep) for dep in deps
      Q.all(promises).then ()-> return deps

  internalFindLibraryDependencies:(filePath, fileContents)=>
    Q.fcall ()=>
      libraryDependencies = []
      carteroRequiresMatches = carteroRequiresRegExp.exec(fileContents)
      if _.isNull(carteroRequiresMatches) then return libraryDependencies
      directiveParamsString = carteroRequiresMatches[1]
      try
        libraryDependencies = JSON.parse("[" + directiveParamsString + "]")
      catch error
        @error "Requires directive is wrong for filePath=#{filePath}.
        Given data is #{directiveParamsString}. It needs to be parsed as a JSON, if added array brackets around it", error: error
      return libraryDependencies
    .then (libraryDependencies)=>
      # scan libraries, but return only names
      promises = (@libraries.getLibrary(lib) for lib in libraryDependencies)
      Q.all(promises).then ()-> return libraryDependencies

  internalFindOwnFiles:(filePath, fileContents)=>
    findFilesInFolder(path.join(filePath, ".."), @options.templatesOwnFilesExtensions)
      .then (filePaths)=>
        deferred = Q.defer()
        createOpts = _.defaults {ownFiles: filePaths or []}, @options
        @templateOwnFilesLibraryCreator.createLibrary filePath, @libraries, createOpts, (error, newLibrary)->
          if error then return deferred.reject(new Error(error))
          else deferred.resolve(newLibrary)
        return deferred.promise

  getCalculatedLibraries:()=> @libraries.getCalculatedLibraries()

module.exports = DefaultScannedTemplatesDescriptorBuilder
