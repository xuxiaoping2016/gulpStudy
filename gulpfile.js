var gulp = require('gulp');
var concat = require('gulp-concat');        // 合并文件
var uglify = require('gulp-uglify');        // js 压缩
var less = require('gulp-less');	        // less编译
var autoprefixer = require('gulp-autoprefixer');	// 自动添加CSS前缀
var csso = require('gulp-csso');            // css压缩
var imagemin = require('gulp-imagemin');    // 图片压缩
var cache = require('gulp-cache');
var clean = require('gulp-clean');          // 清空文件夹
var browserSync = require('browser-sync').create();
var watch = require('gulp-watch');
var runSequence = require('run-sequence');  // 按顺序执行task
var fs = require('fs');
var gulpif = require('gulp-if');
var htmltpl = require('gulp-html-tpl');     // 引用html模板
var artTemplate = require('art-template');  // 模板渲染
var pump = require('pump');
var rev = require('gulp-rev-dxb');	// 生成版本号清单 
var revCollector = require('gulp-rev-collector-dxb');   // 替换成版本号文件
var htmlmin = require('gulp-htmlmin');      // html压缩
var babel = require('gulp-babel');

var env = 'dev'; // 用于执行gulp任务时的判断

// 打包html
// gulp.task('html', function(){
//   return gulp.src('./src/*.html')
//       .pipe(gulp.dest('./dist'));
// });
gulp.task('html', function() {
  return gulp.src('./src/*.html')
      .pipe(htmltpl({
          tag: 'template',
          paths: ['./src/common'],
          engine: function(template, data) {
              return template && artTemplate.compile(template)(data);
          },
          data: {      //初始化数据
              header: false,
              g2: false
          }
      }))
      .pipe(gulp.dest('./dist'));
});

// 打包js
gulp.task('js_libs', function(){
  return gulp.src(['./src/libs/js/*.js','./src/libs/es6/*.js'])
      .pipe(gulp.dest('./dist/js'));
});

gulp.task('uglify_check', function (cb) {
  pump([
      gulp.src('./src/js/*.js'),
      babel(),
      uglify(),
  ], cb);
});

gulp.task('js_main', ['uglify_check'], function(cb){
  // return gulp.src('./src/js/*.js')
  //     .pipe(concat('main.min.js'))    // 合并文件并命名
  //     .pipe(gulpif(env==='build', uglify()))  // 判断是否压缩压缩js
  //     .pipe(gulp.dest('./dist/js'));

      pump([
        gulp.src('./src/js/*.js'),
        concat('main.min.js'),
        babel(),
        gulpif(env==='build', uglify()),
        gulp.dest('./dist/js')
    ], cb);
});

// 打包css
gulp.task('css_main', function(){
  return gulp.src('./src/css/**/*.less')
      .pipe(less())
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false	// 是否美化
      }))
      .pipe(concat('main.min.css'))
      .pipe(gulpif(env==='build', csso()))    // 判断是否压缩压缩css
      .pipe(gulp.dest('./dist/css'));
});

// 打包其他资源
gulp.task('images', function () {
  return gulp.src('./src/images/*.*')
      .pipe(gulpif(env==='build', cache(
        imagemin({  // 判断是否压缩压缩images
          optimizationLevel: 5, // 取值范围：0-7（优化等级），默认：3  
          progressive: true, 	// 无损压缩jpg图片，默认：false 
          interlaced: true, 	// 隔行扫描gif进行渲染，默认：false 
          multipass: true 		// 多次优化svg直到完全优化，默认：false
        })
      )))
      .pipe(gulp.dest('./dist/images'));
});

// 清空dist文件夹
gulp.task('clean', function(){
  return gulp.src(['./dist/*'])
      .pipe(clean());
});

gulp.task('browser', function(){
  browserSync.init({
      server: './dist'    // 访问目录
      // proxy: "你的域名或IP"    // 设置代理
  });
});

// gulp.task('watch', function(){
//   gulp.watch('./src/*.html', ['html']).on('change', browserSync.reload);
// });
// gulp.task('watch', function () {
//   return watch('./src/**/*.html', function () {
//       gulp.start('html');	//执行html任务
//       browserSync.reload(); //刷新浏览器
//   });
// });

// 生成版本号清单
gulp.task('rev', function() {
  return gulp.src(['./dist/js/**', './dist/css/**'])
      .pipe(rev())
      .pipe(rev.manifest())
      .pipe(gulp.dest("./"));
});

// 添加版本号（路径替换）
gulp.task('add_version', function() {
  return gulp.src(['./rev-manifest.json', './dist/*.html'])
      .pipe(revCollector())   // 根据.json文件 执行文件内js/css名的替换
      .pipe(gulpif(env==='build', htmlmin({ 
        removeComments: true,       // 清除HTML注释
        collapseWhitespace: true,   // 压缩HTML
        minifyJS: true,             // 压缩页面JS
        minifyCSS: true             // 压缩页面CSS
      })))
      .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
  w('./src/**/*.html', 'html');
  w('./src/js/**', 'js_main');
  w('./src/libs/**/*.js', 'js_libs');
  w('./src/css/**', 'css_main');
  // w('./src/libs/**/*.css', 'css_libs');
  w('./src/images/**', 'images');

  function w(path, task){
      watch(path, function () {
          // gulp.start(task);
          browserSync.reload();
      });
  }
});

// 默认任务
// gulp.task('default', ['clean'], function() {
//   gulp.start(['html', 'js_libs', 'js_main','css_main','images','browser','watch'])
// });
gulp.task('default', function(cb) {
    runSequence(
        ['clean'],  // 首先清理文件，否则会把新打包的文件清掉
        ['html', 'js_libs', 'js_main', 'css_main', 'images'], // 不分先后的任务最好并行执行，提高效率
        ['browser', 'watch'], // 所有文件打包完毕之后启动服务打开浏览器
        cb);
});


function set_env(type){ 
  env = type || 'dev';
  // 生成env.js文件，用于开发页面时，判断环境
  fs.writeFile("./env.js", 'export default ' + env + ';', function(err){
      err && console.log(err);
  });
}

// 开发环境
gulp.task('dev', function(cb) {
  set_env('dev'); // 改变env的值
  runSequence(
      ['clean'],
      ['html', 'js_libs', 'js_main', 'css_main', 'images'],
      ['browser', 'watch'],
      cb);
});

// 生产环境
gulp.task('build', function(cb) {
  set_env('build'); // 改变env的值
  runSequence(
      ['clean'],
      ['html', 'js_libs', 'js_main', 'css_main', 'images'], 
      ['rev'], // 所有文件打包完毕之后开始生成版本清单文件
      ['add_version'],
      cb);
});