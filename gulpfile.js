var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', ['build']);

gulp.task('build', function() {
  gulp.src(['src/prefix.js', 'src/*/**/*.js', 'src/suffix.js']).
    pipe(concat('inbox.js')).
    pipe(gulp.dest('build/'));
});
