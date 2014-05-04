(function() {
  var Promise, fs, logger, path, readFile, regex, writeFile, _s;

  fs = require('fs');

  Promise = require('bluebird');

  path = require('path');

  _s = require('underscore.string');

  logger = require('./logger').create("UTIL");

  readFile = Promise.promisify(fs.readFile, fs);

  writeFile = Promise.promisify(fs.writeFile, fs);

  regex = /url\(\s*?[\"\']?\s*?([^(\"|\'|\))]+)/g;

  module.exports = function(currentCssFilePath, newCssFilePath, options) {
    var contextPath, librariesDestinationPath, librariesPublicRelativePath, publicFilesPath, replaceContents;
    librariesPublicRelativePath = options.librariesPublicRelativePath;
    publicFilesPath = options.publicFilesPath;
    librariesDestinationPath = options.librariesDestinationPath;
    contextPath = options.contextPath || "";
    replaceContents = function(match, url) {
      var cssContentFilePath, cssContentUrl, newFullPath, newPath, removedHashParams, removedQueryParams;
      logger.debug("Handling url=" + url + ", match=" + match + " in file " + currentCssFilePath);
      cssContentUrl = url.trim();
      if (cssContentUrl[0] === "/") {
        logger.warn("Library cant handle absolute file paths=" + cssContentUrl + ", ignoring css url");
        return match;
      }
      if (_s.startsWith(cssContentUrl, "http://") || _s.startsWith(cssContentUrl, "https://") || _s.startsWith(cssContentUrl, "data:")) {
        return match;
      }
      removedHashParams = "";
      if (_s.include(cssContentUrl, "#")) {
        removedHashParams = "#" + _s.strRight(cssContentUrl, "#");
        cssContentUrl = _s.strLeft(cssContentUrl, "#");
      }
      removedQueryParams = "";
      if (_s.include(cssContentUrl, "?")) {
        removedQueryParams = "?" + _s.strRight(cssContentUrl, "?");
        cssContentUrl = _s.strLeft(cssContentUrl, "?");
      }
      cssContentFilePath = path.resolve(currentCssFilePath, "..", cssContentUrl);
      logger.debug("Resolved " + cssContentFilePath + " for " + cssContentUrl);
      if (fs.existsSync(cssContentFilePath)) {
        newFullPath = path.resolve(newCssFilePath, "..", cssContentUrl);
        newPath = path.relative(publicFilesPath, newFullPath) + removedHashParams + removedQueryParams;
        if (_s.startsWith(match, "url(\"")) {
          return 'url("' + contextPath + "/" + newPath;
        } else if (_s.startsWith(match, "url('")) {
          return 'url(\'' + contextPath + "/" + newPath;
        } else {
          return 'url(' + contextPath + "/" + newPath;
        }
      } else {
        logger.warn("Couldnt find file " + cssContentFilePath + " into dirs, ignoring css url=" + (url.trim()));
        return match;
      }
    };
    return readFile(currentCssFilePath).then(function(data) {
      var fileContents;
      logger.debug("Trying to handle " + currentCssFilePath + ", to new path " + newCssFilePath);
      fileContents = data.toString().replace(regex, replaceContents);
      return writeFile(currentCssFilePath, fileContents);
    }).then(function() {
      return logger.debug("Successfully handled " + currentCssFilePath + ", to new path " + newCssFilePath);
    });
  };

}).call(this);
