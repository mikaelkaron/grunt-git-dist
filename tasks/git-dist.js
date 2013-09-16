/*
 * grunt-git-dist
 * https://github.com/mikaelkaron/grunt-git-dist
 *
 * Copyright (c) 2013 Mikael Karon
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	"use strict";

	var _ = grunt.util._;
	var _process = require("grunt-util-process")(grunt);
	var _options = require("grunt-util-options")(grunt);
	var _spawn = require("grunt-util-spawn")(grunt);
	var _required = require("grunt-util-required")(grunt);
	var GIT_DIST = "git-dist";

	var URL = "url";
	var BRANCH = "branch";
	var DIR = "dir";
	var PATHS = "paths";
	var MESSAGE = "message";
	var TAG = "tag";
	var CONFIG = "config";
	var EMPTY = "empty";

	var OPTIONS = {};
	OPTIONS[URL] = ".";

	// Add GIT_DIST delimiters
	grunt.template.addDelimiters(GIT_DIST, "{%", "%}");

	// Register GIT_DIST task
	grunt.task.registerMultiTask(GIT_DIST, "Release using git", function (phase) {
		/**
		 * @private
		 * @param err
		 * @param results
		 */
		function doneSeries(err, results) {
			var message = results
				.filter(function (result) {
					return err ? result[1] !== 0 : result[1] === 0;
				})
				.map(function (result) {
					result = result[0];
					result = result.stdout || result.stderr || result;
					result = result.toString();

					return err
						? result.replace("\n", " - ")
						: result;
				})
				.join("\n");

			if (err) {
				grunt.warn(new Error(message));
			}

			grunt.log.ok(message);

			done(true);
		}

		var me = this;
		var name = me.name;
		var target = me.target;
		var series = [];

		// Start async task
		var done = me.async();

		// Get options and process
		var options = _process.call(_options.call(me, me.options(OPTIONS), URL, BRANCH, DIR, MESSAGE, TAG), {
			"delimiters" : GIT_DIST
		}, URL, BRANCH, DIR, MESSAGE, TAG);

		// Log flags (if verbose)
		grunt.log.verbose.writeflags(options);

		switch (phase) {
			case "init" :
				_required.call(options, BRANCH, DIR);

				series.push(function (callback) {
					var url = options[URL];
					var dir = options[DIR];
					var args = [ "clone", "--quiet", "--no-checkout" ];

					_.forOwn(options[CONFIG], function (value, key) {
						value = value
							|| grunt.option([ name, target, key ].join("."))
							|| grunt.option([ name, key ].join("."))
							|| grunt.option(key);

						if (_.isUndefined(value)) {
							grunt.log.error("'" + key.cyan + "' is missing");
						}
						else {
							args.push("--config", key + "=" + value);
						}
					});

					if (me.errorCount > 0) {
						grunt.warn(new Error("Required config missing."));
					}

					args.push(url, dir);

					_spawn({
						"cmd" : "git",
						"args" : args
					}, function (error, result, code) {
						callback(error, result.toString() || (code === 0 ? "Cloned '" + url + "' into '" + dir + "'" : "Unable to clone '" + url + "' into '" + dir + "'"), code);
					});
				});

				series.push(function (callback) {
					_spawn({
						"cmd" : "git",
						"args" : [ "checkout", "--orphan", options[BRANCH] ],
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

				series.push(function (callback) {
					_spawn({
						"cmd" : "git",
						"args" : [ "rm", "-rf", "." ],
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

				grunt.util.async.series(series, doneSeries);
				break;

			case "clone" :
				_required.call(options, BRANCH, DIR);

				series.push(function (callback) {
					var url = options[URL] || ".";
					var dir = options[DIR];
					var args = [ "clone", "--quiet", "--no-checkout", "--single-branch", "--recurse-submodules", "--branch", options[BRANCH] ];

					_.forOwn(options[CONFIG], function (value, key) {
						value = value
							|| grunt.option([ name, target, key ].join("."))
							|| grunt.option([ name, key ].join("."))
							|| grunt.option(key);

						if (_.isUndefined(value)) {
							grunt.log.error("'" + key.cyan + "' is missing");
						}
						else {
							args.push("--config", key + "=" + value);
						}
					});

					if (me.errorCount > 0) {
						grunt.warn(new Error("Required config missing."));
					}

					args.push(url, dir);

					_spawn({
						"cmd" : "git",
						"args" : args
					}, function (error, result, code) {
						callback(error, result.toString() || (code === 0 ? "Cloned '" + url + "' into '" + dir + "'" : "Unable to clone '" + url + "' into '" + dir + "'"), code);
					});
				});

				grunt.util.async.series(series, doneSeries);
				break;

			case "add" :
				_required.call(options, DIR);

				series.push(function (callback) {
					var args = [ "add" ];

					if (PATHS in options) {
						args = args.concat(options, "--", options[PATHS]);
					}
					else {
						args.push("--all");
					}

					_spawn({
						"cmd" : "git",
						"args" : args,
						"opts" : {
							"cwd" : options[DIR]
						}
					}, function (error, result, code) {
						var files = (options[PATHS] || [ "file(s)" ]).join(",");

						callback(error, result.toString() || (code === 0 ? "Added " + files.cyan : "Unable to add '" + files.cyan), code);
					});
				});

				grunt.util.async.series(series, doneSeries);
				break;

			case "commit" :
				_required.call(options, DIR);

				series.push(function (callback) {
					var args = [ "commit", "--no-edit" ];

					if (MESSAGE in options) {
						args.push("--message", options[MESSAGE]);
					}
					else {
						args.push("--allow-empty-message");
					}

					if (options[EMPTY] === true) {
						args.push("--allow-empty");
					}

					_spawn({
						"cmd" : "git",
						"args" : args,
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

				grunt.util.async.series(series, doneSeries);
				break;

			case "tag" :
				_required.call(options, TAG, MESSAGE);

				series.push(function (callback) {
					_spawn({
						"cmd" : "git",
						"args" : [ "tag", "-m", options[MESSAGE], options[TAG] ],
						"opts" : {
							"cwd" : options[DIR]
						}
					}, function (error, result, code) {
						callback(error, result.toString() || (code === 0 ? "Tagged '" + options[TAG] + "'" : "Unable to tag '" + options[TAG] + "'"), code);
					});
				});

				grunt.util.async.series(series, doneSeries);
				break;


			case "push" :
				_required.call(options, DIR);

				series.push(function (callback) {
					_spawn({
						"cmd" : "git",
						"args" : [ "push", "origin", "--tags", "HEAD" ],
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

				grunt.util.async.series(series, doneSeries);
				break;

			default :
				grunt.warn(new Error("Unknown phase '" + phase + "'"));
		}
	});
};
