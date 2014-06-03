_ = require 'lodash'
_s = require 'underscore.string'
fs = require 'fs'
path = require 'path'
Promise = require 'bluebird'
isFolder = require '../utils/isFolder'
fileExists = require '../utils/fileExists'
findFilesInFolder = require '../utils/findFilesInFolder'
findFilesInFolders = require '../utils/findFilesInFolders'
findFoldersInFolder = require '../utils/findFoldersInFolder'
readFile = Promise.promisify(fs.readFile, fs)

LibraryCreator = require '../../model/libraryCreator'
Library = require '../../model/library'
LibraryFile = require '../../model/libraryFile'

kBundleDefaults = LibraryCreator.bundleDefaults

## Responsible for Libraries that are real Folders
class DefaultLibraryCreator extends LibraryCreator

  constructor:(name, options)->
    if _.isUndefined(options)
      options = name
      name = "DEFAULT_LIBRARY_CREATOR"
    super(name, options)

  canCreateLibrary:(libraryId, libraries, options, callback)=>
    isFolder(path.join(options.librariesPath, libraryId))
    .then (isFolder)=>
      @trace "Can libraryId=#{libraryId} be handled by #{@name}=#{isFolder}"
      callback(null, isFolder)
    .error (error)->
      callback(null, false)

  createLibrary:(libraryId, libraries, options, callback)=>
    libraryPath = @internalCreateLibraryPath(libraryId, libraries, options)
    @trace "Trying to create library for id=#{libraryId}, path=#{libraryPath}"
    @internalLoadBundleJSON(libraryId, libraryPath, libraries, options)
    .then (bundleJSON)=>
      promises = []
      promises.push @internalCreateDependencies(libraryId, libraryPath, libraries, options, bundleJSON)
      promises.push @internalCreateLibraryFiles(libraryId, libraryPath, libraries, options, bundleJSON)
      promises.push @internalCreateLibraryRemoteFiles(libraryId, libraryPath, libraries, options, bundleJSON)
      promises.push @internalCreateSubLibraries(libraryId, libraryPath, libraries, options, bundleJSON)
      Promise.all(promises)
      .spread (dependencies, libraryFiles, libraryRemoteFiles, subLibraries)=>
        @trace "Correctly calculated everything for library id=#{libraryId}"
        return new Library
          libraryId: libraryId
          bundleJSON: bundleJSON
          dependencies: dependencies
          files: libraryFiles.concat(libraryRemoteFiles)
          options: options
    .then (library)=>
      @trace "Sucessfully created library #{libraryId}"
      callback(null, library)
    .error (error)=>
      @error msg:"Error while trying to create library id=#{libraryId}", error: error
      callback(new Error(error))

  internalCreateLibraryPath:(libraryId, libraries, options)-> path.join(options.librariesPath, libraryId)

  internalLoadBundleJSON:(libraryId, libraryPath, libraries, options)=>
    @trace "Loading bundleJSON for library id=#{libraryId}"
    bundleJSONPath = path.join(libraryPath, "bundle.json").toString()
    fileExists(bundleJSONPath)
    .then (exists)=>
      @trace "Does bundleJSON  exists for library id=#{libraryId}=#{exists}"
      if not exists then return {}
      else
        readFile(bundleJSONPath, "utf-8")
        .then (fileContents)=>
          @trace "Read bundleJSON for library id=#{libraryId}"
          jsonString = fileContents.toString()
          return JSON.parse(jsonString)
        .error (error)=>
          @trace error.stack or error
          @trace "Error while trying to read bundle.json of library id=#{libraryId}"
          return {}
    .then (bundleJSON)=>
      @trace "Correctly loaded bundleJSON for library id=#{libraryId}"
      return _.defaults bundleJSON, kBundleDefaults

  internalCreateDependencies:(libraryId, libraryPath, libraries, options, bundleJSON)=>
    dependencies = @internalDiscoverParentLibraries(libraryId).concat(bundleJSON.dependencies or [])
    @trace "Trying to create dependencies for library id=#{libraryId} with dependencies=#{JSON.stringify(dependencies)}"
    if !(_.isArray(dependencies) and dependencies.length > 0)
      @trace "No dependencies to create for library id=#{libraryId}"
      return []
    else
      promises = (libraries.getLibrary(dependency) for dependency in dependencies)
      Promise.all(promises).then (results)=>
        @trace "Correctly created dependencies for library id=#{libraryId}"
        return _.map results, (result)-> result.id

  internalDiscoverParentLibraries:(libraryId)=>
    if _s.include(libraryId, "/")
      parentDependencies = []
      base = libraryId
      while _s.include(base, "/")
        toRemove = _s.strRightBack(base, "/")
        base = _s.strLeft(base, "/"+toRemove)
        parentDependencies.unshift base
      return parentDependencies
    return []

  internalCreateLibraryFiles:(libraryId, libraryPath, libraries, options, bundleJSON)=>
    directoriesToFlatten = _.map bundleJSON.directoriesToFlatten, (dir)-> path.join(libraryPath, dir).toString()
    if bundleJSON.prioritizeFlattenedDirectories
      folders = [].concat directoriesToFlatten, [libraryPath]
    else
      folders = [libraryPath].concat directoriesToFlatten
    @trace "Trying to create library files for library id=#{libraryId} in folders=#{folders}"
    findFilesInFolders(folders, options.libraryFilesExtensions)
    .then (filePaths)=>
      dynamicallyLoadedFiles = _.map bundleJSON.dynamicallyLoadedFiles, (relativePath)-> path.resolve libraryPath, relativePath
      filePaths = _.uniq(filePaths.concat(dynamicallyLoadedFiles))
      @trace "Found #{filePaths.length} total of library files in folder of library id=#{libraryId}"
      notIgnoredFiles = _.filter filePaths, (filePath)->
        ! _.contains(bundleJSON.filesToIgnore, path.relative(libraryPath, filePath))
      sortedFiles = @sortLibraryFiles(libraryId, libraryPath, libraries, options, bundleJSON, notIgnoredFiles)
      return _.map sortedFiles, (filteredFilePath)-> new LibraryFile({type: "LOCAL", path: filteredFilePath})

  sortLibraryFiles:(libraryId, libraryPath, libraries, options, bundleJSON, notIgnoredFiles)=>
    if !( _.isArray(bundleJSON.filePriority) and bundleJSON.filePriority.length > 0 ) then return notIgnoredFiles
    notIgnoredRelativeFiles = _.map notIgnoredFiles, (filePath)-> path.relative(libraryPath, filePath)
    notSortedRelativeFiles = _.difference notIgnoredRelativeFiles, bundleJSON.filePriority
    sortedRelativeFiles = _.union bundleJSON.filePriority, notSortedRelativeFiles
    return _.map sortedRelativeFiles, (relativeFilePath)-> path.join(libraryPath, relativeFilePath)

  internalCreateLibraryRemoteFiles:(libraryId, libraryPath, libraries, options, bundleJSON)=>
    Promise.resolve().then ()=>
      @trace "Trying to create remote files for library id=#{libraryId}"
      remoteFiles = _.map bundleJSON.remoteFiles, (remotePath)-> new LibraryFile({type: "REMOTE", path: remotePath})
      @trace "Created #{remoteFiles.length} remoteFiles library id=#{libraryId}"
      return remoteFiles

  internalCreateSubLibraries:(libraryId, libraryPath, libraries, options, bundleJSON)=>
    @trace "Trying to create sub-libraries for library id=#{libraryId}"
    findFoldersInFolder(libraryPath, /\*./)
    .then (folders)=>
      filteredFolders = _.filter folders, (folderPath)->
        relativePath = path.relative(libraryPath, folderPath)
        !_.contains(bundleJSON.directoriesToIgnore, relativePath) and !_.contains(bundleJSON.directoriesToFlatten, relativePath)
      promises = (libraries.getLibrary(path.relative(options.librariesPath, folder)) for folder in filteredFolders)
      @trace "Trying to create sub-libraries for library id=#{libraryId} with folders=#{folders}, #{filteredFolders}"
      Promise.all promises




module.exports = DefaultLibraryCreator
