Q = require 'q'
fs = require 'fs'

module.exports = (filePath)->
  deferred = Q.defer()
  fs.stat filePath, (error, stat)->
    if error then return deferred.reject new Error(error)
    else deferred.resolve(stat?.isDirectory() or false)
  return deferred.promise
