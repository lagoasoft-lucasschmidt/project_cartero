_ = require 'lodash'
Q = require 'q'
fs = require 'fs'
path = require 'path'
fileExtension = require '../../utils/fileExtension'

AssetsProcessor = require '../../../model/assetsProcessor'

mkdirp = require 'mkdirp'

class ConcatFilesAssetsProcessor extends AssetsProcessor
  constructor:(name, @extensions, @resultExtension, grunt, options)->
    super(name, grunt, options)
    throw new Error("Extensions must be informed") if ! (_.isArray(@extensions) and @extensions.length > 0)
    throw new Error("Result Extension must be informed") if ! (_.isString(@resultExtension) and @resultExtension.length > 0)
    @separator = grunt.util.linefeed

  run:(carteroJSON, callback)=>
    filesToDelete = []
    @concatLibraries(carteroJSON)
    .then (toDelete)=>
      filesToDelete = filesToDelete.concat toDelete
      @concatTemplateViewFiles(carteroJSON)
    .then (toDelete)=>
      filesToDelete = filesToDelete.concat toDelete
      @deleteSrcFiles _.uniq(filesToDelete)
      @info msg: "Successfully runned #{@name}"
      callback(null, carteroJSON)
    .fail (error)=>
      @error msg:"rror while trying to run #{@name}", error: error
      callback(new Error(error))

  concatLibraries:(carteroJSON)=>
    Q.fcall ()=>
      files = {}
      for libraryId, library of carteroJSON.libraries
        @concatFilesInLibrary(carteroJSON, library, files)
      @concatLibrariesFiles (data for file, data of files)
      @rearrangeLibraries(carteroJSON, files)
      filesToDelete = []
      filesToDelete = filesToDelete.concat(data.src) for file, data of files
      return filesToDelete

  calculateLibraryPath:(libraryId)=> path.resolve(@options.librariesDestinationPath, "library-assets", libraryId)

  concatFilesInLibrary:(carteroJSON, library, files)=>
    if library.bundleJSON.keepSeparate then return

    @logger.debug "Trying to concat files in library id=#{library.id}"

    libraryPath = @calculateLibraryPath(library.id)
    filesToConcat = []

    for otherLibId in library.bundleJSON.dependencies
      otherLib = carteroJSON.libraries[otherLibId]
      @concatFilesInSubLibrary(carteroJSON, otherLib, filesToConcat) if otherLib?

    for file in library.files when file.type is "LOCAL"
      isDynamic = _.contains(library.bundleJSON.dynamicallyLoadedFiles, path.relative(libraryPath, file.path))
      if (fileExtension(file.path) in @extensions) and !isDynamic
        filesToConcat.push file.path

    if filesToConcat.length > 1
      concatFileName = library.id.replace(/\//g, "_") + '-' + Date.now() + "." + @resultExtension
      dest = path.resolve libraryPath, concatFileName
      files[library.id] = {src:filesToConcat, dest:dest}


  concatFilesInSubLibrary:(carteroJSON, library, filesToConcat)=>
    if library.bundleJSON.keepSeparate then return

    libraryPath = @calculateLibraryPath(library.id)

    for otherLibId in library.dependencies
      otherLib = carteroJSON.libraries[otherLibId]
      @concatFilesInSubLibrary(carteroJSON, otherLib, filesToConcat)

    for file in library.files when file.type is "LOCAL"
      isDynamic = _.contains(library.bundleJSON.dynamicallyLoadedFiles, path.relative(libraryPath, file.path))
      if (fileExtension(file.path) in @extensions) and !isDynamic
        filesToConcat.push file.path

  concatLibrariesFiles:(files)=>
    concatOptions =
      files: files
      options:
        separator: @separator
    @grunt.config( [ "concat", "project_cartero_concat_#{@resultExtension}_library_files" ], concatOptions )
    @grunt.task.run "concat:project_cartero_concat_#{@resultExtension}_library_files"
    @logger.debug "created concat grunt job with options #{JSON.stringify(concatOptions, null, 2)}"

  rearrangeLibraries:(carteroJSON, files)->
    for libraryId, data of files
      library = carteroJSON.libraries[libraryId]
      # clean dependencies that wont be used anymore, due to concat
      library.dependencies = _.filter library.dependencies, (dependency)->
        dependencyLib = carteroJSON.libraries[dependency]
        return dependencyLib.bundleJSON.dynamicallyLoadedFiles.length > 0 or dependencyLib.bundleJSON.keepSeparate
      # clean library own files not used that are local, and create the new concat one
      library.files = _.filter library.files, (file)->
        return !_.contains(data.src, file.path)
      library.files.push {type: 'LOCAL', path: data.dest}

  deleteSrcFiles:(files)=>
    @grunt.config( [ "clean", "project_cartero_clean_concat_#{@resultExtension}_files" ], files )
    @grunt.task.run "clean:project_cartero_clean_concat_#{@resultExtension}_files"
    @logger.debug "created clean grunt job with options #{JSON.stringify(files, null, 2)}"

  concatTemplateViewFiles:(carteroJSON)=>
    Q.fcall ()=>
      files = {}
      # concat normal template files
      for templateId, template of carteroJSON.templates
        @concatFilesInTemplate(carteroJSON, template, files)
      # concat extension of template, and include of template (needs the first scan, thats why it goes here)
      for templateId, template of carteroJSON.templates
        data = files[template.filePath] or {src:[], dest:@calculateTemplateViewFilesDestinationPath(template)}
        if template.extends? and files[template.extends]?
          data.src = files[template.extends].src.concat data.src
        if template.includes?
          for include in template.includes when files[include]?
            data.src = data.src.concat files[include].src
        if data.src.length > 0
          files[templateId] = data

      @concatTemplatesFiles (data for file, data of files)
      @rearrangeTemplates(carteroJSON, files)
      filesToDelete = []
      filesToDelete = filesToDelete.concat(data.src) for file, data of files
      return filesToDelete

  concatFilesInTemplate:(carteroJSON, template, files)=>
    filesToConcat = []
    for libraryId in template.libraryDependencies
      @addFilesToConcatFromLibrary(carteroJSON.libraries[libraryId], filesToConcat)
    if template.ownFiles?
      for file in template.ownFiles.files when file.type is "LOCAL" and (fileExtension(file.path) in @extensions)
        filesToConcat.push file.path

    if filesToConcat.length > 0
      files[template.filePath] = {src:filesToConcat, dest:@calculateTemplateViewFilesDestinationPath(template)}

  calculateTemplateViewFilesDestinationPath:(template)=>
    concatFileName = path.basename(template.filePath) + '-' + Date.now() + "." + @resultExtension
    newPath = path.join @options.librariesDestinationPath, "views-assets", path.relative(@options.templatesPath, template.filePath)
    return path.resolve newPath, "..", concatFileName

  addFilesToConcatFromLibrary:(library, filesToConcat)=>
    libraryPath = @calculateLibraryPath(library.id)
    for file in library.files when file.type is "LOCAL"
      isDynamic = _.contains(library.bundleJSON.dynamicallyLoadedFiles, path.relative(libraryPath, file.path))
      if (fileExtension(file.path) in @extensions) and !isDynamic
        filesToConcat.push file.path

  concatTemplatesFiles:(files)=>
    concatOptions =
      files: files
      options:
        separator: @separator
    @grunt.config( [ "concat", "project_cartero_concat_#{@resultExtension}_views_files" ], concatOptions )
    @grunt.task.run "concat:project_cartero_concat_#{@resultExtension}_views_files"
    @logger.debug "created concat grunt job with options #{JSON.stringify(concatOptions, null, 2)}"

  rearrangeTemplates:(carteroJSON, files)->
    for templateId, data of files
      template = carteroJSON.templates[templateId]
      template.joinedFiles = template.joinedFiles or []
      template.joinedFiles.push {type: 'LOCAL', path: data.dest}

module.exports = ConcatFilesAssetsProcessor
