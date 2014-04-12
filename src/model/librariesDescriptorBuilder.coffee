Q = require 'q'

LoggableObject = require '../component/utils/logger'

class LibrariesDescriptorBuilder extends LoggableObject
  constructor:(name, options)->
    super(name, options)

  getLibrary:(libraryId)=> Q.fcall ()=> throw new Error("Not Implemented")
  getCalculatedLibraries:()=> throw new Error("Not Implemented")


module.exports = LibrariesDescriptorBuilder
