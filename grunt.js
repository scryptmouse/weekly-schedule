var fs = require('fs');

var jshint_config = JSON.parse(fs.readFileSync('.jshintrc', 'utf8'));

module.exports = function(grunt) {
  grunt.initConfig({
    min: {
      dist: {
        src: ['dist/schedule.js'],
        dest: 'dist/schedule.min.js'
      }
    },

    coffee: {
      dist: {
        src: ['src/schedule.coffee'],
        dest: 'dist',
        options: {
          bare: false
        }
      }
    },

    copy: {
      docs: {
        files: {
          "docs/demo/": "demo/**",
          "docs/dist/": "dist/**"
        }
      }
    },

    lint: {
      files: ['dist/schedule.js']
    },

    jshint: {
      options: jshint_config
    },

    docco_husky: {
      project_name: 'WeeklySchedule',
      files: ['src/schedule.coffee']
    },

    vows: {
      all: {},
      dot: {},
      spec: {
        reporter: 'spec'
      },
      xunit: {
        reporter: 'xunit',
        color: false
      }
    },

    uglify: {
      mangle: {
        except: ['require', 'module', 'exports']
      }
    },

    watch: {
      tests: {
        files: ['src/schedule.coffee', 'spec/**'],
        tasks: ['test'],
        options: {
          debounceDelay: 250,
          interrupt: true
        }
      },
      coffee: {
        files: 'src/schedule.coffee',
        tasks: ['coffee', 'min'],
        options: {
          debounceDelay: 250,
          interrupt: true
        }
      },
      docs: {
        files: 'demo/**',
        tasks: ['docs'],
        options: {
          debounceDelay: 250,
          interrupt: true
        }
      }
    }
  });

  grunt.registerTask('docs', 'coffee min copy:docs docco_husky');

  grunt.registerTask('test', 'lint vows:dot');

  grunt.registerTask('default', 'test');

  grunt.registerTask('release', 'test docs');

  grunt.loadNpmTasks('grunt-docco-husky');
  grunt.loadNpmTasks('grunt-vows');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-coffee');
};
