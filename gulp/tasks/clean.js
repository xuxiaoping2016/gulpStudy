var gulp = require('gulp'),
    clean   = require('gulp-clean'),
    pump = require('pump');
const config = require('../config').default;

gulp.task('default', function(cb) {
  pump([
      gulp.src(config.dest,{allowEmpty: true}),
      clean()
  ], cb)
})