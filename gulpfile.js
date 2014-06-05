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

gulp.task('build', function() {
  gulp.src(['src/prefix.js', 'src/*/**/*.js', 'src/suffix.js']).
    pipe(concat('inbox.js')).
    pipe(gulp.dest('build/'));
});
