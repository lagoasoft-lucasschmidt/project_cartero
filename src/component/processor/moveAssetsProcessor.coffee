_ = require 'lodash'
Q = require 'q'
fs = require 'fs'
path = require 'path'
readCarteroJSON = require '../utils/readCarteroJSON'
AssetsProcessor = require '../../model/assetsProcessor'

mkdirp = require 'mkdirp'

class MoveAssetsProcessor extends AssetsProcessor
  constructor:(grunt, options)->
    super("MOVE_ASSETS_PROCESSOR", grunt, options)

  run:(carteroJSON, callback)=>
    Q(null).then ()=>
      promises = []
      promises.push @moveLibraryAssets(carteroJSON)
      promises.push @moveViewsAssets(carteroJSON)
      Q.all(promises)
    .then ()=>
      @debug msg: "Successfully runned MoveAssetsProcessor"
      callback(null, carteroJSON)
    .fail (error)=>
      @error msg:"Error while trying to run MoveAssetsProcessor", error: error
      callback(new Error(error))


  moveLibraryAssets:(carteroJSON)=>
    Q.fcall ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        for libraryId in template.libraryDependencies
          library = carteroJSON.libraries[libraryId]
          @moveFilesInLibrary(carteroJSON, library, processedLibraries, files)
      @copyLibraryFiles files

  moveFilesInLibrary:(carteroJSON, library, processedLibraries, files)=>
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        newPath = path.join @options.librariesDestinationPath, "library-assets", path.relative(@options.librariesPath, file.path)
        files.push src:file.path, dest:newPath
        file.path = newPath
      for otherLibId in library.dependencies
        otherLib = carteroJSON.libraries[otherLibId]
        @moveFilesInLibrary(carteroJSON, otherLib, processedLibraries, files)

  copyLibraryFiles:(files)=>
    copyOptions =
      files: files
    @grunt.config( [ "copy", "project_cartero_move_library_files" ], copyOptions )
    @grunt.task.run "copy:project_cartero_move_library_files"
    @logger.debug "created copy grunt job with options #{JSON.stringify(copyOptions, null, 2)}"

  moveViewsAssets:(carteroJSON)=>
    Q.fcall ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        if template.ownFiles?
          @moveViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files)
      @copyViewsFiles files

  moveViewFilesInLibrary:(carteroJSON, library, processedLibraries, files)=>
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        newPath = path.join @options.librariesDestinationPath, "views-assets", path.relative(@options.templatesPath, file.path)
        files.push src:file.path, dest:newPath
        file.path = newPath

  copyViewsFiles:(files)=>
    copyOptions =
      files: files
    @grunt.config( [ "copy", "project_cartero_move_views_files" ], copyOptions )
    @grunt.task.run "copy:project_cartero_move_views_files"
    @logger.debug "created copy grunt job with options #{JSON.stringify(copyOptions, null, 2)}"



module.exports = MoveAssetsProcessor
