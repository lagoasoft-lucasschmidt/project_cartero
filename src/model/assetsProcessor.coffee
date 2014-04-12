LoggableObject = require '../component/utils/logger'

class AssetsProcessor extends LoggableObject

  constructor:(name, grunt, options)->
    super(name, options)
    @name = name
    @grunt = grunt
    @options = options

  run:(carteroJSON, callback)-> callback(new Error("Not Implemented"))

module.exports = AssetsProcessor
