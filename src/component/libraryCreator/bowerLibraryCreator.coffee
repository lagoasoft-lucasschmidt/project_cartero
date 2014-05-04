_ = require 'lodash'
fs = require 'fs'
path = require 'path'
Promise = require 'bluebird'
isFolder = require '../utils/isFolder'
readFile = Promise.promisify(fs.readFile, fs)

LibraryCreator = require '../../model/libraryCreator'
Library = require '../../model/library'
LibraryFile = require '../../model/libraryFile'


findBowerDependencies = require('bower-files/lib/process-dependencies')

## Responsible for Libraries that are real Folders
class BowerLibraryCreator extends LibraryCreator

  constructor:(options)->
    super("BOWER_LIBRARY_CREATOR", options)

  canCreateLibrary:(libraryId, libraries, options, callback)=>
    isFolder(path.join(options.bowerComponentsPath, libraryId))
    .then (isFolder)=>
      @trace "Can libraryId=#{libraryId} be handled by #{@name}=#{isFolder}"
      callback(null, isFolder)
    .error (error)->
      callback(null, false)

  createLibrary:(libraryId, libraries, options, callback)=>
    libraryPath = path.resolve(options.bowerComponentsPath, libraryId)
    @trace "Trying to create library for id=#{libraryId}, path=#{libraryPath}"
    @readBowerLibrary(libraryPath, libraryId, libraries, options)
    .then (filesFound)=>
      scannedFiles = _.map filesFound, (fileFound)-> return new LibraryFile({type: "BOWER", path: fileFound})
      @trace "Correctly calculated everything for library id=#{libraryId}"
      return new Library
        libraryId: libraryId
        bundleJSON: _.cloneDeep(LibraryCreator.bundleDefaults)
        dependencies: []
        files: scannedFiles
        options: options
    .then (library)=>
      @trace "Sucessfully created library #{libraryId}"
      callback(null, library)
    .error (error)=>
      @error msg:"Error while trying to create library id=#{libraryId}", error: error
      callback(new Error(error))

  readBowerLibrary:(libraryPath, libraryId, libraries, options)=>
    Promise.resolve().then ()=>
      fakeDependencies = {}
      fakeDependencies[libraryId] = null
      filesFound = findBowerDependencies(fakeDependencies, options.bowerComponentsPath)
      @debug "Found bower dependencies for #{libraryId} as #{JSON.stringify(filesFound, null, 2)}"
      if filesFound.error? then throw new Error(filesFound.error)
      return filesFound.paths or []




module.exports = BowerLibraryCreator
