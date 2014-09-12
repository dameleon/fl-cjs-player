var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var shell = require('gulp-shell');
var rename = require('gulp-rename');
var pkg = require('./package.json');
var banner = '/*! <%= pkg.name %> // @version <%= pkg.version %>, @license <%= pkg.license %>, @Author <%= pkg.author %> */\n';

// jsduck がディレクトリ内のファイルを全消しする fxxk な仕様なので、.git ファイルを一旦逃がす
gulp.task('document', shell.task([
    'mv docs/.git ./.git_docs',
    'jsduck src/*.js --output docs',
    'mv ./.git_docs docs/.git'
]));

gulp.task('lint', function() {
    gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('dist', function() {
    gulp.src([
			'src/fl-cjs-player.js',
			'src/fl-cjs-player.extend.js',
			'src/fl-cjs-player.asset-loader.js',
			'src/fl-cjs-player.q.js',
		])
		.pipe(concat('fl-cjs-player.combined.js'))
        .pipe(header(banner, { name: 'FL-CJS Player', pkg: pkg }))
        .pipe(gulp.dest('dist'));

    gulp.src('src/extensions/*.js')
        .pipe(concat('cjs.extensions.js'))
        .pipe(header(banner, { name: 'CreateJS Extensions', pkg: pkg }))
        .pipe(gulp.dest('dist'))

    gulp.src([
			'src/fl-cjs-player.js',
			'src/fl-cjs-player.extend.js',
			'src/fl-cjs-player.asset-loader.js',
			'src/fl-cjs-player.q.js',
			'src/extensions/*.js',
		])
        .pipe(concat('fl-cjs-player.all.js'))
        .pipe(uglify({ outSourceMap: true, preserveComments: 'some' }))
        .pipe(header(banner, { name: 'FL-CJS Player', pkg: pkg }))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', ['lint', 'dist'], shell.task([
    'karma start'
]));

gulp.task('default', ['lint', 'dist', 'test']);
