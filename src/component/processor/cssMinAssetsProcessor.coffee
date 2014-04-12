_ = require 'lodash'
Q = require 'q'
fs = require 'fs'
path = require 'path'
fileExtension = require '../utils/fileExtension'

AssetsProcessor = require '../../model/assetsProcessor'

mkdirp = require 'mkdirp'

class CssMinAssetsProcessor extends AssetsProcessor
  constructor:(grunt, options)->
    super("CSS_MIN_ASSETS_PROCESSOR", grunt, options)

  run:(carteroJSON, callback)=>
    Q(null).then ()=>
      promises = []
      promises.push @cssMinLibraryAssets(carteroJSON)
      promises.push @cssMinViewsAssets(carteroJSON)
      Q.all(promises)
    .then ()=>
      @info msg: "Successfully runned CssMinAssetsProcessor"
      callback(null, carteroJSON)
    .fail (error)=>
      @error msg:"rror while trying to run CssMinAssetsProcessor", error: error
      callback(new Error(error))


  cssMinLibraryAssets:(carteroJSON)=>
    Q.fcall ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        for libraryId in template.libraryDependencies
          library = carteroJSON.libraries[libraryId]
          @cssMinFilesInLibrary(carteroJSON, library, processedLibraries, files)
      @cssMinLibraryFiles files

  cssMinFilesInLibrary:(carteroJSON, library, processedLibraries, files)=>
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        if fileExtension(file.path) is "css"
          files.push src:file.path, dest:file.path
      for otherLibId in library.dependencies
        otherLib = carteroJSON.libraries[otherLibId]
        @cssMinFilesInLibrary(carteroJSON, otherLib, processedLibraries, files)

  cssMinLibraryFiles:(files)=>
    @grunt.config( [ "cssmin", "project_cartero_cssmin_library_files" ], {files: files} )
    @grunt.task.run "cssmin:project_cartero_cssmin_library_files"
    @logger.debug "created cssmin grunt job with options #{JSON.stringify({files: files}, null, 2)}"


  cssMinViewsAssets:(carteroJSON)=>
    Q.fcall ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        if template.ownFiles?
          @cssMinViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files)
      @cssMinViewsFiles files

  cssMinViewFilesInLibrary:(carteroJSON, library, processedLibraries, files)->
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        if fileExtension(file.path) is "css"
          files.push src:file.path, dest:file.path

  cssMinViewsFiles:(files)=>
    @grunt.config( [ "cssmin", "project_cartero_cssmin_views_files" ], {files: files} )
    @grunt.task.run "cssmin:project_cartero_cssmin_views_files"
    @logger.debug "created cssmin grunt job with options #{JSON.stringify({files: files}, null, 2)}"


module.exports = CssMinAssetsProcessor
