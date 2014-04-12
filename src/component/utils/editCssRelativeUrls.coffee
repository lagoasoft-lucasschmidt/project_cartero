fs = require 'fs'
Q = require 'q'
path = require 'path'
_s = require 'underscore.string'
logger = require('./logger').create("UTIL")

# This will be used when we move a css file to the new public dir
# The issue is that, when we minify css, the image files will have to remain in the library dirs, otherwise, things will break


regex = ///
url
\(
\s*? # any space
[\"\']? # find quotes
\s*?  # any space
(
  [
    ^ ( \" | \' | \) ) # find end of sentence
  ]+
)
///g

module.exports = (currentCssFilePath, newCssFilePath, options)->
  librariesPublicRelativePath = options.librariesPublicRelativePath
  publicFilesPath = options.publicFilesPath
  librariesDestinationPath = options.librariesDestinationPath
  contextPath = options.contextPath or ""
  replaceContents = (match, url)->
    logger.debug "Handling url=#{url}, match=#{match} in file #{currentCssFilePath}"
    cssContentUrl = url.trim()

    if cssContentUrl[0] is "/"
      logger.warn "Library cant handle absolute file paths=#{cssContentUrl}, ignoring css url"
      return match

    if _s.startsWith(cssContentUrl, "http://") or _s.startsWith(cssContentUrl, "https://") or _s.startsWith(cssContentUrl, "data:")
      return match

    # handle query params
    removedQueryParams = ""
    if _s.include cssContentUrl, "?"
      removedQueryParams = "?" + _s.strRight(cssContentUrl, "?")
      cssContentUrl = _s.strLeft(cssContentUrl, "?")

    cssContentFilePath = path.resolve(currentCssFilePath, "..", cssContentUrl)
    logger.debug "Resolved #{cssContentFilePath} for #{cssContentUrl}"
    if fs.existsSync cssContentFilePath
      newFullPath = path.resolve newCssFilePath, "..", cssContentUrl
      newPath = path.relative(publicFilesPath, newFullPath) + removedQueryParams
      if _s.startsWith(match, "url(\"") then return 'url("'+ contextPath + "/" + newPath
      else if _s.startsWith(match, "url('") then return 'url(\''+ contextPath + "/" + newPath
      else return 'url('+ contextPath + "/" + newPath

    else
      logger.warn "Couldnt find file #{cssContentFilePath} into dirs, ignoring css url=#{url.trim()}"
      return match
  Q.nfcall(fs.readFile, currentCssFilePath)
  .then (data)->
    logger.debug "Trying to handle #{currentCssFilePath}, to new path #{newCssFilePath}"
    fileContents = data.toString().replace regex, replaceContents
    Q.nfcall fs.writeFile, currentCssFilePath, fileContents
  .then ()->
    logger.debug "Successfully handled #{currentCssFilePath}, to new path #{newCssFilePath}"
