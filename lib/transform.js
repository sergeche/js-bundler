var path = require('path');
var browserify = require('browserify');
var watchify = require('watchify');
var extend = require('xtend');
var through = require('through2');
var convert = require('convert-source-map');
var minify = require('uglify-js').minify;
var babel = require('babel');

module.exports = function(options) {
	options = options || {};
	var bwOptions = extend({debug: !!options.sourceMap}, options);
	if (bwOptions.standalone === true) {
		var filePath = Array.isArray(bwOptions.entries) ? bwOptions.entries[0] : bwOptions.entries;
		bwOptions.standalone = path.basename(filePath)
			.replace(/\.\w+$/, '')
			.replace(/-(\w)/ig, function(str, l) {
				return l.toUpperCase();
			});
	}

	if (bwOptions.watch) {
		bwOptions.cache = {};
		bwOptions.packageCache = {};
	}

	var b = browserify(bwOptions);
	if (options.watch) {
		b = watchify(b);
	}
	
	if (bwOptions.exclude) {
		b.exclude(bwOptions.exclude);
	}

	var addTransforms = function(items, global, opt) {
		if (!Array.isArray(items)) {
			items = [items];
		}

		items.forEach(function(fn) {
			if (typeof fn === 'function') {
				b.transform(stream(fn, opt), {global: !!global});
			}
		});
	};

	var global = !!options.global;
	addTransforms(options.preprocess, global, options);
	addTransforms(es6, global, {sourceMap: !!options.sourceMap});

	if (options.uglify) {
		addTransforms(uglify, true, options);
	}
	addTransforms(options.postprocess, global, options);

	return b;
};

function stream(fn, options) {
	options = options || {};
	return function(file) {
		var data = '';
		return through(function(chunk, enc, next) {
			data += chunk;
			next();
		}, function(next) {
			try {
				this.push(fn(file, data, options));
				next();
			} catch(err) {
				return next(err);
			}
		});
	};
}

function es6(file, data, options) {
	options = options || {};
	var optionsWhiteList = ['filename', 'filenameRelative', 'blacklist', 'whitelist', 'loose', 'optional', 'modules', 'sourceMap', 'sourceMapName', 'sourceFileName', 'sourceRoot', 'moduleRoot', 'moduleIds', 'moduleId', 'resolveModuleSource', 'keepModuleIdExtensions', 'externalHelpers', 'code', 'ast', 'playground', 'experimental', 'compact', 'comments']
	var opt = {};
	if (options) {
		optionsWhiteList.forEach(function(name) {
			if (name in options) {
				opt[name] = options[name];
			}
		});
	}

	opt.filename = file;
	opt.sourceMap = !!options.sourceMap;

	var res = babel.transform(data, opt);
	data = res.code;
	if (opt.sourceMap && res.map) {
		data += '\n' + convert.fromObject(res.map).toComment();
	}
	return data;
}

function uglify(file, data, options) {
	var opt = {fromString: true};
	var sourceMap = convert.fromSource(data);
	if (sourceMap) {
		opt.inSourceMap = sourceMap.sourcemap;
		opt.outSourceMap = file;
	}

	var res = minify(data, opt);
	data = res.code;
	if (sourceMap) {
		var localSourceMap = JSON.parse(res.map);
		localSourceMap.sourcesContent = sourceMap.sourcemap.sourcesContent;
		data = data.replace(/\/\/#\s+sourceMappingURL=.+$/, convert.fromObject(localSourceMap).toComment());
	}

	return data;
}
