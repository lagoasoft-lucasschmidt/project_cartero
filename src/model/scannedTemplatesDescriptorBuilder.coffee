LoggableObject = require '../component/utils/logger'

class ScannedTemplatesDescriptorBuilder extends LoggableObject

  constructor:(name, options)->
    super(name, options)

  scanTemplates:(callback)-> callback(new Error("Not Implemented"))

module.exports = ScannedTemplatesDescriptorBuilder
