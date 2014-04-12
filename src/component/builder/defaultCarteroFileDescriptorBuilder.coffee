_ = require 'lodash'
path = require 'path'
Q = require 'q'
fs = require 'fs'
mkdirp = require('mkdirp')
saveCarteroJSON = require "../utils/saveCarteroJSON"

CarteroFileDescriptorBuilder = require '../../model/carteroFileDescriptorBuilder'
Template = require '../../model/template'

class DefaultCarteroFileDescriptorBuilder extends CarteroFileDescriptorBuilder
  constructor:(options)->
    super("DEFAULT_CARTERO_FILE_DESC_BUILDER", options)
    @options = options
    if !_.isString(@options.carteroFileDescriptorPath) or @options.carteroFileDescriptorPath.length is 0
      throw new Error("carteroFileDescriptorPath is required")

  createFile:(templates, libraries, callback)=>
    filePath = path.join @options.carteroFileDescriptorPath, "#{@options.carteroFileDescriptorName}.#{@options.carteroFileDescriptorExtension}"
    callback = callback or ->
    @validateTemplates(templates)
    .then ()=>
      @trace "Will create Cartero File Descriptor on #{filePath}"
      carteroJson =
        options: @options
        templates: {}
        libraries: libraries
      carteroJson.templates[template.filePath] = template for template in templates
      saveCarteroJSON(carteroJson, @options)
      .then ()=>
        @info "Successfully wrote Cartero File Descritor on #{filePath}"
        callback(null, filePath)
    .fail (error)=>
      @error msg: "Error while trying to create Cartero File Descritor", error:error
      callback(new Error(error))

  validateTemplates:(templates=[])=>
    Q.fcall ()=>
      for template in templates
        throw new Error("Template must be instanceof Template") if !(template instanceof Template)
module.exports = DefaultCarteroFileDescriptorBuilder
