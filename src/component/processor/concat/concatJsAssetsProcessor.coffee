BaseConcatFilesAssetsProcessor = require "./baseConcatFilesAssetsProcessor"

class ConcatJsAssetsProcessor extends BaseConcatFilesAssetsProcessor
  constructor:(grunt, options)->
    super("CONCAT_JS_ASSETS_PROCESSOR", ["js"], "js", grunt, options)
    @separator = ";"


module.exports = ConcatJsAssetsProcessor
