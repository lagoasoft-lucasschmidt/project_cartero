_ = require( "lodash" )
path = require( "path" )
fs = require 'fs'

calculateViewMetadata = require './calculateViewMetadata'

module.exports = (carteroFilePath)->
  try
    carteroJSON = JSON.parse fs.readFileSync(carteroFilePath).toString()
  catch error
    throw new Error("Couldnt read carteroJSON file on path=#{carteroFilePath}")

  viewsCache = {}

  return (req, res, next)->
    oldRender = res.render
    res.render = (name, options)->
      _arguments = arguments

      absolutePath = path.resolve req.app.get( "views" ), name

      viewMetadata = null
      if viewsCache[absolutePath]? then viewMetadata = viewsCache[absolutePath]
      else
        viewJSON = carteroJSON.templates[absolutePath]
        if not viewJSON then return next(new Error("Couldnt find template json in #{carteroFilePath} with path=#{absolutePath}"))
        viewMetadata = calculateViewMetadata(viewJSON, carteroJSON)
        viewsCache[absolutePath] = viewMetadata

      res.locals.cartero_css = viewMetadata.css
      res.locals.cartero_js = viewMetadata.js

      oldRender.apply( res, _arguments )

    next()


