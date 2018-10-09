/*eslint-env node */
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var browserify = require('browserify');
var del = require('del');


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

gulp.task('db1', function(){

	return browserify({
		entries: ['./app/js/dbhelper.js']
	})
		.transform(babelify.configure({
			presets : ['@babel/preset-env']
		}))
		.bundle()
		.pipe(source('js/dbhelper.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist'));
});

gulp.task('main', function(){

	return browserify({
		entries: ['./app/js/main.js']
	})
		.transform(babelify.configure({
			presets : ['@babel/preset-env']
		}))
		.bundle()
		.pipe(source('js/main.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist'));
});

gulp.task('restaurant', function(){

	return browserify({
		entries: ['./app/js/restaurant_info.js']
	})
		.transform(babelify.configure({
			presets : ['@babel/preset-env']
		}))
		.bundle()
		.pipe(source('js/restaurant_info.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist'));
});




gulp.task('clean', del.bind(null, ['dist']));

gulp.task('cp-js', function(){
	//'./app/js/main.js','!app/js/**/dbhelper.js' './app/js/register.js', './app/js/restaurant_info.js', './app/js/idb-keyval.mjs'
	return gulp.src(['./app/js/*']).pipe(gulp.dest('./dist/js'));
});

gulp.task('cp-pages', function(){
	return gulp.src('./app/*.html').pipe(gulp.dest('./dist'));
});

gulp.task('cp-manifest', function(){
	return gulp.src('./app/manifest.json').pipe(gulp.dest('./dist'));
});

gulp.task('cp-img', function(){
	return gulp.src('./app/img/*').pipe(gulp.dest('./dist/img'));
});

gulp.task('watch', function() {
	return	gulp.watch('app/css/**/*.css', ['html', 'css']);
	//	gulp.watch('app/js/**/*.js', ['html', 'js', 'dbhelper']);
	//	gulp.watch('app/sw.js', ['sw']);
	});

gulp.task('default', gulp.series('clean','sass','cp-pages','cp-img','cp-js', 'db', 'cp-manifest'), function(){
	return;
});
