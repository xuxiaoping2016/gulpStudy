var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    postcss      = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    minifycss = require('gulp-clean-css'),
    less   = require('gulp-less'),
    htmlmin  = require('gulp-htmlmin'),
    imgmin = require('gulp-imagemin'),
    rename      = require('gulp-rename'),
    concat = require('gulp-concat'),
    clean   = require('gulp-clean'),
    gulpif   = require('gulp-if'),
    debug       = require('gulp-debug'),
    changed     = require('gulp-changed'),
    // runSequence = require('run-sequence'), // for gulp3
    runSequence = require('gulp4-run-sequence'), // for gulp4
    gutil = require('gulp-util'),
    watchPath = require('gulp-watch-path'),
    combiner = require('stream-combiner2');
var sourceMap = require('gulp-sourcemaps');
var pump = require('pump');


gulp.task('clean', function(cb) {
  pump([
      gulp.src('./dist',{allowEmpty: true}),
      clean()
  ], cb)
})
//处理js文件
gulp.task('handleJs',function(cb){
  return pump([
    gulp.src('./src/js/*.js'),
    sourceMap.init(),
    sourceMap.identityMap(),
    // concat('all.js'),
    debug({title: '编译:'}),
    changed('./dist/js'),
    uglify(),
    sourceMap.write('../../maps/js',{addComment: false}),
    gulp.dest('./dist/js')
  ], cb)
  // return gulp.src('./src/js/*.js')  
  //   .pipe( sourceMap.init() )
  //   .pipe(sourceMap.identityMap())
  //   .pipe(concat('all.js'))  //合并后的文件名
  //   .pipe(debug({title: '编译:'}))
  //   .pipe(changed('dist/js'))
  //   .pipe( uglify() )  
  //   .pipe( sourceMap.write('../../maps/js',{addComment: false}))
  //   .pipe( gulp.dest('./dist/js') ) 
})

// 压缩css文件
// gulp.task('cssmin', function() {
//   return gulp.src('src/css/*.css')
//         .pipe(minifycss({
//             keepSpecialComments: '*'
//             //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
//         }))
//         .pipe(gulp.dest('dist/css'))
// });
gulp.task('cssmin', function(cb) {
  pump([
      gulp.src('src/css/*.css'),
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
      gulp.dest('dist/css')
  ], cb
  )
});

gulp.task('handleLess', function(cb) {
  pump([
      gulp.src('src/css/*.less'),
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
      gulp.dest('dist/css')
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
      gulp.src('src/html/*.html'),
      htmlmin(options),
      gulp.dest('dist/html')
  ], cb)
});

// 压缩图片
gulp.task('testImagemin', function (cb) {
  pump([
      gulp.src('src/images/*.{png,jpg,gif,ico}'),
      gulpif(global.production, imgmin({
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true,    //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true,     //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: true,       //类型：Boolean 默认：false 多次优化svg直到完全优化
        svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
      })),
      gulp.dest('dist/img')
  ], cb);
});

// gulp.task('default',
//   gulp.series('clean',
//     gulp.parallel('handleJs','cssmin','handleLess','handleHtmlmin','testImagemin')  
//   )
// )

gulp.task('default', function(cb) {
  runSequence(
      'clean', // 第一步：清理目标目录
      ['handleJs','cssmin','handleLess','handleHtmlmin','testImagemin'], // 第二步：打包 
      // 'watch', // 第三步：监控
      cb
  );
});