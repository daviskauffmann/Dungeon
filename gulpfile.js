const gulp = require('gulp');
const clean = require('gulp-clean');
const inject = require('gulp-inject');
const sass = require('gulp-sass');
const sequence = require('gulp-sequence');
const tslint = require('gulp-tslint');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');

gulp.task('watch', ['build'], () => {
    gulp.watch('./src/**/*', ['build']);
});

gulp.task('build', callback => {
    sequence('clean', 'tslint', 'webpack', 'sass', 'inject')(callback);
});

gulp.task('clean', () => {
    return gulp.src('./dist')
        .pipe(clean());
});

gulp.task('tslint', () => {
    return gulp.src('./src/ts/**/*.ts')
        //.pipe(tslint())
        //.pipe(tslint.report());
});

gulp.task('webpack', () => {
    return gulp.src(webpackConfig.entry)
        .pipe(webpack(webpackConfig, webpack))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('sass', () => {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('inject', () => {
    return gulp.src('./src/index.html')
        .pipe(inject(gulp.src([
            './dist/js/**/*.js',
            './dist/css/**/*.css'
        ]), { relative: true, ignorePath: '../dist' }))
        .pipe(gulp.dest('./dist'));
});