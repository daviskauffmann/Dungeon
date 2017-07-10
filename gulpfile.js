const gulp = require('gulp');
const clean = require('gulp-clean');
const inject = require('gulp-inject');
const sass = require('gulp-sass');
const sequence = require('gulp-sequence');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');

const srcDir = './src';
const outDir = './www';

gulp.task('watch', ['build'], () => {
    gulp.watch(`${srcDir}/*/**`, ['build']);
});

gulp.task('build', callback => {
    sequence('clean', 'webpack', 'sass', 'inject')(callback);
});

gulp.task('clean', () => {
    return gulp.src(outDir)
        .pipe(clean());
});

gulp.task('webpack', () => {
    return gulp.src(`${srcDir}/ts/main.ts`)
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest(`${outDir}/js`));
});

gulp.task('sass', () => {
    return gulp.src(`${srcDir}/sass/**/*.scss`)
        .pipe(sass())
        .pipe(gulp.dest(`${outDir}/css`));
});

gulp.task('inject', () => {
    return gulp.src(`${srcDir}/index.html`)
        .pipe(inject(gulp.src([
            `${outDir}/js/**/*.js`,
            `${outDir}/css/**/*.css`
        ]), { relative: true, ignorePath: `.${outDir}` }))
        .pipe(gulp.dest(outDir));
});
