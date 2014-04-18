(function() {
  var calculateViewMetadata, fileExtension, fs, path, _;

  _ = require("lodash");

  path = require("path");

  fs = require('fs');

  calculateViewMetadata = require('./calculateViewMetadata');

  fileExtension = require('../component/utils/fileExtension');

  module.exports = function(carteroFilePath) {
    var carteroJSON, error, viewsCache;
    try {
      carteroJSON = JSON.parse(fs.readFileSync(carteroFilePath).toString());
    } catch (_error) {
      error = _error;
      throw new Error("Couldnt read carteroJSON file on path=" + carteroFilePath);
    }
    viewsCache = {};
    return function(req, res, next) {
      var oldRender;
      oldRender = res.render;
      res.render = function(name, options) {
        var absolutePath, viewJSON, viewMetadata, _arguments;
        _arguments = arguments;
        absolutePath = path.resolve(req.app.get("views"), name);
        if ((req.app.get("view engine") != null) && fileExtension(absolutePath) !== req.app.get("view engine")) {
          absolutePath = "" + absolutePath + "." + (req.app.get("view engine"));
        }
        viewMetadata = null;
        if (viewsCache[absolutePath] != null) {
          viewMetadata = viewsCache[absolutePath];
        } else {
          viewJSON = carteroJSON.templates[absolutePath];
          if (!viewJSON) {
            return next(new Error("Couldnt find template json in " + carteroFilePath + " with path=" + absolutePath));
          }
          viewMetadata = calculateViewMetadata(viewJSON, carteroJSON);
          viewsCache[absolutePath] = viewMetadata;
        }
        res.locals.cartero_css = viewMetadata.css;
        res.locals.cartero_js = viewMetadata.js;
        return oldRender.apply(res, _arguments);
      };
      return next();
    };
  };

}).call(this);
