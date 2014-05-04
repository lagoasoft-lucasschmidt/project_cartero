Promise = require 'bluebird'
fs = require 'fs'
path = require 'path'
mkdirp = require 'mkdirp'
fileExists = require './fileExists'
logger = require('./logger').create("UTIL")

runmkdirp = Promise.promisify(mkdirp)
writeFile = Promise.promisify(fs.writeFile, fs)

module.exports = (carteroJSON, options)->
  filePath = path.join options.carteroFileDescriptorPath, "#{options.carteroFileDescriptorName}.#{options.carteroFileDescriptorExtension}"
  fileExists(options.carteroFileDescriptorPath)
  .then (exists)->
    if not exists then return runmkdirp(options.carteroFileDescriptorPath)
    else return Promise.resolve()
  .then ()->
    logger.debug "will try to write #{filePath}"
    writeFile(filePath, JSON.stringify(carteroJSON, null, 2))

