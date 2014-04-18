(function() {
  var path, url, _;

  path = require('path');

  _ = require('lodash');

  url = require('url');

  module.exports = function(fileArgument) {
    var ext, filename, parsedUrl;
    filename = null;
    if (_.isString(fileArgument)) {
      filename = fileArgument;
    } else if (_.isObject(fileArgument) && (fileArgument.path != null) && (fileArgument.type != null)) {
      if (fileArgument.type === "LOCAL") {
        filename = fileArgument.path;
      } else if (fileArgument.type === "REMOTE") {
        parsedUrl = url.parse(fileArgument.path);
        filename = parsedUrl.pathname;
      } else {
        console.log("Cant detect file extension for arguments=" + (JSON.stringify(fileArgument)));
        return "";
      }
    } else {
      console.log("Cant detect file extension for arguments=" + (JSON.stringify(fileArgument)));
      return "";
    }
    ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
  };

}).call(this);
