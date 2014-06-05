var gulp = require('gulp');
var concat = require('gulp-concat');
var jscs = require('gulp-jscs');

gulp.task('default', ['style', 'build']);
gulp.task('style', ['jscs']);

gulp.task('jscs', function() {
  return gulp.src([
    'src/**/*.js',
    '!src/prefix.js',
    '!src/suffix.js',
    'test/**/*.js',
    '!test/helpers/**/*.js']).
    pipe(jscs());
});

gulp.task('build', function() {
  gulp.src(['src/prefix.js', 'src/*/**/*.js', 'src/suffix.js']).
    pipe(concat('inbox.js')).
    pipe(gulp.dest('build/'));
});
