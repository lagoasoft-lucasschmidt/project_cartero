(function() {
  var calculateViewFiles, calculateViewMetadata, path, _;

  _ = require("lodash");

  path = require("path");

  calculateViewFiles = require('../component/calculateViewFiles/calculateAllViewFiles')({
    web: true
  });

  module.exports = calculateViewMetadata = function(viewJSON, carteroJSON) {
    var calculatedFiles, metadata;
    calculatedFiles = null;
    if (viewJSON.calculatedFiles != null) {
      calculatedFiles = viewJSON.calculatedFiles;
    } else {
      calculatedFiles = calculateViewFiles(viewJSON, carteroJSON);
    }
    metadata = {};
    metadata.css = _.map(calculatedFiles.cssFiles, function(fileName) {
      return "<link rel='stylesheet' href='" + fileName + "'></link>";
    });
    metadata.css = metadata.css.join("");
    metadata.js = _.map(calculatedFiles.jsFiles, function(fileName) {
      return "<script type='text/javascript' src='" + fileName + "'></script>";
    });
    metadata.js = metadata.js.join("");
    return metadata;
  };

}).call(this);
