(function() {
  var CarteroFileDescriptorBuilder, TemplatesDescriptorBuilder, _;

  _ = require('lodash');

  TemplatesDescriptorBuilder = require('../component/builder/defaultTemplatesDescriptorBuilder');

  CarteroFileDescriptorBuilder = require('../component/builder/defaultCarteroFileDescriptorBuilder');

  module.exports = function(grunt) {
    return grunt.registerTask('project_cartero_create_description', function() {
      var carteroFileBuilder, done, e, options, templatesBuilder;
      done = this.async();
      options = this.options({});
      try {
        templatesBuilder = new TemplatesDescriptorBuilder(options);
        carteroFileBuilder = new CarteroFileDescriptorBuilder(options);
      } catch (_error) {
        e = _error;
        grunt.log.error(e.stack);
        return done(e);
      }
      return templatesBuilder.buildTemplatesDescriptors(function(error, data) {
        if (error) {
          return done(error);
        }
        return carteroFileBuilder.createFile(data.templates, data.libraries, function(error, filePath) {
          if (error != null) {
            grunt.log.error(error.stack);
          }
          return done(error);
        });
      });
    });
  };

}).call(this);
