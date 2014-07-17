var gulp = require('gulp');
var concat = require('gulp-concat');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');
var args = require('yargs').argv;

var LINT_SRC = [
  'src/**/*.js',
  '!src/vanilla/prefix.js',
  '!src/vanilla/suffix.js',
  '!src/angular/premodule.js',
  '!src/angular/prefix.js',
  '!src/angular/suffix.js',
  'test/**/*.js',
  '!test/helpers/**/*.js'
];

var CORE_SRC = [
  'src/core/utilities/types.js',
  'src/core/**/*.js'
];
function makeSrc(build, extra) {
  var src = [
    'src/' + build + '/prefix.js'
  ].concat(CORE_SRC);
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
  gulp.src(makeSrc('angular', ['src/angular/premodule.js', 'src/angular/module.js'])).
    pipe(concat('angular-inbox.js')).
    pipe(gulp.dest('build/'));
});

gulp.task('build', ['build:vanilla', 'build:angular']);

gulp.task('serve', ['build'], function() {
  var port = process.env.PORT;
  if (port === undefined) port = args.port;
  if (port === undefined) port = 8000;
  var host = process.env.HOST;
  if (host === undefined) host = args.host;
  if (host === undefined) host = 'localhost';
  var livereload = process.env.LIVERELOAD;
  if (livereload === undefined) livereload = args.livereload;
  if (livereload === undefined) livereload = false;

  function reload(src) {
    return function() {
      gulp.src(src).pipe(connect.reload());
    };
  }
  var APP_JS = ['build/*.js', 'examples/**/*.js'];
  var APP_CSS = ['examples/**/*.css'];
  var APP_HTML = ['examples/**/*.html'];
  if (livereload) {
    gulp.watch('src/**/*.js', ['build'], reload(APP_JS));  
    gulp.watch('examples/**/*.js', reload(APP_JS));
    gulp.watch('examples/**/*.css', reload(APP_CSS));
    gulp.watch('examples/**/*.html', reload(APP_HTML));
  }
  console.log(livereload);
  connect.server({
    root: [__dirname + '/examples', __dirname + '/build'],
    port: port,
    host: host,
    livereload: livereload,
    middleware: function(connect, opt) {
      return [
        function(req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
        }
      ];
    }
  });
});

