_ = require 'lodash'
ConcatJsAssetsProcessor = require './concat/concatJsAssetsProcessor'
ConcatCssAssetsProcessor = require './concat/concatCssAssetsProcessor'
AssetsProcessor = require '../../model/assetsProcessor'
Q = require 'q'


class ConcatAssetsProcessor extends AssetsProcessor
  constructor:(grunt, options)->
    super("CONCAT_ASSETS_PROCESSOR", grunt, options)
    @concatJsAssetsProcessor = new ConcatJsAssetsProcessor(grunt, options)
    @concatCssAssetsProcessor = new ConcatCssAssetsProcessor(grunt, options)

  run:(carteroJSON, callback)=>
    Q.all([ Q.nfcall(@concatJsAssetsProcessor.run, carteroJSON), Q.nfcall(@concatCssAssetsProcessor.run, carteroJSON)  ])
    .spread (jsFilesCalculated, cssFilesCalculated)=>
      @rearrangeTemplates(carteroJSON, jsFilesCalculated)
      @rearrangeTemplates(carteroJSON, cssFilesCalculated)
      @debug msg: "Successfully runned #{@name}"
      callback(null, carteroJSON)
    .fail (error)=>
      @error msg:"rror while trying to run #{@name}", error: error
      callback(new Error(error))

  rearrangeTemplates:(carteroJSON, files)->
    for templateId, data of files
      template = carteroJSON.templates[templateId]
      template.joinedFiles = template.joinedFiles or []
      template.joinedFiles.push {type: 'LOCAL', path: data.dest}

module.exports = ConcatAssetsProcessor
