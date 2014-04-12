Q = require 'q'
path = require 'path'
fs = require 'fs'

module.exports = (options)->
  filename = "#{options?.carteroFileDescriptorName}.#{options?.carteroFileDescriptorExtension}"
  carteroJSONPath = path.join options.carteroFileDescriptorPath, filename
  Q.nfcall(fs.readFile, carteroJSONPath, "utf-8")
  .then (fileContents)->
    json = fileContents.toString()
    return JSON.parse json
