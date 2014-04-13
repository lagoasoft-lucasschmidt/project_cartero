_ = require 'lodash'
Q = require 'q'
fs = require 'fs'
path = require 'path'
fileExtension = require '../utils/fileExtension'

AssetsProcessor = require '../../model/assetsProcessor'

mkdirp = require 'mkdirp'

class CoffeeAssetsProcessor extends AssetsProcessor
  constructor:(grunt, options)->
    super("COFFEE_ASSETS_PROCESSOR", grunt, options)

  run:(carteroJSON, callback)=>
    Q(null).then ()=>
      promises = []
      promises.push @coffeeCompileLibraryAssets(carteroJSON)
      promises.push @coffeeCompileViewsAssets(carteroJSON)
      Q.all(promises)
    .spread (filesToDelete, otherFilesToDelete)=>
      filesToDelete = filesToDelete.concat otherFilesToDelete
      @deleteSrcFiles filesToDelete
      @debug msg: "Successfully runned CoffeeAssetsProcessor"
      callback(null, carteroJSON)
    .fail (error)=>
      @error msg:"rror while trying to run CoffeeAssetsProcessor", error: error
      callback(new Error(error))


  renameDestinationFile:(filePath)->
    newPath = path.resolve(filePath, '..')
    return path.resolve newPath, path.basename(filePath, '.coffee')+".js"

  coffeeCompileLibraryAssets:(carteroJSON)=>
    Q.fcall ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        for libraryId in template.libraryDependencies
          library = carteroJSON.libraries[libraryId]
          @coffeeCompileFilesInLibrary(carteroJSON, library, processedLibraries, files)
      @coffeeCompileLibraryFiles files
      return (file.src for file in files)

  coffeeCompileFilesInLibrary:(carteroJSON, library, processedLibraries, files)=>
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        if fileExtension(file.path) is "coffee"
          dest = @renameDestinationFile(file.path)
          files.push src:file.path, dest:dest
          relativeLibPath = path.relative path.resolve(@options.librariesDestinationPath, "library-assets", library.id), file.path
          if _.contains(library.bundleJSON.dynamicallyLoadedFiles, relativeLibPath)
            index = library.bundleJSON.dynamicallyLoadedFiles.indexOf(relativeLibPath)
            library.bundleJSON.dynamicallyLoadedFiles[index] = path.relative path.resolve(@options.librariesDestinationPath, "library-assets", library.id), dest
          file.path = dest
      for otherLibId in library.dependencies
        otherLib = carteroJSON.libraries[otherLibId]
        @coffeeCompileFilesInLibrary(carteroJSON, otherLib, processedLibraries, files)

  coffeeCompileLibraryFiles:(files)=>
    @grunt.config( [ "coffee", "project_cartero_coffee_library_files" ], {files: files} )
    @grunt.task.run "coffee:project_cartero_coffee_library_files"
    @logger.debug "created coffee grunt job with options #{JSON.stringify({files: files}, null, 2)}"


  coffeeCompileViewsAssets:(carteroJSON)=>
    Q.fcall ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        if template.ownFiles?
          @coffeeCompileViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files)
      @coffeeCompileViewsFiles files
      return (file.src for file in files)

  coffeeCompileViewFilesInLibrary:(carteroJSON, library, processedLibraries, files)->
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        if fileExtension(file.path) is "coffee"
          dest = @renameDestinationFile(file.path)
          files.push src:file.path, dest:dest
          file.path = dest

  coffeeCompileViewsFiles:(files)=>
    @grunt.config( [ "coffee", "project_cartero_coffee_views_files" ], {files: files} )
    @grunt.task.run "coffee:project_cartero_coffee_views_files"
    @logger.debug "created coffee grunt job with options #{JSON.stringify({files: files}, null, 2)}"


  deleteSrcFiles:(files)=>
    @grunt.config( [ "clean", "project_cartero_clean_coffee_files" ], files )
    @grunt.task.run "clean:project_cartero_clean_coffee_files"
    @logger.debug "created clean grunt job with options #{JSON.stringify(files, null, 2)}"
module.exports = CoffeeAssetsProcessor
