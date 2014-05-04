Promise = require 'bluebird'
fs = require 'fs'

module.exports = (filePath)->
  deferred = Promise.defer()
  fs.exists filePath, (exists)->
    deferred.resolve(exists)
  return deferred.promise
