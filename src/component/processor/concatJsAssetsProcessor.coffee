ConcatFilesAssetsProcessor = require "./base/concatFilesAssetsProcessor"

class ConcatJsAssetsProcessor extends ConcatFilesAssetsProcessor
  constructor:(grunt, options)->
    super("CONCAT_JS_ASSETS_PROCESSOR", ["js"], "js", grunt, options)
    @separator = ";"


module.exports = ConcatJsAssetsProcessor
