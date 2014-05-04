Promise = require 'bluebird'
cordell = require 'cordell'
logger = require('./logger').create("UTIL")


module.exports = (folder, matches)->
  logger.trace "Trying to read all files recursively with path #{folder}, with match condition=#{matches}"
  deferred = Promise.defer()
  walker = cordell.walk folder, {match: matches }
  walker.on "error", (path, error)->
    logger.error msg: "Error while trying to scan all files inside path=#{folder}", error: error
    deferred.reject(new Error(error))
  walker.on "end", (files, stats)->
    logger.trace "Finished scanning files on dir #{folder}, found #{files.length} files"
    deferred.resolve (file.toString() for file in files)
  return deferred.promise
