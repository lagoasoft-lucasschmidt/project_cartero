(function() {
  var path;

  path = require('path');

  module.exports = function(filename) {
    var ext;
    ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
  };

}).call(this);
