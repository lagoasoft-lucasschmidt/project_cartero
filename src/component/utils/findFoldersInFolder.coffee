Q = require 'q'
fs = require 'fs'
path = require 'path'
isFolder = require './isFolder'
logger = require('./logger').create("UTIL")

module.exports = (folder, matches)->
  logger.trace "Trying to read folders inside path #{folder}, with match condition=#{matches}"
  Q.nfcall(fs.readdir, folder)
  .then (stats)->
    promises = (isFolder(path.join(folder,file), /\*./) for file in stats)
    Q.all(promises)
    .then (results)->
      folders = []
      for result, i in results
        if result is true and matches.test(path.join(folder, stats[i]).toString())
          folders.push path.join(folder, stats[i]).toString()
      logger.trace "Found #{folders.length} folders inside path #{folder}, with match condition=#{matches}"
      return folders
