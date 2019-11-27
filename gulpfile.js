const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const chalk = require('chalk');

exports.default = function() {
  console.log(chalk.blue('Hello world!'));
  return src('gulp/*.js')
    .pipe(babel({
      "presets": ['es2015']
    }))
    .pipe(uglify())
    .pipe(dest('dist/'));
}

// 将gulp中的js文件拷贝到output文件夹；
function copy() {
  return src('gulp/*.js',{ sourcemaps: true })
    .pipe(babel({
      "presets": ['es2015']
    }))
    .pipe(uglify())
    .pipe(dest('output/',{ sourcemaps: true }));
}
exports.copy = copy;

