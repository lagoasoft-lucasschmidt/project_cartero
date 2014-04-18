(function() {
  var AssetsProcessor, GruntAssetsProcessor, Q, fs, path, readCarteroJSON, saveCarteroJSON, _;

  _ = require('lodash');

  Q = require('q');

  path = require('path');

  fs = require('fs');

  readCarteroJSON = require("../component/utils/readCarteroJSON");

  saveCarteroJSON = require("../component/utils/saveCarteroJSON");

  AssetsProcessor = require("../model/assetsProcessor");

  GruntAssetsProcessor = require("../component/processor/gruntAssetsProcessor");

  module.exports = function(grunt) {
    return grunt.registerMultiTask('project_cartero_assets_processor', function() {
      var ProcessorClass, assetsProcessors, done, gruntProcessorOpts, options, processor;
      options = this.options({});
      assetsProcessors = options.assetsProcessors;
      ProcessorClass = assetsProcessors != null ? assetsProcessors[options.assetsProcessorsIndex] : void 0;
      if (!(_.isString(ProcessorClass) || _.isFunction(ProcessorClass) || _.isObject(ProcessorClass))) {
        grunt.log.error("AssetsProcessor must be informed as Function (AssetsProcessor class), String (to require) or Object (Grunt task description), otherwise cant process in currentIndex=" + options.assetsProcessorsIndex);
        return false;
      }
      if (_.isString(ProcessorClass)) {
        ProcessorClass = require(ProcessorClass);
      } else if (!_.isFunction(ProcessorClass)) {
        gruntProcessorOpts = ProcessorClass;
        if (!_.isString(gruntProcessorOpts.task) || !_.isString(gruntProcessorOpts.fileExt) || !_.isString(gruntProcessorOpts.destExt)) {
          grunt.log.error("Grunt Assets Processor must have defined: task, fileExt and destExt, but got " + (JSON.stringify(gruntProcessorOpts)));
          return false;
        }
        processor = new GruntAssetsProcessor(gruntProcessorOpts, grunt, options);
      } else {
        processor = new ProcessorClass(grunt, options);
      }
      if (!(processor instanceof AssetsProcessor)) {
        grunt.log.error("AssetsProcessor must be instanceof AssetsProcessor, but got function/class= " + ProcessorClass);
        return false;
      }
      done = this.async();
      return readCarteroJSON(options).then(function(carteroJSON) {
        return Q.nfcall(processor.run, carteroJSON);
      }).then(function(carteroJSON) {
        return saveCarteroJSON(carteroJSON, options);
      }).then(function() {
        options.assetsProcessorsIndex++;
        if (assetsProcessors[options.assetsProcessorsIndex] != null) {
          grunt.config(["project_cartero_assets_processor", "index" + options.assetsProcessorsIndex, "options"], options);
          grunt.task.run("project_cartero_assets_processor:index" + options.assetsProcessorsIndex);
        }
        return done();
      }).fail(function(error) {
        grunt.log.error(error.stack || error);
        grunt.log.error("Error while trying to execute project_cartero_move_process");
        return done(error);
      });
    });
  };

}).call(this);
