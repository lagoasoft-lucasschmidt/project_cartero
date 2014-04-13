path = require 'path'
_ = require 'lodash'
fileExtension = require '../utils/fileExtension'


module.exports = (opts)->
  web = opts?.web
  fileType = opts?.fileType or throw new Error("File Type must be informed")
  extension = opts?.fileExtension or throw new Error("File Extension must be informed")
  carteroJSON = opts.carteroJSON or throw new Error("CarteroJSON must be informed")

  convertPath = (filePath)->
    if web and fileType is "LOCAL"
      return path.join (carteroJSON.options.contextPath or "/"), path.relative(carteroJSON.options.publicFilesPath, filePath)
    else return filePath

  return findFiles = (files, excludeFiles, libraryId)->
    excludeFiles = excludeFiles or []

    localFiles = (file.path for file in files when file.type is fileType and fileExtension(file.path) is extension)

    if excludeFiles?.length and libraryId?
      localFiles = _.filter localFiles, (localFile)->
        relativeToLibrary = path.resolve carteroJSON.options.librariesDestinationPath, "library-assets", libraryId
        relativeToLibrary = path.relative relativeToLibrary, localFile
        return !_.contains(excludeFiles, relativeToLibrary)
    localFiles = _.map localFiles, convertPath

    return _.uniq((localFiles))
