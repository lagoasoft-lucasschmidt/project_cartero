_ = require 'lodash'
Promise = require 'bluebird'

editCssRelativeUrls = require "../../utils/editCssRelativeUrls"
BaseConcatFilesAssetsProcessor = require "./baseConcatFilesAssetsProcessor"

class ConcatCssAssetsProcessor extends BaseConcatFilesAssetsProcessor
  constructor:(grunt, options)->
    super("CONCAT_CSS_ASSETS_PROCESSOR", ["css"], "css", grunt, options)

  run:(carteroJSON, callback)=>
    @concatTemplateViewFiles(carteroJSON)
    .then (filesCalculated)=>
      @replaceUrls(filesCalculated)
    .then (filesCalculated)=>
      @debug msg: "Successfully runned #{@name}"
      callback(null, filesCalculated)
    .error (error)=>
      @error msg:"rror while trying to run #{@name}", error: error
      callback(new Error(error))

  replaceUrls:(filesCalculated)=>
    filesToModify = []
    for file, data of filesCalculated
      filesToModify = filesToModify.concat data.src
    filesToModify = _.uniq(filesToModify)
    promises = ( editCssRelativeUrls(filepath, filepath, @options) for filepath in filesToModify)
    Promise.all(promises).then ()=> return filesCalculated

module.exports = ConcatCssAssetsProcessor
