Promise = require 'bluebird'
fs = require 'fs'

module.exports = (filePath)->
  deferred = Promise.defer()
  fs.stat filePath, (error, stat)->
    if error then return deferred.reject new Error(error)
    else deferred.resolve(stat?.isDirectory() or false)
  return deferred.promise
