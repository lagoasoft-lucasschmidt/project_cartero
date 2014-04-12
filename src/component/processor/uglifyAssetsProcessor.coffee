_ = require 'lodash'
Q = require 'q'
fs = require 'fs'
path = require 'path'
fileExtension = require '../utils/fileExtension'

AssetsProcessor = require '../../model/assetsProcessor'

mkdirp = require 'mkdirp'

class UglifyAssetsProcessor extends AssetsProcessor
  constructor:(grunt, options)->
    super("UGLIFY_ASSETS_PROCESSOR", grunt, options)

  run:(carteroJSON, callback)=>
    Q(null).then ()=>
      promises = []
      promises.push @uglifyLibraryAssets(carteroJSON)
      promises.push @uglifyViewsAssets(carteroJSON)
      Q.all(promises)
    .then ()=>
      @info msg: "Successfully runned UglifyAssetsProcessor"
      callback(null, carteroJSON)
    .fail (error)=>
      @error msg:"rror while trying to run UglifyAssetsProcessor", error: error
      callback(new Error(error))


  uglifyLibraryAssets:(carteroJSON)=>
    Q.fcall ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        for libraryId in template.libraryDependencies
          library = carteroJSON.libraries[libraryId]
          @uglifyFilesInLibrary(carteroJSON, library, processedLibraries, files)
      @uglifyLibraryFiles files

  uglifyFilesInLibrary:(carteroJSON, library, processedLibraries, files)=>
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        if fileExtension(file.path) is "js"
          files.push src:file.path, dest:file.path
      for otherLibId in library.dependencies
        otherLib = carteroJSON.libraries[otherLibId]
        @uglifyFilesInLibrary(carteroJSON, otherLib, processedLibraries, files)

  uglifyLibraryFiles:(files)=>
    @grunt.config( [ "uglify", "project_cartero_uglify_library_files" ], {files: files} )
    @grunt.task.run "uglify:project_cartero_uglify_library_files"
    @logger.debug "created uglify grunt job with options #{JSON.stringify({files: files}, null, 2)}"


  uglifyViewsAssets:(carteroJSON)=>
    Q.fcall ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        if template.ownFiles?
          @uglifyViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files)
      @uglifyViewsFiles files

  uglifyViewFilesInLibrary:(carteroJSON, library, processedLibraries, files)->
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        if fileExtension(file.path) is "js"
          files.push src:file.path, dest:file.path

  uglifyViewsFiles:(files)=>
    @grunt.config( [ "uglify", "project_cartero_uglify_views_files" ], {files: files} )
    @grunt.task.run "uglify:project_cartero_uglify_views_files"
    @logger.debug "created uglify grunt job with options #{JSON.stringify({files: files}, null, 2)}"


module.exports = UglifyAssetsProcessor
