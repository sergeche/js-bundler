var gulp = require('gulp');
var plugin = require('../lib/gulp');

gulp.task('default', function() {
	return gulp.src('./example.js')
		.pipe(plugin({sourceMap: true, uglify: true}))
		.pipe(gulp.dest('./out'));
});

gulp.task('watch', function() {
	plugin.watch({uglify: false});
	gulp.watch('./*.js', ['default']);
});