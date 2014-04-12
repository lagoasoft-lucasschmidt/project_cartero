Q = require 'q'
fs = require 'fs'
path = require 'path'
mkdirp = require 'mkdirp'
fileExists = require './fileExists'
logger = require('./logger').create("UTIL")

module.exports = (carteroJSON, options)->
  filePath = path.join options.carteroFileDescriptorPath, "#{options.carteroFileDescriptorName}.#{options.carteroFileDescriptorExtension}"
  fileExists(options.carteroFileDescriptorPath)
  .then (exists)->
    if not exists then return Q.nfcall(mkdirp, options.carteroFileDescriptorPath)
    else return Q.fcall ()->
  .then ()->
    logger.info "will try to write #{filePath}"
    Q.nfcall(fs.writeFile, filePath, JSON.stringify(carteroJSON, null, 2))

