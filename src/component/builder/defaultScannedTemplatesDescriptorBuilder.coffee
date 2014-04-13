_ = require 'lodash'
_s = require 'underscore.string'
Q = require 'q'
fs = require 'fs'
path = require 'path'
findAllFilesBelowFolder = require '../utils/findAllFilesBelowFolder'
findFilesInFolder = require '../utils/findFilesInFolder'


ScannedTemplate = require '../../model/scannedTemplate'
ScannedTemplatesDescriptorBuilder = require '../../model/scannedTemplatesDescriptorBuilder'

defaultOptions =
  templatesPath: ""
  templatesExtensions: /.*\.jade$/
  templatesOwnFilesExtensions: /.*\.(coffee|js|css|less)$/

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

  internalFindOwnFiles:(filePath, fileContents)=> findFilesInFolder(path.join(filePath, ".."), @options.templatesOwnFilesExtensions)




module.exports = DefaultScannedTemplatesDescriptorBuilder
