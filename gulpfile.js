const gulp = require('gulp');
const babili = require('gulp-babili');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const inject = require('gulp-inject');
const sass = require('gulp-sass');
const sequence = require('gulp-sequence');
const sourcemaps = require('gulp-sourcemaps');
// const tslint = require('gulp-tslint');
const typescript = require('gulp-typescript').createProject('tsconfig.json');

gulp.task('watch', ['build'], () => {
    gulp.watch('./src/**/*', ['build']);
})

gulp.task('build', callback => {
    sequence('clean', 'tslint', 'typescript', 'sass', 'inject')(callback);
});

gulp.task('clean', () => {
    return gulp.src('./www')
        .pipe(clean());
});

gulp.task('tslint', () => {
    return gulp.src('./src/ts/**/*.ts')
        //.pipe(tslint())
        //.pipe(tslint.report());
});

gulp.task('typescript', () => {
    return gulp.src('./src/ts/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(typescript())
        .pipe(concat('main.js'))
        .pipe(babili())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./www/js'));
});

gulp.task('sass', () => {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./www/css'));
});

gulp.task('inject', () => {
    return gulp.src('./src/index.html')
        .pipe(inject(gulp.src([
            './www/js/**/*.js',
            './www/css/**/*.css'
        ]), { relative: true, ignorePath: '../www/' }))
        .pipe(gulp.dest('./www'));
});
