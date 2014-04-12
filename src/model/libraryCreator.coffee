_ = require 'lodash'
LoggableObject = require '../component/utils/logger'

class LibraryCreator extends LoggableObject

  @bundleDefaults =
    keepSeparate : false
    dependencies : []
    directoriesToIgnore : []
    directoriesToFlatten: []
    prioritizeFlattenedDirectories : false
    filePriority : []
    filesToIgnore : []
    dynamicallyLoadedFiles : []
    remoteFiles : []

  constructor:(@name, @options)->
    super(@name, @options)
    throw new Error("Name must be defined") if !(_.isString(@name) and @name.length > 0)
    throw new Error("Options must be informed, but got #{JSON.stringify(@options)}") if !_.isObject(@options)

  canCreateLibrary:(libraryId, libraries, options, callback)-> callback(null, false)

  createLibrary:(libraryId, libraries, options, callback)-> callback(null, null)



module.exports = LibraryCreator
