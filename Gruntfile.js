module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-aws');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');

  grunt.initConfig({
    aws: grunt.file.readJSON("grunt-aws.json"),
    builddir: 'build',
    watch: {
      files: ['index.html', 'variables.less', 'overrides.less', 'components/*.less', 'build.less'],
      tasks: ['less'],
      options: {
        livereload: true,
         nospawn: true
      }
    },
    connect: {
      server: {
        options: {
          port: 3001,
          livereload: true
        }
      }
    },
    less: {
      development: {
        files: {
          "build/theme.css": "build.less"
        }
      }
    },
    s3: {
      options: {
        accessKeyId: '<%= aws.accessKeyId %>',
        secretAccessKey: '<%= aws.secretAccessKey %>',
        bucket: '<%= aws.bucket %>',
        region: '<%= aws.region %>',
        access: 'public-read',
        headers: {
          CacheControl: "max-age=630720000, public",
        }
      },
      development: {
        cwd: 'build/',
        src: 'theme.css'
      }
    },
    invalidate_cloudfront: {
        options: {
          key: '<%= aws.accessKeyId %>',
          secret: '<%= aws.secretAccessKey %>',
          distribution: '<%= aws.distribution %>'
        },
        development: {
          files: [{
            expand: true,
            cwd: 'build/',
            src: 'theme.css'
          }]
        }
      }
  });

  grunt.registerTask('default', ['connect', 'less', 'watch']);
  grunt.registerTask('release', ['less', 's3:development', 'invalidate_cloudfront:development']);
}
