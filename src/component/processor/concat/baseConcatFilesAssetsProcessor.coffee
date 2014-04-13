_ = require 'lodash'
Q = require 'q'
fs = require 'fs'
path = require 'path'
fileExtension = require '../../utils/fileExtension'
calculateViewFilesByType = require('../../calculateViewFiles/calculateByType')

AssetsProcessor = require '../../../model/assetsProcessor'

mkdirp = require 'mkdirp'

class BaseConcatFilesAssetsProcessor extends AssetsProcessor
  constructor:(name, @extensions, @resultExtension, grunt, options)->
    super(name, grunt, options)
    throw new Error("Extensions must be informed") if ! (_.isArray(@extensions) and @extensions.length > 0)
    throw new Error("Result Extension must be informed") if ! (_.isString(@resultExtension) and @resultExtension.length > 0)
    @separator = grunt.util.linefeed

  run:(carteroJSON, callback)=>
    @concatTemplateViewFiles(carteroJSON)
    .then (filesCalculated)=>
      @debug msg: "Successfully runned #{@name}"
      callback(null, filesCalculated)
    .fail (error)=>
      @error msg:"rror while trying to run #{@name}", error: error
      callback(new Error(error))

  calculateLibraryPath:(libraryId)=> path.resolve(@options.librariesDestinationPath, "library-assets", libraryId)

  concatTemplateViewFiles:(carteroJSON)=>
    Q.fcall ()=>
      files = {}

      for templateId, template of carteroJSON.templates
        @concatFilesInTemplate(carteroJSON, template, files)

      @concatTemplatesFiles (data for file, data of files)
      return files

  concatFilesInTemplate:(carteroJSON, template, files)=>
    opts = {carteroJSON:carteroJSON, web: false, fileType: "LOCAL", fileExtension:@resultExtension}
    filesToConcat = calculateViewFilesByType(opts)(template)

    if filesToConcat.length > 0
      @logger.debug "Found the following files for template #{template.filePath} #{JSON.stringify(filesToConcat, null, 2)}"
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

module.exports = BaseConcatFilesAssetsProcessor
