_ = require 'lodash'
path = require 'path'

defaultOptions =
  templatesPath: null
  templatesExtensions: /.*\.jade$/
  templatesOwnFilesExtensions: /.*\.(coffee|js|css|less)$/

  librariesPath: null
  publicFilesPath : null
  contextPath: null # used if your application or public dir runs in a different contextPath in your web application
  librariesPublicRelativePath: "libraries"
  libraryFilesExtensions: /.*\.(coffee|js|css|less|jpg|jpeg|tiff|gif|png|bmp|swf|eot|svg|ttf|woff)$/

  carteroFileDescriptorPath: null
  carteroFileDescriptorName: "cartero"
  carteroFileDescriptorExtension: "json"

  assetsProcessors: [require('../component/processor/moveAssetsProcessor')]
  assetsProcessorsIndex: 0

  logLevel: "warn"

  bowerComponentsPath: null

validOptions = (grunt, options)->
  if !_.isString(options.templatesPath)
    grunt.log.error('templatesPath must be specified')
    return false
  if !_.isString(options.librariesPath)
    grunt.log.error('librariesPath must be specified')
    return false
  if !_.isString(options.publicFilesPath)
    grunt.log.error('publicFilesPath must be specified')
    return false
  if !_.isString(options.carteroFileDescriptorPath)
    grunt.log.error('carteroFileDescriptorPath must be specified')
    return false
  return true

module.exports = (grunt)->
  # load other tasks
  require('./project_cartero_create_description')(grunt)
  require('./project_cartero_assets_processor')(grunt)

  grunt.registerMultiTask 'project_cartero', ()->
    options = @options(defaultOptions)
    if not validOptions(grunt, options) then return false
    options.librariesDestinationPath = path.join options.publicFilesPath, options.librariesPublicRelativePath
    # generate project description file
    grunt.config ["project_cartero_create_description", "options"], options
    grunt.task.run "project_cartero_create_description"
    # process files
    if options.assetsProcessors.length > 0
      grunt.config ["project_cartero_assets_processor", "index0", "options"], options
      grunt.task.run "project_cartero_assets_processor:index0"
