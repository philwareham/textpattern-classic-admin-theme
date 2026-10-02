module.exports = function (grunt) {
    'use strict';

    // Load all Grunt tasks automatically.
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // ---------------------------------------------------------------------
        // Paths
        // ---------------------------------------------------------------------

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
            },

            dist: {
                dir: 'dist/'
            }
        },

        // ---------------------------------------------------------------------
        // Clean
        // ---------------------------------------------------------------------

        clean: [
            '<%= paths.dist.dir %>',
            '<%= paths.docs.css %>'
        ],

        // ---------------------------------------------------------------------
        // JavaScript linting
        // ---------------------------------------------------------------------

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

        // ---------------------------------------------------------------------
        // Sass
        // ---------------------------------------------------------------------

        sass: {
            options: {
                implementation: require('sass'),
                outputStyle: 'expanded', // outputStyle = expanded, nested, compact or compressed.
                sourceMap: false
            },
            dist: {
                files: {
                    '<%= paths.dest.css %>textpattern.css':
                        '<%= paths.src.sass %>default.scss',

                    '<%= paths.dest.css %>print.css':
                        '<%= paths.src.sass %>print.scss',

                    '<%= paths.docs.css %>design-patterns.css':
                        '<%= paths.src.sass %>design-patterns.scss'
                }
            }
        },

        // ---------------------------------------------------------------------
        // CSS post-processing
        // ---------------------------------------------------------------------

        postcss: {
            options: {
                processors: [
                    require('autoprefixer'),
                    require('cssnano')
                ]
            },
            dist: {
                files: {
                    '<%= paths.dest.css %>textpattern.css':
                        '<%= paths.dest.css %>textpattern.css',

                    '<%= paths.dest.css %>print.css':
                        '<%= paths.dest.css %>print.css',

                    '<%= paths.docs.css %>design-patterns.css':
                        '<%= paths.docs.css %>design-patterns.css'
                }
            }
        },

        // ---------------------------------------------------------------------
        // CSS linting
        // ---------------------------------------------------------------------

        stylelint: {
            options: {
                configFile: '.stylelintrc.yml'
            },
            src: [
                '<%= paths.src.sass %>**/*.{css,scss}'
            ]
        },

        // ---------------------------------------------------------------------
        // Copy assets
        // ---------------------------------------------------------------------

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= paths.src.dir %>classic',
                        src: ['**', '!manifest.json'],
                        dest: '<%= paths.dest.dir %>',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.src.img %>',
                        src: '**',
                        dest: '<%= paths.dest.img %>'
                    },
                    {
                        '<%= paths.dest.css %>custom-example.css':
                            '<%= paths.src.sass %>custom-example.css',

                        '<%= paths.docs.js %>jquery.js':
                            'node_modules/jquery/dist/jquery.min.js',

                        '<%= paths.docs.js %>jquery-ui.js':
                            'node_modules/jquery-ui-dist/jquery-ui.min.js'
                    }
                ]
            }
        },

        // ---------------------------------------------------------------------
        // Replace theme version numbers
        // ---------------------------------------------------------------------

        replace: {
            theme: {
                options: {
                    patterns: [
                        {
                            match: 'version',
                            replacement: '<%= pkg.version %>'
                        }
                    ]
                },
                files: {
                    '<%= paths.dest.dir %>manifest.json':
                        '<%= paths.src.dir %>classic/manifest.json'
                }
            }
        },

        // ---------------------------------------------------------------------
        // JavaScript bundling/minification
        // ---------------------------------------------------------------------

        uglify: {
            options: {
                output: {
                    comments: require('uglify-save-license')
                }
            },

            dist: {
                files: {
                    '<%= paths.docs.js %>prism.js': [
                        'node_modules/prismjs/prism.js'
                    ]
                }
            }
        },

        // ---------------------------------------------------------------------
        // Watch
        // ---------------------------------------------------------------------

        watch: {
            sass: {
                files: '<%= paths.src.sass %>**/*.scss',
                tasks: 'css'
            }
        }
    });

    // -------------------------------------------------------------------------
    // Registered tasks
    // -------------------------------------------------------------------------

    grunt.registerTask('css', [
        'stylelint',
        'sass',
        'postcss'
    ]);

    grunt.registerTask('build', [
        'clean',
        'css',
        'jshint',
        'uglify',
        'replace',
        'copy'
    ]);

    grunt.registerTask('default', [
        'watch'
    ]);
};
