(function() {
  var defaultOptions, path, validOptions, _;

  _ = require('lodash');

  path = require('path');

  defaultOptions = {
    templatesPath: null,
    templatesExtensions: /.*\.jade$/,
    templatesOwnFilesExtensions: /.*\.(coffee|js|css|less)$/,
    librariesPath: null,
    publicFilesPath: null,
    contextPath: null,
    librariesPublicRelativePath: "libraries",
    libraryFilesExtensions: /.*\.(coffee|js|css|less|jpg|jpeg|tiff|gif|png|bmp|swf|eot|svg|ttf|woff)$/,
    carteroFileDescriptorPath: null,
    carteroFileDescriptorName: "cartero",
    carteroFileDescriptorExtension: "json",
    assetsProcessors: [require('../component/processor/moveAssetsProcessor')],
    assetsProcessorsIndex: 0,
    logLevel: "warn"
  };

  validOptions = function(grunt, options) {
    if (!_.isString(options.templatesPath)) {
      grunt.log.error('templatesPath must be specified');
      return false;
    }
    if (!_.isString(options.librariesPath)) {
      grunt.log.error('librariesPath must be specified');
      return false;
    }
    if (!_.isString(options.publicFilesPath)) {
      grunt.log.error('publicFilesPath must be specified');
      return false;
    }
    if (!_.isString(options.carteroFileDescriptorPath)) {
      grunt.log.error('carteroFileDescriptorPath must be specified');
      return false;
    }
    return true;
  };

  module.exports = function(grunt) {
    require('./project_cartero_create_description')(grunt);
    require('./project_cartero_assets_processor')(grunt);
    return grunt.registerMultiTask('project_cartero', function() {
      var options;
      options = this.options(defaultOptions);
      if (!validOptions(grunt, options)) {
        return false;
      }
      options.librariesDestinationPath = path.join(options.publicFilesPath, options.librariesPublicRelativePath);
      grunt.config(["project_cartero_create_description", "options"], options);
      grunt.task.run("project_cartero_create_description");
      if (options.assetsProcessors.length > 0) {
        grunt.config(["project_cartero_assets_processor", "index0", "options"], options);
        return grunt.task.run("project_cartero_assets_processor:index0");
      }
    });
  };

}).call(this);
