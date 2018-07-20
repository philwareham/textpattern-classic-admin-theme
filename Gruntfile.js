module.exports = function (grunt)
{
    'use strict';

    // Define Sass implmentation (i.e. Node or Dart).
    const sass = require('dart-sass');

    // Load all Grunt tasks.
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Set up paths.
        paths: {
            src: {
                dir: 'src/',
                sass: 'src/assets/sass/',
                img: 'src/assets/img/'
            },
            docs: {
                css: 'docs/assets/css/',
                js: 'docs/assets/js/'
            },
            dest: { // Classic Yellow theme
                dir: 'dist/classic/',
                css: 'dist/classic/assets/css/',
                img: 'dist/classic/assets/img/'
            }
        },

        // Clean distribution and temporary directories to start afresh.
        clean: [
            'dist/',
            'docs/assets/css/'
        ],

        // Run some tasks in parallel to speed up the build process.
        concurrent: {
            dist: [
                'css',
                'uglify'
            ]
        },

        // Copy files from `src/` to `dist/classic/assets/`.
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= paths.src.dir %>classic',
                        src: '**',
                        dest: '<%= paths.dest.dir %>',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.src.img %>',
                        src: '**',
                        dest: '<%= paths.dest.img %>'
                    },
                    {'<%= paths.dest.css %>custom-example.css': '<%= paths.src.sass %>custom-example.css'}
                ]
            }
        },

        // Check code quality of Gruntfile.js JavaScript using JSHint.
        jshint: {
            options: {
                bitwise: true,
                browser: true,
                curly: true,
                eqeqeq: true,
                esversion: 6,
                forin: true,
                globals: {
                    module: true,
                    require: true
                },
                latedef: true,
                noarg: true,
                nonew: true,
                strict: false,
                undef: true,
                unused: false
            },
            files: [
                'Gruntfile.js'
            ]
        },

        // Add vendor prefixed styles and other post-processing transformations.
        postcss: {
            options: {
                processors: [
                    require('autoprefixer'),
                    require('cssnano')
                ]
            },
            dist: {
                files: [
                    {'<%= paths.dest.css %>textpattern.css': '<%= paths.dest.css %>textpattern.css'},
                    {'<%= paths.docs.css %>design-patterns.css': '<%= paths.docs.css %>design-patterns.css'}
                ]
            }
        },

        // Sass configuration.
        sass: {
            options: {
                implementation: sass,
                outputStyle: 'expanded', // outputStyle = expanded, nested, compact or compressed.
                sourceMap: false
            },
            dist: {
                files: [
                    {'<%= paths.dest.css %>textpattern.css': '<%= paths.src.sass %>default.scss'},
                    {'<%= paths.docs.css %>design-patterns.css': '<%= paths.src.sass %>design-patterns.scss'}
                ]
            }
        },

        // Validate Sass files via sass-lint.
        sasslint: {
            options: {
                configFile: '.sass-lint.yml'
            },
            target: ['<%= paths.src.sass %>**/*.scss']
        },

        // Uglify and copy JavaScript files from `node_modules`.
        uglify: {
            dist: {
                // Preserve all comments that start with a bang (!) or include a closure compiler style.
                options: {
                    output: {
                        comments: require('uglify-save-license')
                    }
                },
                files: [
                    {
                        '<%= paths.docs.js %>prism.js': [
                            'node_modules/prismjs/prism.js'
                        ]
                    }
                ]
            }
        },

        // Directories watched and tasks performed by invoking `grunt watch`.
        watch: {
            sass: {
                files: '<%= paths.src.sass %>**/*.scss',
                tasks: 'css'
            }
        }

    });

    // Register tasks.
    grunt.registerTask('build', ['clean', 'concurrent', 'copy']);
    grunt.registerTask('css', ['sasslint', 'sass', 'postcss']);
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('travis', ['jshint', 'build']);
};
