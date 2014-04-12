_ = require 'lodash'
Library = require './library'

class Template
  constructor:(data)->
    @filePath = data?.filePath or throw new Error("File Path must be specified")
    throw new Error("Filepath must be informed and a valid string") if !(_.isString(@filePath) and @filePath.length > 0)
    @extend = data?.extend
    throw new Error("Extends must be null or String") if @extend? and !_.isString(@extend)
    @libraryDependencies = data?.libraryDependencies or []
    throw new Error("Library Dependencies must be Array") if !_.isArray(@libraryDependencies)
    throw new Error("Library Dependencies must be String instances") for lib in @libraryDependencies when !_.isString(lib)
    @includes = data?.includes or []
    throw new Error("Includes must be Array") if !_.isArray(@includes)
    throw new Error("Includes must be String instances") for templ in @includes when !_.isString(templ)
    @ownFiles = data?.ownFiles
    throw new Error("Own Files must be Library instance or null") if @ownFiles? and !(@ownFiles instanceof Library)

module.exports = Template
