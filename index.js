var gulpPlugin = require('./lib/gulp');
var extend = require('xtend');

module.exports = function(obj) {
	if (typeof obj === 'object' && obj.registerMultiTask) {
		throw new Error('Grunt is not currently supported');;
	}

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