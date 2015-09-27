'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	runSequence = require('run-sequence'),
	plugins = gulpLoadPlugins();

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
	process.env.NODE_ENV = 'development';
});

// Nodemon task
gulp.task('nodemon', function () {
	return plugins.nodemon({
		script: 'server.js',
		nodeArgs: ['--debug'],
		ext: 'js,html',
		watch: _.union('app/*.html', 'app/*.js')
	});
});

// Watch Files For Changes
gulp.task('watch', function() {
	// Start livereload
	plugins.livereload.listen();

	// Add watch rules
	gulp.watch('*.html').on('change', plugins.livereload.changed);
	gulp.watch('app/*.js', ['jshint']).on('change', plugins.livereload.changed);
});


// JS linting task
gulp.task('jshint', function () {
	return gulp.src('app/*.js')
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.jshint.reporter('fail'));
});


// Run the project in development mode
gulp.task('default', function(done) {
	runSequence('env:dev', 'jshint', ['nodemon', 'watch'], done);
});

