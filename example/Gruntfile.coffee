path = require 'path'

module.exports = (grunt) ->
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

    grunt.initConfig
        pkg: grunt.file.readJSON('package.json')

        config:
            distDir: '.app'

        clean:
            dist:['<%= config.distDir %>']

        coffee:
            server:
                expand: true
                cwd:'src/server'
                src: ['*.coffee','controller/**/*.coffee', 'lib/**/*.coffee', 'model/**/*.coffee', 'service/**/*.coffee']
                dest: '<%= config.distDir %>/server'
                ext: '.js'
                options:
                    bare: true
                    sourceMap: true
            # viewsAssets:
            #   expand: true
            #   cwd:'src/server'
            #   src: ['views/**/*.coffee']
            #   dest: '<%= config.distDir %>/server'
            #   ext: '.js'
            #   options:
            #       bare: false
            #       sourceMap: false

        copy:
            public:
                expand: true
                cwd: 'public/'
                src: ['**']
                dest: '<%= config.distDir %>/public'
            views:
                expand: true
                cwd: 'src/server/views'
                src: ['**']
                dest: '<%= config.distDir %>/server/views'
            viewsJade:
                expand: true
                cwd: 'src/server/views'

                src: ['**/*.jade']
                dest: '<%= config.distDir %>/server/views'
            library:
                expand: true
                cwd: 'src/client'
                src: ['library/**']
                dest: '<%= config.distDir %>/client'
            i18n:
                expand: true
                cwd: 'src/client'
                src: ['i18n/*.js']
                dest: '<%= config.distDir %>/public'


        project_cartero:
            dev:
                options:
                    templatesPath: path.resolve(__dirname, ".app/server/views")
                    librariesPath:  path.resolve(__dirname, ".app/client/library")
                    libraryFilesExtensions: /.*\.(coffee|js|css|less|jpg|jpeg|tiff|gif|png|bmp|swf|eot|svg|ttf|woff|jade)$/
                    publicFilesPath: path.resolve(__dirname, ".app/public")
                    librariesPublicRelativePath: ""
                    assetsProcessors: [
                        require('project-cartero/lib/component/processor/moveAssetsProcessor')
                        # ,require('project-cartero/lib/component/processor/cssMinAssetsProcessor')
                        ,{task: "coffee", fileExt:"coffee", destExt:"js", clean:true}
                        # ,require('project-cartero/lib/component/processor/uglifyAssetsProcessor')
                        # ,require('project-cartero/lib/component/processor/concatAssetsProcessor')
                    ]
                    carteroFileDescriptorPath: __dirname
                    logLevel: "info"
            prod:
                options:
                    templatesPath: path.resolve(__dirname, ".app/server/views")
                    librariesPath:  path.resolve(__dirname, ".app/client/library")
                    libraryFilesExtensions: /.*\.(coffee|js|css|less|jpg|jpeg|tiff|gif|png|bmp|swf|eot|svg|ttf|woff|jade)$/
                    publicFilesPath: path.resolve(__dirname, ".app/public")
                    librariesPublicRelativePath: ""
                    assetsProcessors: [
                        require('project-cartero/lib/component/processor/moveAssetsProcessor')
                        ,{task: "cssmin", fileExt:"css", destExt:"css"}
                        ,{task: "coffee", fileExt:"coffee", destExt:"js", clean:true}
                        ,{task: "uglify", fileExt:"js", destExt:"js"}
                        ,require('project-cartero/lib/component/processor/concatAssetsProcessor')
                    ]
                    carteroFileDescriptorPath: __dirname
                    logLevel: "info"


        watch:
            serverSrc:
                files: ['src/server/*.coffee','src/server/controller/**/*.coffee', 'src/server/lib/**/*.coffee', 'src/server/model/**/*.coffee', 'src/server/service/**/*.coffee']
                tasks: ['server-src']
            serverViewAssetsSrc:
                files: ['src/server/views/**/*.coffee']
                tasks: ['server-viewAssets-src']
            serverViews:
                files: ['src/server/**/*.jade']
                tasks: ['server-views']
            clientSrc:
                files: ['src/client/**/*']
                tasks: ['client-src']
            publicFiles:
                files: ['public/**/*']
                tasks: ['public-src']

        nodemon:
            dev:
                script: 'server/index.js'
                options:
                    ignore: ['public/i18n/*.js', 'client/**']
                    delay: 1200
                    cwd: "<%= config.distDir %>"
                    watch: ['server', 'public/library-assets', 'public/view-assets']
                    ext: 'js,coffee,jade'
                    debug: true

        parallel:
            lucas:
                options:
                    grunt: true
                    stream: true
                tasks: ['nodemon', 'watch']

        i18n_finder:
            default_options:
                options:
                    supportedLanguages: ['en', 'pt']
                    translationExtension: ['.js']
                cwd: 'src'
                src: ['**/*.coffee', '**/*.jade']
                dest: 'src/client/i18n'

    grunt.loadNpmTasks( "project-cartero" )

    grunt.registerTask 'default', ['clean', 'coffee:server', 'copy', 'project_cartero:dev', 'copy:i18n']
    grunt.registerTask 'min', ['clean', 'coffee:server', 'copy', 'project_cartero:prod', 'copy:i18n']
    grunt.registerTask 'dev', ['default','parallel']
    grunt.registerTask 'server-src', ['coffee:server']
    grunt.registerTask 'server-viewAssets-src', ['copy:views','project_cartero:dev']
    grunt.registerTask 'server-views', ['copy:viewsJade']
    grunt.registerTask 'client-src', ['copy:library', 'project_cartero:dev']
    grunt.registerTask 'public-src', ['copy:public']

    grunt.registerTask 'i18n', ['i18n_finder']


