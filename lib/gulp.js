var through = require('through2');
var gutil = require('gulp-util');
var transform = require('./transform');

const PLUGIN_NAME = 'js-bundler';
var GLOBAL_OPTIONS = {};
var bundleCache = {};

function getBundle(filePath, options) {
	var key = typeof filePath === 'string' ? filePath : JSON.stringify(filePath);
	if (!bundleCache[key]) {
		bundleCache[key] = transform(Object.assign({}, options, {
			entries: filePath
		}, GLOBAL_OPTIONS));
	}

	return bundleCache[key];
}

module.exports = function(options) {
	options = options || {};

	return through.obj(function(file, enc, next) {
		if (file.isNull()) {
			return next(null, file);
		}

		if (file.isStream()) {
			return next(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
		}

		var self = this;
		getBundle(file.path, options).bundle(function(err, buf) {
			if (err) {
				return next(err);
			}

			file.contents = Buffer.from(buf);
			self.push(file);
			next();
		});
	});
};

module.exports.options = function(value) {
	GLOBAL_OPTIONS = Object.assign({}, value || {});
};