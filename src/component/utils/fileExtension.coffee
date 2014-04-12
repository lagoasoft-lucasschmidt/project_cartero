path = require 'path'

module.exports = (filename)->
  ext = path.extname(filename||'').split('.')
  return ext[ext.length - 1]
