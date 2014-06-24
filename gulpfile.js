var gulp = require('gulp');
var concat = require('gulp-concat');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');

var LINT_SRC = [
  'src/**/*.js',
  '!src/prefix.js',
  '!src/suffix.js',
  'test/**/*.js',
  '!test/helpers/**/*.js'
];

var CORE_SRC = 'src/core/**/*.js';
function makeSrc(build, extra) {
  var src = [
    'src/' + build + '/prefix.js',
    CORE_SRC
  ];
  if (Array.isArray(extra)) src = Array.prototype.concat.apply(src, extra);
  else if (typeof extra === 'string') src = src.concat(extra);
  src = src.concat('src/' + build + '/suffix.js');
  return src;
}

gulp.task('default', ['style', 'lint', 'build']);
gulp.task('style', ['jscs']);
gulp.task('lint', ['jshint']);

gulp.task('jscs', function() {
  return gulp.src(LINT_SRC).
    pipe(jscs());
});

gulp.task('jshint', function() {
  return gulp.src(LINT_SRC).
    pipe(jshint()).
    pipe(jshint.reporter('jshint-stylish')).
    pipe(jshint.reporter('fail'));
});

gulp.task('build:vanilla', function() {
  gulp.src(makeSrc('vanilla')).
    pipe(concat('inbox.js')).
    pipe(gulp.dest('build/'));
});

gulp.task('build:angular', function() {
  gulp.src(makeSrc('angular', 'src/angular/module.js')).
    pipe(concat('angular-inbox.js')).
    pipe(gulp.dest('build/'));
});

gulp.task('build', ['build:vanilla', 'build:angular']);
