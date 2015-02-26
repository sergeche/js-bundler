var through = require('through2');
var extend = require('xtend');
var transform = require('./transform');

const PLUGIN_NAME = 'js-bundler';
var GLOBAL_WATCH = false;
var GLOBAL_OPTIONS = {};

module.exports = function(options) {
	options = options || {};
	var bundleCache = {};
	var getBundle = function(filePath) {
		var key = typeof filePath === 'string' ? filePath : JSON.stringify(filePath);
		if (!bundleCache[key]) {
			bundleCache[key] = transform(extend({}, options, {
				entries: filePath
			}, GLOBAL_OPTIONS));
		}

		return bundleCache[key];
	};

	return through.obj(function (file, enc, next) {
		if (file.isNull()) {
			return next(null, file);
		}

		if (file.isStream()) {
			return next(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
		}

		try {
			var self = this;
			getBundle(file.path).bundle(function(err, buf) {
				if (err) {
					self.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
					return next();
				} else {
					file.contents = new Buffer(buf);
					self.push(file);
				}

				next();
			});
		} catch (err) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
		}
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