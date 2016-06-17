'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');
const chalk = require('chalk');

let typescript;
let tsProject;
let sourcemaps;
gulp.task('build:typescript', () => {
    if (!typescript) {
        typescript = require('gulp-typescript');
        tsProject = typescript.createProject('tsconfig.json', {sortOutput: true});
        sourcemaps = require('gulp-sourcemaps');
    }
    let tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return tsResult.js
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('build'));
});

var tsProjectTests;
gulp.task('build:typescript:tests', () => {
    if (!typescript) {
        typescript = require('gulp-typescript');
        sourcemaps = require('gulp-sourcemaps');
    }
    if (!tsProjectTests) {
        tsProjectTests = typescript.createProject('tsconfig-tests.json');
    }
    var tsResult = tsProjectTests.src()
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProjectTests));

    return tsResult.js
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('build'));
});

gulp.task('build:tests', ['build:typescript:tests']);

gulp.task('build:dev', ['build:typescript', 'build:tests']);

let del;
gulp.task('clean', () => {
    if (!del) {
        del = require('del');
    }
    return del(['build']);
});

gulp.task('watch:dev', () => {
    gulp.watch(['src/**/*.ts'], ['typescript']);
    gulp.watch(['build/**/**'], ['run']);
});

gulp.task('watch', () => {
    gulp.watch(['src/**/*.ts'], ['typescript']);
});

var mocha;
gulp.task('test', () => {
    if (!mocha) {
        mocha = require('gulp-mocha');
    }
    return gulp.src(['build/**/tests/*.test.js'], {read: false})
            .pipe(mocha());
});

let spawn;
let proc;
let getDate = (date) => {
    date = date || new Date();
    var hours = date.getHours();
    hours = hours < 10 ? '0' + hours : hours;
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return hours + ':' + minutes + ':' + seconds;
};
gulp.task('run', () => {
    if (!spawn) {
        spawn = require('child_process').spawn;
    }
    if (proc) {
        proc.kill('SIGHUP');
        proc = undefined;
    }
    // proc = spawn('node', ['build']);
    proc = spawn('heroku', ['local']);
    proc.stderr.on('data', (data) => {
        process.stdout.write(`[${chalk.gray(getDate())}] [${chalk.green('Proc')}] ${chalk.red(data)}`);
    });
    proc.stdout.on('data', (data) => {
        process.stdout.write(`[${chalk.gray(getDate())}] [${chalk.green('Proc')}] ${data}`);
    });
});

gulp.task('set-dev', () => {
    process.env.DEVELOPMENT = true;
});

gulp.task('build', (callback) => {
    runSequence('clean', ['build:typescript'], callback);
});

gulp.task('dev', (callback) => {
    runSequence('set-dev', 'build:dev', 'run', 'watch:dev', callback);
});

gulp.task('default', ['build']);
