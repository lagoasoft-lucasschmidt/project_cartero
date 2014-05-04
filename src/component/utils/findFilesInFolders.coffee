Promise = require 'bluebird'
fs = require 'fs'
_ = require 'lodash'
findFilesInFolder = require './findFilesInFolder'
logger = require('./logger').create("UTIL")

module.exports = (folders, matches)->
  logger.trace "Trying to find files in folders=#{folders}"
  if !(_.isArray(folders) and folders.length > 0) then return Promise.resolve []
  promises = (findFilesInFolder(folder, matches) for folder in folders)
  Promise.all(promises)
  .then (arrays)->
    files = []
    for array in arrays
      files.push file for file in array
    return files
