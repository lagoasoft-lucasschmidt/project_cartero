LoggableObject = require '../component/utils/logger'

class TemplatesDescriptorBuilder extends LoggableObject

  constructor:(name, options)->
    super(name, options)

  buildTemplatesDescriptors:(callback)=> callback(new Error("Not Implemented"))

module.exports = TemplatesDescriptorBuilder
