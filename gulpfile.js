/**
 * Created by Jeremie on 2017/3/10.
 */

var gulp = require('gulp');
var gzip = require('gulp-gzip');
var zip = require('gulp-zip');

gulp.task('compress', function () {
    gulp.src(['./dist/*.js', './dist/*.css'])
        .pipe(gzip())
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-nw-package', function () {
    return gulp.src('./nw/package.json')
        .pipe(gulp.dest('./dist'));
});

gulp.task('zip-nw-package', ['copy-nw-package'], function () {
    return gulp.src('./dist/**')
        .pipe(zip('package.nw'))
        .pipe(gulp.dest('./nw/dist'));
});

gulp.task('nw', ['zip-nw-package']);
