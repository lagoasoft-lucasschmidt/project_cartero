ConcatFilesAssetsProcessor = require "./base/concatFilesAssetsProcessor"

class ConcatCssAssetsProcessor extends ConcatFilesAssetsProcessor
  constructor:(grunt, options)->
    super("CONCAT_CSS_ASSETS_PROCESSOR", ["css"], "css", grunt, options)


module.exports = ConcatCssAssetsProcessor
