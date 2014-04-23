module.exports = function (grunt) {
    'use strict';

    // Load Grunt plugins.
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Use 'config.rb' file to configure Compass.
        compass: {
            dev: {
                options: {
                    config: 'config.rb',
                    force: true
                }
            }
        },

        // Copy files from `src/` to `dist/classic/assets/`.
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: 'src/', src: ['*'], dest: 'dist/classic/', filter: 'isFile'},
                    {expand: true, cwd: 'src/assets/img/', src: ['**'], dest: 'dist/classic/assets/img/'}
                ]
            }
        },

        // Minified versions of CSS files within `dist/classic/assets/css/`.
        cssmin: {
            main: {
                expand: true,
                cwd: 'dist/classic/assets/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/classic/assets/css/',
                ext: '.min.css'
            }
        },

        // Check code quality of Gruntfile.js and theme-specific JavaScript using JSHint.
        jshint: {
            files: ['Gruntfile.js', 'src/assets/js/*.js'],
            options: {
                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                es3: true,
                forin: true,
                immed: true,
                indent: 4,
                latedef: true,
                noarg: true,
                noempty: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                unused: true,
                strict: true,
                trailing: true,
                browser: true,
                globals: {
                    jQuery: true,
                    module: true,
                    prettyPrint: true
                }
            }
        },

        // Uglify and copy JavaScript files from `bower-components`.
        uglify: {
            dist: {
                // Preserve all comments that start with a bang (!) or include a closure compiler style.
                options: {
                    mangle: false,
                    preserveComments: 'some'
                },

                files: [
                    {
                        'dist/classic/assets/js/main.js': ['src/assets/js/main.js'],
                        'docs/assets/js/prettify/prettify.js': ['bower_components/google-code-prettify/src/prettify.js']
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/google-code-prettify/src/',
                        src: 'lang-*.js',
                        dest: 'docs/assets/js/prettify/'
                    }
                ]
            }
        },

        // Directories watched and tasks performed by invoking `grunt watch`.
        watch: {
            sass: {
                files: 'src/assets/sass/**',
                tasks: ['sass']
            },

            js: {
                files: 'src/assets/js/*.js',
                tasks: ['jshint', 'copy', 'uglify']
            }
        }

    });

    // Register tasks.
    grunt.registerTask('build', ['jshint', 'sass', 'copy', 'uglify']);
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('sass', ['compass', 'cssmin']);
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('travis', ['jshint', 'compass']);
};
