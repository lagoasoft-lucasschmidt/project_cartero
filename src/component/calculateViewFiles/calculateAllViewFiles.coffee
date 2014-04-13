_ = require( "lodash" )
path = require( "path" )
calculateByType = require './calculateByType'

module.exports = (opts)->
  web = opts?.web

  findLocalFiles = (files, carteroJSON, extension)->
    require('./findFiles')({web:web, carteroJSON: carteroJSON, fileExtension: extension, fileType:"LOCAL"})(files)

  return calculateViewFiles = (viewJSON, carteroJSON)->
    cssFiles = calculateByType(carteroJSON: carteroJSON, fileType: "REMOTE", fileExtension: "css", web:true)(viewJSON)
    jsFiles = calculateByType(carteroJSON: carteroJSON, fileType: "REMOTE", fileExtension: "js", web:true)(viewJSON)

    if viewJSON.joinedFiles?
      cssFiles = cssFiles.concat findLocalFiles(viewJSON.joinedFiles, carteroJSON, "css")
      jsFiles = jsFiles.concat findLocalFiles(viewJSON.joinedFiles, carteroJSON, "js")
    else
      cssFiles = cssFiles.concat calculateByType(carteroJSON: carteroJSON, fileType: "LOCAL", fileExtension: "css", web:true)(viewJSON)
      jsFiles = jsFiles.concat calculateByType(carteroJSON: carteroJSON, fileType: "LOCAL", fileExtension: "js", web:true)(viewJSON)

    return {cssFiles: _.uniq(cssFiles), jsFiles:_.uniq(jsFiles)}


