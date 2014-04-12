require('coffee-script')

TemplatesDescriptorBuilder = require './src/component/builder/defaultTemplatesDescriptorBuilder'
CarteroFileDescriptorBuilder = require './src/component/builder/defaultCarteroFileDescriptorBuilder'

options =
  templatesPath: "/Users/lucasschmidt/Documents/dev/home/node/project-monk/src/server/views"
  librariesPath: "/Users/lucasschmidt/Documents/dev/home/node/project-monk/src/client/library"
  carteroFileDescriptorPath: __dirname
  logLevel:
    DEFAULT_TEMPLATES_DESC_BUILDER: "info"


templatesBuilder = new TemplatesDescriptorBuilder(options)
carteroFileBuilder = new CarteroFileDescriptorBuilder(options)


templatesBuilder.buildTemplatesDescriptors (error, templates)->
  if error then return
  carteroFileBuilder.createFile(templates)

process.on "uncaughtException", (error)-> console.log error
process.on "error", (error)-> console.log error
