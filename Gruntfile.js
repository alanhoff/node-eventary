module.exports = function(grunt) {
  grunt.initConfig({
    run: {

      // Run all the tests inside the test folder
      mocha: {
        args: [
          './node_modules/.bin/mocha',
          './test/**/test-*.js',
          '--reporter',
          'spec',
          '--bail'
        ],
      },

      // Look for JavaScript errors
      hint: {
        args: [
          './node_modules/.bin/jshint',
          './lib',
          './test',
          './examples',
          './Gruntfile.js'
        ],
      },

      // Generate the documentation
      doc: {
        args: ['./node_modules/.bin/yuidoc', './lib', '--outdir', './doc'],
      },

      // Runs test coverages
      istanbul: {
        args: [
          './node_modules/.bin/istanbul',
          'cover',
          './node_modules/.bin/mocha',
          '--report',
          'lcovonly',
          '--',
          '--reporter',
          'spec',
          '--bail',
          './test/**/test-*.js'
        ]
      },

      // Send coverage results to Coveralls
      coveralls: {
        exec: 'cat ./coverage/lcov.info | ' +
          './node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage'
      }
    }
  });

  // Loading NPM Grunt plugins
  grunt.loadNpmTasks('grunt-run');

  // Registering custom named tasks for easy access
  grunt.registerTask('test', [
    'run:hint',
    'run:mocha'
  ]);

  grunt.registerTask('travis', [
    'test',
    'run:hint',
    'run:istanbul',
    'run:coveralls'
  ]);
};
