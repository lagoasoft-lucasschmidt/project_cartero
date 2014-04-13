_ = require( "lodash" )
path = require( "path" )

module.exports = (opts)->
  web = opts?.web
  fileType = opts?.fileType or throw new Error("File Type must be informed")
  extension = opts?.fileExtension or throw new Error("File Extension must be informed")
  carteroJSON = opts.carteroJSON or throw new Error("CarteroJSON must be informed")

  runFindFiles = require('./findFiles')({web:web, carteroJSON: carteroJSON, fileExtension: extension, fileType:fileType})

  fileExtension = (filename)->
    calculatedExt = path.extname(filename || '').split('.')
    return calculatedExt[calculatedExt.length - 1]


  findFiles = (files, excludeFiles, libraryId)-> return runFindFiles(files, excludeFiles, libraryId)

  findLibraryFiles = (library)-> return findFiles(library.files, library.bundleJSON.dynamicallyLoadedFiles, library.id)

  calculateLibraryFiles = (library)->
    localFiles = []

    if library.dependencies?.length
      for dep in library.dependencies
        otherLib = carteroJSON.libraries[dep]
        localFiles = localFiles.concat calculateLibraryFiles(otherLib)

    if library.files?
      localFiles = localFiles.concat findLibraryFiles(library)

    return _.uniq(localFiles)


  return calculateFullViewFiles = (viewJSON)->
      localFiles = []

      if viewJSON.extend?
        extendView = carteroJSON.templates[viewJSON.extend]
        localFiles = localFiles.concat calculateFullViewFiles(extendView)

      if viewJSON.libraryDependencies?.length
        for libraryId in viewJSON.libraryDependencies
          library = carteroJSON.libraries[libraryId]
          localFiles = localFiles.concat calculateLibraryFiles(library)

      if viewJSON.ownFiles?
        localFiles = localFiles.concat findFiles(viewJSON.ownFiles.files)

      if viewJSON.includes?.length
        for include in viewJSON.includes
          includedView = carteroJSON.templates[include]
          localFiles = localFiles.concat calculateFullViewFiles(includedView)

      return _.uniq(localFiles)

