_ = require 'lodash'
LibraryFile = require './libraryFile'

class Library
  constructor:(data)->
    @id = data?.libraryId or throw new Error("Library id must be specified")
    @bundleJSON = data?.bundleJSON or throw new Error("Bundle JSON must be informed")
    @dependencies = data?.dependencies or []
    throw new Error("Dependencies must be an array") if !_.isArray(@dependencies)
    throw new Error("Dependencies must be instances of String") for dependency in @dependencies when !_.isString(dependency)
    @files = data?.files or []
    throw new Error("files must be an array") if !_.isArray(@files)
    throw new Error("Files must be instances of LibraryFile") for file in @files when !(file instanceof LibraryFile)

module.exports = Library
