var gulp = require('gulp');
var plugin = require('../lib/gulp');

gulp.task('default', function() {
	return gulp.src('./example.js')
		.pipe(plugin({
			sourceMap: true, 
			uglify: true,
			standalone: true,
			preprocess: function(file, data, options) {
				return data.replace(/%VERSION%/g, '1.0.0');
			}
		}))
		.pipe(gulp.dest('./out'));
});

gulp.task('watch', function() {
	plugin.watch({uglify: false});
	gulp.watch('./*.js', ['default']);
});