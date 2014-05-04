Promise = require 'bluebird'
fs = require 'fs'
isFile = require './isFile'
path = require 'path'
logger = require('./logger').create("UTIL")
readdir = Promise.promisify(fs.readdir, fs)

module.exports = (folder, matches)->
  logger.trace "Trying to read files inside path #{folder}, with match condition=#{matches}"
  readdir(folder)
  .then (stats)->
    logger.trace "Read directory #{folder} with stats=#{stats}"
    promises = (isFile(path.join(folder, file), /\*./) for file in stats)
    Promise.all(promises)
    .then (results)->
      files = []
      for result, i in results
        if result is true and matches.test(path.join(folder, stats[i]).toString())
          files.push path.join(folder, stats[i]).toString()
      logger.trace "Found #{files.length} files inside path #{folder}, with match condition=#{matches}"
      return files

