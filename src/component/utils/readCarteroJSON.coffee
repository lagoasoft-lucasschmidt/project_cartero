Promise = require 'bluebird'
path = require 'path'
fs = require 'fs'
readFile = Promise.promisify(fs.readFile, fs)

module.exports = (options)->
  filename = "#{options?.carteroFileDescriptorName}.#{options?.carteroFileDescriptorExtension}"
  carteroJSONPath = path.join options.carteroFileDescriptorPath, filename
  readFile(carteroJSONPath, "utf-8")
  .then (fileContents)->
    json = fileContents.toString()
    return JSON.parse json
