_ = require 'lodash'

TemplatesDescriptorBuilder = require '../component/builder/defaultTemplatesDescriptorBuilder'
CarteroFileDescriptorBuilder = require '../component/builder/defaultCarteroFileDescriptorBuilder'

module.exports = (grunt)->

  grunt.registerTask 'project_cartero_create_description', ()->

    done = @async()
    options = @options({})
    templatesBuilder = new TemplatesDescriptorBuilder(options)
    carteroFileBuilder = new CarteroFileDescriptorBuilder(options)

    templatesBuilder.buildTemplatesDescriptors (error, data)->
      if error then return done(error)
      carteroFileBuilder.createFile data.templates, data.libraries, (error, filePath)->
        done(error)
