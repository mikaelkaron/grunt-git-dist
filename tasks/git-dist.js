/*
 * grunt-git-dist
 * https://github.com/mikaelkaron/grunt-git-dist
 *
 * Copyright (c) 2013 Mikael Karon
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	"use strict";

	var ARRAY_FOREACH = Array.prototype.forEach;
	var BRANCH = "branch";
	var DIR = "dir";
	var MESSAGE = "message";
	var NAME = "name";
	var EMAIL = "email";

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
			case "clone" :
				requiresOptions(BRANCH, DIR);

				series.push(function (callback) {
					grunt.util.spawn({
						"cmd" : "git",
						"args" : [ "clone", "--no-checkout", "--single-branch", "--branch", options[BRANCH], ".", options[DIR] ]
					}, callback);
				});

				grunt.util.async.series(series, doneFunction);
				break;

			case "configure" :
				if (NAME in options) {
					series.push(function (callback) {
						grunt.util.spawn({
							"cmd" : "git",
							"args" : [ "config", "user.name", options[NAME] ],
							"opts" : {
								"cwd" : options[DIR]
							}
						}, function (error, result, code) {
							result = result.toString() || code === 0
								? "Configured user.name to " + options[NAME]
								: "Unable to configure user.name to " + options[NAME];

							callback(error, result, code);
						});
					});
				}

				if (EMAIL in options) {
					series.push(function  (callback) {
						grunt.util.spawn({
							"cmd" : "git",
							"args" : [ "config", "user.email", options[EMAIL] ],
							"opts" : {
								"cwd" : options[DIR]
							}
						}, function (error, result, code) {
							result = result.toString() || code === 0
								? "Configured user.email to " + options[EMAIL]
								: "Unable to configure user.email to " + options[EMAIL];

							callback(error, result, code);
						});
					});
				}

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
					grunt.util.spawn({
						"cmd" : "git",
						"args" : MESSAGE in options
							? [ "commit", "--no-edit", "--message", options[MESSAGE] ]
							: [ "commit", "--no-edit", "--allow-empty-message" ],
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
