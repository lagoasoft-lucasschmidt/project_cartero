(function() {
  var AssetsProcessor, Q, fs, path, readCarteroJSON, saveCarteroJSON, _;

  _ = require('lodash');

  Q = require('q');

  path = require('path');

  fs = require('fs');

  readCarteroJSON = require("../component/utils/readCarteroJSON");

  saveCarteroJSON = require("../component/utils/saveCarteroJSON");

  AssetsProcessor = require("../model/assetsProcessor");

  module.exports = function(grunt) {
    return grunt.registerMultiTask('project_cartero_assets_processor', function() {
      var ProcessorClass, assetsProcessors, done, options, processor;
      options = this.options({});
      assetsProcessors = options.assetsProcessors;
      ProcessorClass = assetsProcessors != null ? assetsProcessors[options.assetsProcessorsIndex] : void 0;
      if (!(_.isString(ProcessorClass) || _.isFunction(ProcessorClass))) {
        grunt.log.error("AssetsProcessor must be informed, otherwise cant process in currentIndex=" + options.assetsProcessorsIndex);
        return false;
      }
      ProcessorClass = assetsProcessors[options.assetsProcessorsIndex];
      if (_.isString(ProcessorClass)) {
        ProcessorClass = require(ProcessorClass);
      }
      processor = new ProcessorClass(grunt, options);
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
