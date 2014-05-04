_ = require 'lodash'
Promise = require 'bluebird'
fs = require 'fs'
path = require 'path'
fileExtension = require '../utils/fileExtension'

AssetsProcessor = require '../../model/assetsProcessor'

calculateViewFiles = require('../calculateViewFiles/calculateAllViewFiles')(web:true)

class CalculateAssetsProcessor extends AssetsProcessor
  constructor:(processorOptions, grunt, options)->
    super("CALCULATE_ASSETS_PROCESSOR", grunt, options)
  run:(carteroJSON, callback)=>
    Promise.resolve().then ()=>
      @calculateAssets(carteroJSON)
    .then ()=>
      @debug msg: "Successfully runned CalculateAssetsProcessor"
      callback(null, carteroJSON)
    .error (error)=>
      @error msg:"rror while trying to run CalculateAssetsProcessor", error: error
      callback(new Error(error))

  calculateAssets:(carteroJSON)=>
    Promise.resolve().then ()=>
      promises = []
      for templateId, template of carteroJSON.templates
        promises.push @calculateTemplateAssets(templateId, template, carteroJSON)
      Promise.all(promises).then ()=> return carteroJSON

  calculateTemplateAssets:(templateId, template, carteroJSON)=>
    Promise.resolve().then ()=>
     calculatedFiles = calculateViewFiles template, carteroJSON
     template["calculatedFiles"] = calculatedFiles

module.exports = CalculateAssetsProcessor
