/*
 * grunt-git-dist
 * https://github.com/mikaelkaron/grunt-git-dist
 *
 * Copyright (c) 2013 Mikael Karon
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	"use strict";

	var UNDEFINED;
	var ARRAY_FOREACH = Array.prototype.forEach;
	var URL = "url";
	var BRANCH = "branch";
	var DIR = "dir";
	var MESSAGE = "message";
	var CONFIG = "config";
	var EMPTY = "empty";

	grunt.task.registerMultiTask("git-dist", "Release using git", function (phase) {
		var done = this.async();
		var options = this.options();
		var series = [];

		function doneFunction (err, results) {
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
				grunt.fail.warn(message);
			}

			grunt.log.ok(message);

			done(true);
		}

		function requiresOptions () {
			var fail = false;

			ARRAY_FOREACH.call(arguments, function (option) {
				if (!(option in options)) {
					grunt.log.error("'" + option + "' is missing");
					fail = true;
				}
			});

			if (fail) {
				grunt.fail.warn("Required options missing.");
			}
		}

		// Log flags (if verbose)
		grunt.log.verbose.writeflags(options);

		switch (phase) {
			case "init" :
				requiresOptions(BRANCH, DIR);

				series.push(function (callback) {
					var args = [ "clone", "--quiet", "--no-checkout" ];
					var url = options[URL] || ".";
					var dir = options[DIR];
					var config;
					var fail;

					if (CONFIG in options) {
						config = options[CONFIG];
						fail = false;

						Object.keys(config).forEach(function (key) {
							var option = "git-dist." + key;
							var value = grunt.option(option) || config[key];

							if (value === UNDEFINED) {
								grunt.log.error("'" + option + "' is missing.");
								fail = true;
							}
							else {
								args.push("--config", key + "=" + value);
							}
						});

						if (fail === true) {
							grunt.fail.warn("Required options missing.");
						}
					}

					args.push(url, dir);

					grunt.util.spawn({
						"cmd" : "git",
						"args" : args
					}, function (error, result, code) {
						callback(error, result.toString() || (code === 0 ? "Cloned '" + url + "' into '" + dir + "'" : "Unable to clone '" + url + "' into '" + dir + "'"), code);
					});
				});

				series.push(function (callback) {
					var args = [ "checkout", "--orphan", options[BRANCH] ];

					grunt.util.spawn({
						"cmd" : "git",
						"args" : args,
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

				series.push(function (callback) {
					var args = [ "rm", "-rf", "." ];

					grunt.util.spawn({
						"cmd" : "git",
						"args" : args,
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

				grunt.util.async.series(series, doneFunction);
				break;

			case "clone" :
				requiresOptions(BRANCH, DIR);

				series.push(function (callback) {
					var args = [ "clone", "--quiet", "--no-checkout", "--single-branch", "--recurse-submodules", "--branch", options[BRANCH] ];
					var url = options[URL] || ".";
					var dir = options[DIR];
					var config;
					var fail;

					if (CONFIG in options) {
						config = options[CONFIG];
						fail = false;

						Object.keys(config).forEach(function (key) {
							var option = "git-dist." + key;
							var value = grunt.option(option) || config[key];

							if (value === UNDEFINED) {
								grunt.log.error("'" + option + "' is missing.");
								fail = true;
							}
							else {
								args.push("--config", key + "=" + value);
							}
						});

						if (fail === true) {
							grunt.fail.warn("Required options missing.");
						}
					}

					args.push(url, dir);

					grunt.util.spawn({
						"cmd" : "git",
						"args" : args
					}, function (error, result, code) {
						callback(error, result.toString() || (code === 0 ? "Cloned '" + url + "' into '" + dir + "'" : "Unable to clone '" + url + "' into '" + dir + "'"), code);
					});
				});

				grunt.util.async.series(series, doneFunction);
				break;

			case "commit" :
				requiresOptions(DIR);

				series.push(function (callback) {
					grunt.util.spawn({
						"cmd" : "git",
						"args" : [ "add", "--all" ],
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

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

					grunt.util.spawn({
						"cmd" : "git",
						"args" : args,
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

				grunt.util.async.series(series, doneFunction);
				break;

			case "push" :
				requiresOptions(DIR);

				series.push(function (callback) {
					grunt.util.spawn({
						"cmd" : "git",
						"args" : [ "push", "origin" ],
						"opts" : {
							"cwd" : options[DIR]
						}
					}, callback);
				});

				grunt.util.async.series(series, doneFunction);
				break;

			default :
				grunt.fail.warn("Unknown phase '" + phase + "'");
		}
	});
};
