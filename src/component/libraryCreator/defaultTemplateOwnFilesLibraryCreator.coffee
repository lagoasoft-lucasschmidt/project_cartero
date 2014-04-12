_ = require 'lodash'
fs = require 'fs'
path = require 'path'
Q = require 'q'

DefaultLibraryCreator = require './defaultLibraryCreator'
LibraryFile = require '../../model/libraryFile'



## Responsible  to create Library that belongs to own Template, files in the same folder
class DefaultTemplateOwnFilesLibraryCreator extends DefaultLibraryCreator

  constructor:(options)->
    super(options)
    @name = "TEMPLATE_OWN_FILES_LIBRARY_CREATOR"

  canCreateLibrary:(libraryId, libraries, options, callback)=> callback(new Error("This Template should only be used internally, not exposed"))

  internalCreateLibraryPath:(libraryId, libraries, options)-> libraryId

  internalLoadBundleJSON:(libraryId, libraryPath, libraries, options)=>
    @trace "Loading bundleJSON for library id=#{libraryId}"
    Q.fcall ()-> _.cloneDeep(DefaultLibraryCreator.bundleDefaults)

  internalCreateDependencies:(libraryId, libraryPath, libraries, options, bundleJSON)->
    Q.fcall ()-> []

  internalCreateLibraryFiles:(libraryId, libraryPath, libraries, options, bundleJSON)->
    ownFiles = options.ownFiles or []
    Q.fcall ()-> (new LibraryFile({type: "LOCAL", path: file}) for file in ownFiles)

  internalCreateLibraryRemoteFiles:(libraryId, libraryPath, libraries, options, bundleJSON)->
    Q.fcall ()=> []

  internalCreateSubLibraries:(libraryId, libraryPath, libraries, options, bundleJSON)->
    Q.fcall ()=> []



module.exports = DefaultTemplateOwnFilesLibraryCreator
