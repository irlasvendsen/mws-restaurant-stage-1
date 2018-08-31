/*eslint-env node */
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var browserify = require('browserify');




gulp.task('sass', function(){
	return gulp.src('./app/css/**/*.css')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

gulp.task('dbhelper', function(){

	return browserify({
		entries: ['./app/js/dbhelper.js']
	})
		.transform(babelify.configure({
			presets : ['@babel/preset-env']
		}))
		.bundle()
		.pipe(source('dbhelper.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist/js'));


	//var bundler = browserify('app/js/**/*.js');
//  bundler.transform(babelify);
//	return gulp.src('app/js/**/*.js')
//		.pipe(babel({
//			presets: ['env']
//		}))
//		.pipe(gulp.dest('dist/js'));
	//return gulp.src('app/js/**/*.js').pipe(gulp.dest('dist/js'));
});
gulp.task('main', function(){

	return browserify({
		entries: ['./app/js/main.js']
	})
		.transform(babelify.configure({
			presets : ['@babel/preset-env']
		}))
		.bundle()
		.pipe(source('main.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('db', function(){

	return browserify({
		entries: ['./app/sw.js']
	})
		.transform(babelify.configure({
			presets : ['@babel/preset-env']
		}))
		.bundle()
		.pipe(source('sw.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist'));
});


gulp.task('cp-js', function(){
	return gulp.src(['./app/js/dbhelper.js', './app/js/main.js', './app/js/register.js', './app/js/restaurant_info.js']).pipe(gulp.dest('./dist/js'));
});

gulp.task('cp-pages', function(){
	return gulp.src('./app/*.html', './app/manifest.json').pipe(gulp.dest('./dist'));
});
gulp.task('cp-img', function(){
	return gulp.src('./app/img/*').pipe(gulp.dest('./dist/img'));
});

gulp.task('default', gulp.parallel('sass','cp-pages','cp-img','cp-js', 'db'), function(){

	return;
});
