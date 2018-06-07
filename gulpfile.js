var gulp = require("gulp");
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var shell = require('gulp-shell');

// gulp.task('sass', function() {
//   return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
//     .pipe(sass())
//     .pipe(gulp.dest('app/css'))
//     .pipe(browserSync.reload({
//       stream: true
//     }))
// })
gulp.task('watch', ['browserSync'], function (){
  // gulp.watch('app/scss/**/*.scss', ['sass']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
  })
})
// gulp.task('useref', function(){
//   return gulp.src('app/*.html')
//     // Minifies only if it's a CSS file
//     .pipe(gulpIf('*.css', minifyCSS()))
//     // Uglifies only if it's a Javascript file
//     .pipe(gulpIf('*.js', uglify()))
//     .pipe(useref())
//     .pipe(gulp.dest('dist'))
// });
gulp.task('js', function(){
  return gulp.src('app/js/*.js')
    .pipe(rev())
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('css', function(){
  return gulp.src('app/css/**/*.css')
    .pipe(rev())
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/css'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('img', function(){
  return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('dist/img'))
});

gulp.task('version', ['css', 'js'], function  () {
    gulp.src(['dist/**/*.json', 'app/*.html'])
        .pipe(revCollector({
        }))
        .pipe(gulp.dest('dist'))
})
gulp.task('revToJs',function(){
    return gulp.src(['dist/js/*.json', 'dist/js/*.js'])
        .pipe(revCollector())
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('copyJs',function(){
    return gulp.src('app/js/lib/**/*')
        .pipe(gulp.dest('./dist/js/lib'));
});

//删除之前生成public文件
gulp.task('clean', function () {
    return del(['./dist/**/*']);//task异步,只有return之后，其他依赖了clean的任务，才能保证执行顺序
});

gulp.task('test',['testConfig','clean'], function (done) {
  runSequence(
    ['version','revToJs','copyJs', 'img'],
    done
  )
})
gulp.task('build',['product','clean'], function (done) {
  runSequence(
    ['version','revToJs','copyJs', 'img'],
    done
  )
})

gulp.task('default', function (callback) {
  runSequence(['browserSync', 'watch'],
    callback
  )
})



//测试环境执行任务
gulp.task('testConfig',shell.task(['node node-main.js test']));

//测试环境执行任务
gulp.task('product',shell.task(['node node-main.js product']));