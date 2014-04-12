LoggableObject = require '../component/utils/logger'

class CarteroFileDescriptorBuilder extends LoggableObject

  constructor:(name, options)->
    super(name, options)

  createFile:(templates, libraries, callback)-> callback(new Error("Not Implemented"))

module.exports = CarteroFileDescriptorBuilder
