/*!
 * Copyright 2014 Francesco Camarlinghi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function (grunt)
{
    'use strict';
    var path = require('path'),

        // Output tpaths
        debug_dir = 'build/debug',
        release_dir = 'build/release',

        // Common
        header = ['src/build/header.js'],
        footer = ['src/build/footer.js'],
        core = ['src/lifter.js', 'src/core/core.js', 'src/core/polyfills.js', 'src/core/utils.js'],

        // Single builds
        builds = {
            test: [].concat('src/test/test.js'),
            documents: [].concat(header, core, 'src/modules/documents.js', footer),
            filters: [].concat(header, core, 'src/modules/filters.js', footer),
            history: [].concat(header, core, 'src/modules/history.js', footer),
            layers: [].concat(header, core, 'src/modules/layers.js', footer),
            selection: [].concat(header, core, 'src/modules/selection.js', footer),
            full: [].concat(header, core, 'src/modules/documents.js', 'src/modules/filters.js', 'src/modules/history.js', 'src/modules/layers.js', 'src/modules/selection.js', footer),

            // Custom build support
            // Just uncomment the following line and add the modules to the array
            custom: [].concat(header, core, 'src/modules/documents.js', 'src/modules/layers.js', footer),
        },

        // Grunt config
        config = {
            clean: {
                debug: ['build/debug'],
                release: ['build/release'],
            },
            concat: {
                debug: {
                    files: {},
                },
            },
            esmin: {
                release: {
                    files: {},
                },
            },
        };

    // Setup tasks
    for (var build in builds)
    {
        if (builds.hasOwnProperty(build))
        {
            // Debug
            config.concat.debug.files[path.join(debug_dir, 'lifter.' + build + '.js')] = builds[build];

            // Release
            config.esmin.release.files[path.join(release_dir, 'lifter.' + build + '.min.js')] = builds[build];
        }
    }

    // Init configuration
    grunt.initConfig(config);

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-esmin');

    // Register tasks
    grunt.registerTask('debug', ['clean:debug', 'concat:debug']);
    grunt.registerTask('release', ['clean:release', 'esmin:release']);
};