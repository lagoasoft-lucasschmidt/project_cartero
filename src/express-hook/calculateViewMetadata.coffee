_ = require( "lodash" )
path = require( "path" )
calculateViewFiles = require('../component/calculateViewFiles/calculateAllViewFiles')(web:true)

module.exports = calculateViewMetadata = (viewJSON, carteroJSON)->
  calculatedFiles = calculateViewFiles viewJSON, carteroJSON

  metadata = {}
  metadata.css = _.map calculatedFiles.cssFiles, (fileName)-> return "<link rel='stylesheet' href='" + fileName + "'></link>"
  metadata.css = metadata.css.join("")
  metadata.js = _.map calculatedFiles.jsFiles, (fileName)-> return "<script type='text/javascript' src='" + fileName + "'></script>"
  metadata.js = metadata.js.join("")

  return metadata
