var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    postcss      = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    minifycss = require('gulp-clean-css'),
    less   = require('gulp-less'),
    htmlmin  = require('gulp-htmlmin'),
    imgmin = require('gulp-imagemin'),
    rename      = require('gulp-rename'),
    clean   = require('gulp-clean'),
    gulpif   = require('gulp-if'),
    debug       = require('gulp-debug'),
    changed     = require('gulp-changed'),
    minimist = require("minimist"),
    rev    = require('gulp-rev-append');
var sourceMap = require('gulp-sourcemaps');
var pump = require('pump');
const config = require('../config').default;

//处理js文件
gulp.task('handleJs',function(cb){
  return pump([
    gulp.src(config.src+'/js/*.js'),
    sourceMap.init(),
    sourceMap.identityMap(),
    // concat('all.js'),
    debug({title: '编译:'}),
    changed(config.dest+'/js'),
    uglify(),
    sourceMap.write('../../maps/js',{addComment: false}),
    gulp.dest(config.dest+'/js')
  ], cb)
})

gulp.task('cssmin', function(cb) {
  pump([
      gulp.src(config.src+'/css/*.css'),
      rename({suffix: '.min'}),
      postcss([ autoprefixer({
        // 兼容主流浏览器的最新两个版本
        overrideBrowserslist: ['last 2 versions'],
        // 是否美化属性值
        cascade: true
      })]),
      minifycss({
          keepSpecialComments: '*'
          //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
      }),
      gulp.dest(config.dest+'/css')
  ], cb
  )
});

gulp.task('handleLess', function(cb) {
  pump([
      gulp.src(config.src+'/css/*.less'),
      less(),
      postcss([ autoprefixer({
        // 兼容主流浏览器的最新两个版本
        overrideBrowserslist: ['last 2 versions'],
        // 是否美化属性值
        cascade: true
      })]),
      minifycss({
          keepSpecialComments: '*'
          //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
      }),
      gulp.dest(config.dest+'/css')
  ], cb
  )
});

gulp.task('handleHtmlmin', function (cb) {
  var options = {
    removeComments: true,//清除HTML注释
    collapseWhitespace: true,//压缩HTML
    collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
    minifyJS: true,//压缩页面JS
    minifyCSS: true//压缩页面CSS
  };
  pump([
      gulp.src(config.src+'/html/*.html'),
      rev(),
      htmlmin(options),
      gulp.dest(config.dest+'/html')
  ], cb)
});

// 压缩图片
gulp.task('testImagemin', function (cb) {
  var knownOptions = {
    string: 'env',
    default: { env: process.env.NODE_ENV || 'production' }
  };
  
  var options = minimist(process.argv.slice(2), knownOptions);
  console.log('op..',options)
  pump([
      gulp.src(config.src+'/images/*.{png,jpg,gif,ico}'),
      gulpif(options.env === 'production', imgmin({
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true,    //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true,     //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: true,       //类型：Boolean 默认：false 多次优化svg直到完全优化
        svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
      })),
      gulp.dest(config.dest+'/img')
  ], cb);
});

gulp.task('default', gulp.parallel('handleJs','cssmin','handleLess','handleHtmlmin','testImagemin'));