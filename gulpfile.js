const gulp = require("gulp");
const clean = require('gulp-clean');
const inject = require('gulp-inject');
const sequence = require('gulp-sequence');
const ts = require("gulp-typescript");

gulp.task('default', sequence('clean' , 'ts', 'css', 'html'));

gulp.task('clean', () => {
    return gulp.src('./www')
        .pipe(clean());
});

gulp.task('ts', () => {
    return gulp.src('./src/**/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'main.js',
            target: 'es6'
        }))
        .js.pipe(gulp.dest('./www/js'));
});

gulp.task('css', () => {
    return gulp.src('./src/**/*.css')
        .pipe(gulp.dest('./www'));
});

gulp.task('html', () => {
    return gulp.src('./src/index.html')
        .pipe(inject(gulp.src([
            './www/**/*.js',
            './www/**/*.css'
        ], { read: false }), { relative: true }))
        .pipe(gulp.dest('./www'));
});
