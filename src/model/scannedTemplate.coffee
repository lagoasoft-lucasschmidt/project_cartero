_ = require 'lodash'
Library = require './library'

class ScannedTemplate
  constructor:(data)->
    @filePath = data?.filePath or throw new Error("File Path must be specified")
    @extend = data?.extend
    @libraryDependencies = data?.libraryDependencies or []
    @includes = data?.includes or []
    @ownFiles = data?.ownFiles or []

module.exports = ScannedTemplate
