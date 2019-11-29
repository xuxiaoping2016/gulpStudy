var gulp = require('gulp');

gulp.task('test',function(done){
  console.log('hello world!')
  done();
})
gulp.task('default',gulp.series('test'))