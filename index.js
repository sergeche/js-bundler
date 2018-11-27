var gulpPlugin = require('./lib/gulp');

module.exports = function(obj) {
	if (typeof obj === 'object' && obj.registerMultiTask) {
		throw new Error('Grunt is not currently supported');
	}

	return module.exports.gulp(obj).on('error', function(err) {
		console.error(err.stack || err);
		this.emit('end');
	});
};

module.exports.gulp = function(obj) {
	return gulpPlugin(obj);
};

module.exports.watch = function() {
	gulpPlugin.watch.apply(gulpPlugin, arguments);
};

module.exports.unwatch = function() {
	gulpPlugin.unwatch.apply(gulpPlugin, arguments);
};

module.exports.options = function() {
	gulpPlugin.options.apply(gulpPlugin, arguments);
};
