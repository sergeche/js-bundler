var through = require('through2');
var extend = require('xtend');
var transform = require('./transform');
var gutil = require('gulp-util');

const PLUGIN_NAME = 'js-bundler';
var GLOBAL_OPTIONS = {};
var bundleCache = {};

function getBundle(filePath, options) {
	var key = typeof filePath === 'string' ? filePath : JSON.stringify(filePath);
	if (!bundleCache[key]) {
		bundleCache[key] = transform(extend({}, options, {
			entries: filePath
		}, GLOBAL_OPTIONS));
	}

	return bundleCache[key];
};

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

			file.contents = new Buffer(buf);
			self.push(file);
			next();
		});
	});
};

module.exports.options = function(value) {
	GLOBAL_OPTIONS = extend({}, value || {});
};

module.exports.watch = function(options) {
	module.exports.options(extend({watch: true}, options || {}));
};

module.exports.unwatch = function(options) {
	module.exports.options(extend({watch: false}, options || {}));
};