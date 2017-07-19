const gulp = require('gulp');
const clean = require('gulp-clean');
const inject = require('gulp-inject');
const sass = require('gulp-sass');
const sequence = require('gulp-sequence');
const tslint = require('gulp-tslint');
const gutil = require('gulp-util');
const webpack = require('webpack');

const SRC_DIR = './src';
const OUT_DIR = './docs';

gulp.task('watch', ['build'], () => {
    gulp.watch(`${SRC_DIR}/*/**`, ['build']);
});

gulp.task('build', callback => {
    sequence('tslint', 'clean', 'webpack', 'sass', 'inject')(callback);
});

gulp.task('tslint', () => {
    return gulp.src(`${SRC_DIR}/**/*.ts`)
        .pipe(tslint({
            formatter: 'stylish'
        }))
        .pipe(tslint.report({
            emitError: false
        }));
});

gulp.task('clean', () => {
    return gulp.src(OUT_DIR)
        .pipe(clean());
});

gulp.task('webpack', callback => {
    webpack({
        entry: `${SRC_DIR}/ts/main.ts`,
        output: {
            filename: `${OUT_DIR}/js/main.js`
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
    return gulp.src(`${SRC_DIR}/sass/**/*.scss`)
        .pipe(sass())
        .pipe(gulp.dest(`${OUT_DIR}/css`));
});

gulp.task('inject', () => {
    return gulp.src(`${SRC_DIR}/index.html`)
        .pipe(inject(gulp.src([
            `${OUT_DIR}/js/**/*.js`,
            `${OUT_DIR}/css/**/*.css`
        ]), {
            relative: true,
            ignorePath: `.${OUT_DIR}`
        }))
        .pipe(gulp.dest(OUT_DIR));
});
