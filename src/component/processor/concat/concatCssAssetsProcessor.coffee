BaseConcatFilesAssetsProcessor = require "./baseConcatFilesAssetsProcessor"

class ConcatCssAssetsProcessor extends BaseConcatFilesAssetsProcessor
  constructor:(grunt, options)->
    super("CONCAT_CSS_ASSETS_PROCESSOR", ["css"], "css", grunt, options)


module.exports = ConcatCssAssetsProcessor
