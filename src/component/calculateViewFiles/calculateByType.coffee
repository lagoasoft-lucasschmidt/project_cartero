_ = require( "lodash" )
path = require( "path" )

module.exports = (opts)->
  web = opts?.web
  filterFile = opts?.filterFile
  filterLibrary = opts?.filterLibrary or ()-> return true
  carteroJSON = opts?.carteroJSON or throw new Error("CarteroJSON must be informed")
  runFindFiles = require('./findFiles')({web:web, carteroJSON: carteroJSON, filterFile: filterFile})

  findFiles = (files, library)-> return runFindFiles(files, library)

  findLibraryFiles = (library)-> return findFiles(library.files, library)

  calculateLibraryFiles = (library)->
    localFiles = []

    if library.dependencies?.length
      for dep in library.dependencies
        otherLib = carteroJSON.libraries[dep]
        localFiles = localFiles.concat calculateLibraryFiles(otherLib)

    if library.files? and filterLibrary(library)
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

