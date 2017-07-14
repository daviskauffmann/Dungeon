const gulp = require('gulp');
const clean = require('gulp-clean');
const inject = require('gulp-inject');
const sass = require('gulp-sass');
const sequence = require('gulp-sequence');
const tslint = require('gulp-tslint');
const gutil = require('gulp-util');
const webpack = require('webpack');

const srcDir = './src';
const outDir = './www';

gulp.task('watch', ['build'], () => {
    gulp.watch(`${srcDir}/*/**`, ['build']);
});

gulp.task('build', callback => {
    sequence('tslint', 'clean', 'webpack', 'sass', 'inject')(callback);
});

gulp.task('tslint', () => {
    return gulp.src("src/**/*.ts")
        .pipe(tslint({
            formatter: 'stylish'
        }))
        .pipe(tslint.report({
            emitError: false
        }));
});

gulp.task('clean', () => {
    return gulp.src(outDir)
        .pipe(clean());
});

gulp.task('webpack', callback => {
    webpack({
        entry: `${srcDir}/ts/main.ts`,
        output: {
            filename: `${outDir}/js/main.js`
        },
        resolve: {
            extensions: ['.ts']
        },
        module: {
            loaders: [
                { test: /\.ts$/, loader: 'ts-loader' }
            ]
        },
        devtool: 'source-map'
    }).run((err, stats) => {
        if (err) throw new gutil.PluginError("webpack:build", err);
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
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
