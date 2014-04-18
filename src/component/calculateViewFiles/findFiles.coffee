path = require 'path'
_ = require 'lodash'
fileExtension = require '../utils/fileExtension'


module.exports = (opts)->
  web = opts?.web
  carteroJSON = opts.carteroJSON or throw new Error("CarteroJSON must be informed")
  filterFile = opts.filterFile or ()-> return true

  convertWebPath = (filePath)->
    return path.join (carteroJSON.options.contextPath or "/"), path.relative(carteroJSON.options.publicFilesPath, filePath)

  return findFiles = (files, library)->
    excludeFiles = library?.bundleJSON.dynamicallyLoadedFiles or []
    libraryId = library?.id

    allFiles = []
    localFiles = []
    for file in files when filterFile(file.path, fileExtension(file), file, library)
      allFiles.push file.path
      localFiles.push file.path if file.type is "LOCAL"

    if excludeFiles?.length and libraryId?
      excludedLocalFiles = _.filter localFiles, (localFile)->
        relativeToLibrary = path.resolve carteroJSON.options.librariesDestinationPath, "library-assets", libraryId
        relativeToLibrary = path.relative relativeToLibrary, localFile
        return _.contains(excludeFiles, relativeToLibrary)
      allFiles = _.filter allFiles, (filePath)-> return !_.contains(excludedLocalFiles, filePath)

    # convert only localFiles to web, if this is for web
    allFiles = _.map allFiles, (filePath)->
      if _.contains(localFiles, filePath) and web then return convertWebPath(filePath)
      return filePath

    return _.uniq((allFiles))
