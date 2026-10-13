module.exports = function (grunt) {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const postcss = require('postcss');
    const autoprefixer = require('autoprefixer');
    const cssnano = require('cssnano');
    const terser = require('terser');

    // -------------------------------------------------------------------------
    // Load Grunt tasks
    // -------------------------------------------------------------------------

    [
        'grunt-contrib-copy',
        'grunt-contrib-jshint',
        'grunt-replace-regex',
        'grunt-sass',
        'grunt-stylelint'
    ].forEach(grunt.loadNpmTasks);

    // -------------------------------------------------------------------------
    // Configuration
    // -------------------------------------------------------------------------

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
        // JavaScript linting
        // ---------------------------------------------------------------------

        jshint: {
            options: {
                bitwise: true,
                browser: true,
                curly: true,
                eqeqeq: true,
                esversion: 8,
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
        // Sass compilation
        // ---------------------------------------------------------------------

        sass: {
            options: {
                implementation: require('sass'),
                outputStyle: 'expanded',
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
        }
    });

    // -------------------------------------------------------------------------
    // CSS post-processing
    // -------------------------------------------------------------------------

    grunt.registerTask('postcss', 'Autoprefix and minify CSS.', async function () {
        const done = this.async();

        try {
            const files = [
                'dist/classic/assets/css/textpattern.css',
                'dist/classic/assets/css/print.css',
                'docs/assets/css/design-patterns.css'
            ];

            for (const file of files) {
                const css = fs.readFileSync(file, 'utf8');

                const result = await postcss([
                    autoprefixer(),
                    cssnano()
                ]).process(css, {
                    from: file,
                    to: file
                });

                fs.writeFileSync(file, result.css);

                grunt.log.ok(`Processed ${file}`);
            }

            done();
        } catch (error) {
            grunt.log.error(error);
            done(false);
        }
    });

    // -------------------------------------------------------------------------
    // JavaScript bundling/minification
    // -------------------------------------------------------------------------

    const jsBundles = {
        'docs/assets/js/prism.js': [
            'node_modules/prismjs/prism.js'
        ]
    };

    grunt.registerTask('js:build', 'Minify JavaScript with Terser.', async function () {
        const done = this.async();

        try {
            for (const [output, inputs] of Object.entries(jsBundles)) {
                const source = inputs
                    .map(function (file) {
                        return fs.readFileSync(file, 'utf8');
                    })
                    .join('\n;\n');

                const result = await terser.minify(source, {
                    format: {
                        // Preserve licence comments such as /*! ... */.
                        comments: /^!/
                    }
                });

                if (result.error) {
                    throw result.error;
                }

                grunt.file.mkdir(path.dirname(output));
                fs.writeFileSync(output, result.code + '\n');

                grunt.log.ok(`Created ${output}`);
            }

            done();
        } catch (error) {
            grunt.log.error(error);
            done(false);
        }
    });

    // -------------------------------------------------------------------------
    // Clean
    // -------------------------------------------------------------------------

    grunt.registerTask('clean', 'Remove generated files.', function () {
        const paths = [
            grunt.config.get('paths.dist.dir'),
            grunt.config.get('paths.docs.css')
        ];

        paths.forEach(function (path) {
            fs.rmSync(path, {
                recursive: true,
                force: true
            });
        });
    });

    // -------------------------------------------------------------------------
    // Composite tasks
    // -------------------------------------------------------------------------

    grunt.registerTask('css', [
        'stylelint',
        'sass',
        'postcss'
    ]);

    grunt.registerTask('js', [
        'jshint',
        'js:build'
    ]);

    grunt.registerTask('build', [
        'clean',
        'css',
        'js',
        'replace',
        'copy'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
