Q = require 'q'
fs = require 'fs'

module.exports = (filePath)->
  deferred = Q.defer()
  fs.exists filePath, (exists)->
    deferred.resolve(exists)
  return deferred.promise
