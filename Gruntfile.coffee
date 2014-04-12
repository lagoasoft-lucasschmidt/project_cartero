#
# * grunt-i18n-finder
# * https://github.com/lucasschmidt/grunt-i18n-finder
# *
# * Copyright (c) 2013 Lucas Schmidt
# * Licensed under the MIT license.
#
path = require 'path'

module.exports = (grunt) ->

  grunt.initConfig

    clean:
      lib: ["lib"]
      tests: ["tmp"]

    coffee:
      lib:
        expand: true
        cwd:'src'
        src: ['**/*.coffee']
        dest: 'lib'
        ext: '.js'

    project_cartero:
      test_project_cartero:
        options:
          templatesPath: "/Users/lucasschmidt/Documents/dev/home/node/project-monk/src/server/views"
          librariesPath: "/Users/lucasschmidt/Documents/dev/home/node/project-monk/src/client/library"
          publicFilesPath: path.join __dirname, "tmp"
          assetsProcessors: [
            path.join(__dirname, './lib/component/processor/moveAssetsProcessor')
            ,path.join(__dirname, './lib/component/processor/cssMinAssetsProcessor')
            ,path.join(__dirname, './lib/component/processor/coffeeAssetsProcessor')
            ,path.join(__dirname, './lib/component/processor/uglifyAssetsProcessor')
            ,path.join(__dirname, './lib/component/processor/concatJsAssetsProcessor')
            ,path.join(__dirname, './lib/component/processor/concatCssAssetsProcessor')
          ]
          carteroFileDescriptorPath: path.join __dirname, "tmp"
          logLevel: "warn"

    nodeunit:
      tests: ["test/*_test.js"]

  grunt.loadTasks "tasks"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-nodeunit"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks 'grunt-contrib-cssmin'
  grunt.loadNpmTasks 'grunt-contrib-concat'

  grunt.registerTask "test", ["clean:tests","project_cartero"]
  grunt.registerTask "default", ["clean","coffee"]

