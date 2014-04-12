_ = require 'lodash'
availableTypes = ["LOCAL", "REMOTE"]

class LibraryFile
  constructor:(data)->
    @type = data?.type
    throw new Error("File type must be specified and in #{availableTypes}") if !_.contains(availableTypes, @type)
    @path = data?.path
    throw new Error("File path must be specified") if !( _.isString(@path) and @path.length > 0)


module.exports = LibraryFile
