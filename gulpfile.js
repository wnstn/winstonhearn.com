'use strict';

var gulp = require('gulp');
var gutil = require("gulp-util");
var browserSync = require('browser-sync').create();
var fs = require('fs');
var argv = require('yargs').argv;

function createFile(type) {
  if (!argv.name) {
    throw new gutil.PluginError('create', {
      message: "Name is required to create a new file",
    });
  }

  var d = new Date();
  var date = [d.getFullYear(), d.getMonth(), d.getDate()].join("-");
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
      '   category: personal|book|links|quote \n' +
      '   subcategory: single-link \n' +
      '   my-excerpt: \n' +
      '   edited: 1 \n' +
      '   references: \n' +
      '     - title: \n' +
      '       url: \n' +
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

gulp.task('createDraft', function() {
  createFile('_drafts');
});

gulp.task('createPost', function() {
  createFile('_posts');
});

gulp.task('reload', function(){
  return setTimeout(browserSync.reload, 9000);
});

gulp.task('stream', function() {
  return setTimeout(browserSync.reload, 9000, '*.css');
});

var setupWatchers = function() {
  gulp.watch('./_css/*.css', ['stream']);
  gulp.watch(['./_posts/*.markdown',
              './_drafts/*.markdown',
              './_layouts/*.html',
              './_includes/*html',
              './links/index.html',
              './video/index.html'], ['reload']);
}

gulp.task('init', function() {
  browserSync.init({
      proxy: 'localhost:3999',
      port: 4000,
      open: false,
      ui: {
        port: 4001
      }
  });

  setupWatchers();
});

gulp.task('default', ['init']);
