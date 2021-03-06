var gulp = require('gulp');
var exec = require('child_process').exec;
var gutil = require("gulp-util");
var browserSync = require('browser-sync').create();
var fs = require('fs');
var argv = require('yargs').argv;

var autoprefixer = require('gulp-autoprefixer');
var cssGlobbing = require('gulp-css-globbing');
var notify = require("gulp-notify");
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');

function createFile(type) {
  if (!argv.name) {
    throw new gutil.PluginError('create', {
      message: "Name is required to create a new file",
    });
  }

  var d = new Date();
  var month = d.getMonth() + 1;
  month = month.toString().length > 1 ? month : "0" + month.toString();
  var day = d.getDate();
  day = day.toString().length > 1 ? day : "0" + day.toString();
  var date = [d.getFullYear(),  month, day].join("-");
  var time = [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");

  var locations = [
    {
      path:'./' + type + '/',
      ext:'.markdown',
      text: '--- \n' +
      '   layout: post|book|link-list|video \n' +
      '   title:  ""\n' +
      '   permalink: //\n' +
      '   date: ' + date + ' ' + time  + '\n' +
      '   category: book|code|other-things \n' +
      '   subcategory: single-link \n' +
      '   my-excerpt: ""\n' +
      '   show-references: true, \n' +
      '   edited: 1 \n' +
      '   references: \n' +
      '     - title: \n' +
      '       url: \n' +
      '   book:\n' +
      '     author: \n' +
      '     url: \n' +
      '     title: \n' +
      '     cover: \n' +
      '     publisher: \n' +
      '     published: \n' +
      '--- \n \n'}];

  locations.forEach(function(loc) {
    var fileName = loc.path + date + "-" + argv.name + loc.ext;

    fs.writeFile(fileName, loc.text, function (err) {
      if (err) {
        console.log(err);
      }
      console.log('successfully created', fileName);
    });
  });
}

gulp.task('sass', function(){
  var cgConfig = {
    extensions: ['.css', '.scss'],
    ignoreFolders: ['lib', 'vendor']
  };
  var plumbConfig = {
    errorHandler: notify.onError(function(error) {
      console.log(error.messageFormatted);
      return error.message;
    })
  };
  var apConfig = {
    browsers: ['last 2 versions'],
    cascade: false
  };

  return gulp.src('./_assets/css/main.scss')
    .pipe(cssGlobbing(cgConfig))
    .pipe(plumber(plumbConfig))
    .pipe(sass())
    .pipe(autoprefixer(apConfig))
    .pipe(gulp.dest('./_site/css'));
});

gulp.task('createDraft', function() {
  createFile('_drafts');
});

gulp.task('createPost', function() {
  createFile('_posts');
});

gulp.task('reload', ['jekyll-build'], function(){
  gutil.log('Reloading browser');
  return browserSync.reload();
});

gulp.task('stream', ['sass'], function() {
  return browserSync.reload('*.css');
});

gulp.task('jekyll-build', function() {
  var cmd = 'jekyll build --config _config.yml';
  var p = new Promise(function(resolve, reject) {
    exec(cmd, function(error, stdout, stderror) {
      gutil.log(stdout);
      gutil.log(error !== null ? 'ERROR: Jekyll process exited with code: '+error.code : "Build success");
      resolve();
    });
  });

  return p;
});

var setupWatchers = function() {
  // gulp.watch(['./_assets/css/**/*.scss'], ['stream']);
  gulp.watch(['./_assets/css/**/*.scss',
              './_posts/*.markdown',
              './_drafts/*.markdown',
              './_layouts/*.html',
              './_includes/*.html',
              './books/index.html',
              './code/index.html',
              './index.html'], ['reload']);
}

gulp.task('init', function() {
  browserSync.init({
      proxy: 'localhost:4999',
      port: 5000,
      open: false,
      ui: {
        port: 5001
      }
  });

  setupWatchers();
});

gulp.task('default', ['jekyll-build','init']);
