_ = require 'lodash'
Promise = require 'bluebird'
fs = require 'fs'
path = require 'path'
fileExtension = require '../utils/fileExtension'

AssetsProcessor = require '../../model/assetsProcessor'

mkdirp = require 'mkdirp'

class GruntAssetsProcessor extends AssetsProcessor
  constructor:(processorOptions, grunt, options)->
    super("GRUNT_ASSETS_PROCESSOR", grunt, options)
    @destExt = processorOptions.destExt
    @fileExt = processorOptions.fileExt
    @task = processorOptions.task
    @clean = processorOptions.clean


  run:(carteroJSON, callback)=>
    Promise.resolve().then ()=>
      promises = []
      promises.push @gruntCompileLibraryAssets(carteroJSON)
      promises.push @gruntCompileViewsAssets(carteroJSON)
      Promise.all(promises)
    .spread (filesToDelete, otherFilesToDelete)=>
      filesToDelete = filesToDelete.concat otherFilesToDelete
      @deleteSrcFiles filesToDelete
      @debug msg: "Successfully runned GruntAssetsProcessor"
      callback(null, carteroJSON)
    .error (error)=>
      @error msg:"rror while trying to run GruntAssetsProcessor", error: error
      callback(new Error(error))


  renameDestinationFile:(filePath)->
    newPath = path.resolve(filePath, '..')
    return path.resolve newPath, path.basename(filePath, ".#{@fileExt}")+".#{@destExt}"

  gruntCompileLibraryAssets:(carteroJSON)=>
    Promise.resolve().then ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        for libraryId in template.libraryDependencies
          library = carteroJSON.libraries[libraryId]
          @gruntCompileFilesInLibrary(carteroJSON, library, processedLibraries, files)
      @gruntCompileLibraryFiles files
      return (file.src for file in files)

  gruntCompileFilesInLibrary:(carteroJSON, library, processedLibraries, files)=>
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        if fileExtension(file.path) is @fileExt
          dest = @renameDestinationFile(file.path)
          files.push src:file.path, dest:dest
          relativeLibPath = path.relative path.resolve(@options.librariesDestinationPath, "library-assets", library.id), file.path
          if _.contains(library.bundleJSON.dynamicallyLoadedFiles, relativeLibPath)
            index = library.bundleJSON.dynamicallyLoadedFiles.indexOf(relativeLibPath)
            library.bundleJSON.dynamicallyLoadedFiles[index] = path.relative path.resolve(@options.librariesDestinationPath, "library-assets", library.id), dest
          file.path = dest
      for otherLibId in library.dependencies
        otherLib = carteroJSON.libraries[otherLibId]
        @gruntCompileFilesInLibrary(carteroJSON, otherLib, processedLibraries, files)

  gruntCompileLibraryFiles:(files)=>
    @grunt.config( [ @task, "project_cartero_#{@task}_library_files" ], {files: files} )
    @grunt.task.run "#{@task}:project_cartero_#{@task}_library_files"
    @logger.debug "created #{@task} grunt job with options #{JSON.stringify({files: files}, null, 2)}"


  gruntCompileViewsAssets:(carteroJSON)=>
    Promise.resolve().then ()=>
      processedLibraries = []
      files = []
      for templateId, template of carteroJSON.templates
        if template.ownFiles?
          @gruntCompileViewFilesInLibrary(carteroJSON, template.ownFiles, processedLibraries, files)
      @gruntCompileViewsFiles files
      return (file.src for file in files)

  gruntCompileViewFilesInLibrary:(carteroJSON, library, processedLibraries, files)->
    if !_.contains(processedLibraries, library.id)
      processedLibraries.push library.id
      for file in library.files when file.type is "LOCAL"
        if fileExtension(file.path) is @fileExt
          dest = @renameDestinationFile(file.path)
          files.push src:file.path, dest:dest
          file.path = dest

  gruntCompileViewsFiles:(files)=>
    @grunt.config( [ @task, "project_cartero_#{@task}_views_files" ], {files: files} )
    @grunt.task.run "#{@task}:project_cartero_#{@task}_views_files"
    @logger.debug "created #{@task} grunt job with options #{JSON.stringify({files: files}, null, 2)}"


  deleteSrcFiles:(files)=>
    if !@clean then return
    @grunt.config( [ "clean", "project_cartero_clean_#{@task}_files" ], files )
    @grunt.task.run "clean:project_cartero_clean_#{@task}_files"
    @logger.debug "created clean grunt job with options #{JSON.stringify(files, null, 2)}"
module.exports = GruntAssetsProcessor
