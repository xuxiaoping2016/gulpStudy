var gulp = require('gulp');
const config = require('../config').default;
const browserSync = require('browser-sync').create();
/**
 * 监听JS文件变改，即时调用任务执行JS增量打包
 */
gulp.task('default', [], function(cb) {

    gulp.watch(config.src + "/**/*.js", ['minify:js']);

});