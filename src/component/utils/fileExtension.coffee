path = require 'path'
_ = require 'lodash'
url = require 'url'

module.exports = (fileArgument)->
  filename = null
  if _.isString(fileArgument) then filename = fileArgument
  else if _.isObject(fileArgument) and fileArgument.path? and fileArgument.type?
    if fileArgument.type in ["LOCAL", "BOWER"] then filename = fileArgument.path
    else if fileArgument.type is "REMOTE"
      parsedUrl = url.parse fileArgument.path
      filename = parsedUrl.pathname
    else
      console.log("Cant detect file extension for arguments=#{JSON.stringify(fileArgument)}")
      return ""
  else
    console.log("Cant detect file extension for arguments=#{JSON.stringify(fileArgument)}")
    return ""

  ext = path.extname(filename||'').split('.')
  return ext[ext.length - 1]
