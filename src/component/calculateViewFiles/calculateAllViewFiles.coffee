_ = require( "lodash" )
path = require( "path" )
calculateByType = require './calculateByType'

module.exports = (opts)->
  web = opts?.web
  filterFileByExtension = (extension)-> return (path, ext, fileDesc)-> return ext is extension
  filterFileByExtensionAndType = (extension, type)-> return (path, ext, fileDesc)-> return ext is extension and fileDesc.type is type

  findLocalFiles = (files, carteroJSON, extension)->
    require('./findFiles')({web:web, carteroJSON: carteroJSON, filterFile: filterFileByExtensionAndType(extension, "LOCAL")})(files)

  return calculateViewFiles = (viewJSON, carteroJSON)->
    if viewJSON.joinedFiles?
      filterRemoteAndKeepSeparatedLibraryFiles = (extension)->
        return (path, ext, fileDesc, library)->
          if ext isnt extension then return false
          if not library then return false
          if library.bundleJSON.keepSeparate then return ext is extension
          else return ext is extension and fileDesc.type is "REMOTE"
      # remote & keep separate library files
      cssFiles = calculateByType(carteroJSON: carteroJSON, filterFile: filterRemoteAndKeepSeparatedLibraryFiles('css'), web:true)(viewJSON)
      jsFiles = calculateByType(carteroJSON: carteroJSON, filterFile: filterRemoteAndKeepSeparatedLibraryFiles('js'), web:true)(viewJSON)
      # local joined files
      cssFiles = cssFiles.concat findLocalFiles(viewJSON.joinedFiles, carteroJSON, "css")
      jsFiles = jsFiles.concat findLocalFiles(viewJSON.joinedFiles, carteroJSON, "js")
    else
      cssFiles = calculateByType(carteroJSON: carteroJSON, filterFile: filterFileByExtension('css'), web:true)(viewJSON)
      jsFiles = calculateByType(carteroJSON: carteroJSON, filterFile: filterFileByExtension('js'), web:true)(viewJSON)

    return {cssFiles: _.uniq(cssFiles), jsFiles:_.uniq(jsFiles)}


