_ = require 'lodash'
fs = require 'fs'
path = require 'path'
Q = require 'q'
isFolder = require '../utils/isFolder'
fileExists = require '../utils/fileExists'
findFilesInFolder = require '../utils/findFilesInFolder'
findFilesInFolders = require '../utils/findFilesInFolders'
findFoldersInFolder = require '../utils/findFoldersInFolder'

LibraryCreator = require '../../model/libraryCreator'
Library = require '../../model/library'
LibraryFile = require '../../model/libraryFile'

kBundleDefaults =
  keepSeparate : false
  dependencies : []
  directoriesToIgnore : []
  directoriesToFlatten: []
  prioritizeFlattenedDirectories : false
  filePriority : []
  filesToIgnore : []
  dynamicallyLoadedFiles : []
  remoteFiles : []

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
    .fail (error)->
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
      Q.all(promises)
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
    .fail (error)=>
      @error msg:"Error while trying to create library id=#{libraryId}", error: error
      callback(new Error(error))
    .done()

  internalCreateLibraryPath:(libraryId, libraries, options)-> path.join(options.librariesPath, libraryId)

  internalLoadBundleJSON:(libraryId, libraryPath, libraries, options)=>
    @trace "Loading bundleJSON for library id=#{libraryId}"
    bundleJSONPath = path.join(libraryPath, "bundle.json").toString()
    fileExists(bundleJSONPath)
    .then (exists)=>
      @trace "Does bundleJSON  exists for library id=#{libraryId}=#{exists}"
      if not exists then return {}
      else
        Q.nfcall(fs.readFile, bundleJSONPath, "utf-8")
        .then (fileContents)=>
          @trace "Read bundleJSON for library id=#{libraryId}"
          jsonString = fileContents.toString()
          return JSON.parse(jsonString)
        .fail (error)=>
          @trace error.stack or error
          @trace "Error while trying to read bundle.json of library id=#{libraryId}"
          return {}
    .then (bundleJSON)=>
      @trace "Correctly loaded bundleJSON for library id=#{libraryId}"
      return _.defaults bundleJSON, kBundleDefaults

  internalCreateDependencies:(libraryId, libraryPath, libraries, options, bundleJSON)=>
    dependencies = bundleJSON.dependencies
    @trace "Trying to create dependencies for library id=#{libraryId} with dependencies=#{JSON.stringify(dependencies)}"
    if !(_.isArray(dependencies) and dependencies.length > 0)
      @trace "No dependencies to create for library id=#{libraryId}"
      return []
    else
      promises = (libraries.getLibrary(dependency) for dependency in dependencies)
      Q.all(promises).then (results)=>
        @trace "Correctly created dependencies for library id=#{libraryId}"
        return _.map results, (result)-> result.id

  internalCreateLibraryFiles:(libraryId, libraryPath, libraries, options, bundleJSON)=>
    directoriesToFlatten = _.map bundleJSON.directoriesToFlatten, (dir)-> path.join(libraryPath, dir).toString()
    if bundleJSON.prioritizeFlattenedDirectories
      folders = [].concat directoriesToFlatten, [libraryPath]
    else
      folders = [libraryPath].concat directoriesToFlatten
    @trace "Trying to create library files for library id=#{libraryId} in folders=#{folders}"
    findFilesInFolders(folders, options.libraryFilesExtensions)
    .then (filePaths)=>
      @trace "Found #{filePaths.length} total of library files in folder of library id=#{libraryId}"
      notIgnoredFiles = _.filter filePaths, (filePath)->
        ! _.contains(bundleJSON.filesToIgnore, path.relative(libraryPath, filePath.toString()))
      sortedFiles = @sortLibraryFiles(libraryId, libraryPath, libraries, options, bundleJSON, notIgnoredFiles)
      return _.map sortedFiles, (filteredFilePath)-> new LibraryFile({type: "LOCAL", path: filteredFilePath.toString()})

  sortLibraryFiles:(libraryId, libraryPath, libraries, options, bundleJSON, notIgnoredFiles)->
    if !( _.isArray(bundleJSON.filePriority) and bundleJSON.filePriority.length > 0 ) then return notIgnoredFiles
    notIgnoredRelativeFiles = _.map notIgnoredFiles, (filePath)-> path.relative(librariesPath, filePath)
    notSortedRelativeFiles = _.difference bundleJSON.filePriority, notIgnoredRelativeFiles
    sortedRelativeFiles = _.union bundleJSON.filePriority, notSortedRelativeFiles
    return _.map sortedRelativeFiles, (relativeFilePath)-> path.join(libraryPath, relativeFilePath)

  internalCreateLibraryRemoteFiles:(libraryId, libraryPath, libraries, options, bundleJSON)=>
    @trace "Trying to create remote files for library id=#{libraryId}"
    Q.fcall ()=>
      remoteFiles = _.map bundleJSON.remoteFiles, (remotePath)-> new LibraryFile({type: "REMOTE", path: remotePath})
      @trace "Created #{remoteFiles.length} remoteFiles library id=#{libraryId}"
      return remoteFiles

  internalCreateSubLibraries:(libraryId, libraryPath, libraries, options, bundleJSON)=>
    @trace "Trying to create sub-libraries for library id=#{libraryId}"
    findFoldersInFolder(libraryPath, /\*./)
    .then (folders)=>
      filteredFolders = _.filter folders, (folderPath)->
        !_.contains(bundleJSON.directoriesToIgnore, path.relative(libraryPath, folderPath))
      promises = (libraries.getLibrary(path.relative(options.librariesPath, folder)) for folder in filteredFolders)
      @trace "Trying to create sub-libraries for library id=#{libraryId} with folders=#{folders}, #{filteredFolders}"
      Q.all promises




module.exports = DefaultLibraryCreator
