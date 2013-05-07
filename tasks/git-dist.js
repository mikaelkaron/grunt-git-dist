/*
 * grunt-git-dist
 * https://github.com/mikaelkaron/grunt-git-dist
 *
 * Copyright (c) 2013 Mikael Karon
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	var ARRAY_FOREACH = Array.prototype.forEach;
	var URL = "url";
	var BRANCH = "branch";
	var DIR = "dir";
	var MESSAGE = "message";
	var NAME = "name";
	var EMAIL = "email";

	grunt.task.registerMultiTask("git-dist", "Release using git", function (phase) {
		var done = this.async();
		var options = this.options();

		function doneFunction (err, result) {
			if (err) {
				grunt.fail.warn(err);
			}

			grunt.log.ok(result);

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
				requiresOptions(URL, BRANCH, DIR);

				grunt.util.spawn({
					"cmd" : "git",
					"args" : [ "clone", "--branch=" + options[BRANCH], options[URL], options[DIR] ]
				}, doneFunction);
				break;

			case "configure" :
				requiresOptions(NAME, EMAIL);

				grunt.util.async.series([
					function (callback) {
						grunt.util.spawn({
							"cmd" : "git",
							"args" : [ "config", "user.name", options[NAME] ],
							"opts" : {
								"cwd" : options[DIR]
							}
						}, callback);
					},
					function  (callback) {
						grunt.util.spawn({
							"cmd" : "git",
							"args" : [ "config", "user.email", options[EMAIL] ],
							"opts" : {
								"cwd" : options[DIR]
							}
						}, callback);
					}
				], function (err, results) {
					doneFunction(err, "Configured user.name '" + options[NAME] + "' and user.email '" + options[EMAIL] + "'");
				});
				break;

			case "commit" :
				requiresOptions(DIR);

				grunt.util.spawn({
					"cmd" : "git",
					"args" : [ "commit", "--all", "--no-edit", MESSAGE in options ? "--message=" + options[MESSAGE] : "--allow-empty-message" ],
					"opts" : {
						"cwd" : options[DIR]
					}
				}, doneFunction);
				break;

			case "push" :
				requiresOptions(URL, BRANCH, DIR);

				grunt.util.spawn({
					"cmd" : "git",
					"args" : [ "push", "--quiet", options[URL], options[BRANCH] ],
					"opts" : {
						"cwd" : options[DIR]
					}
				}, doneFunction);
				break;

			default :
				grunt.fail.warn("Unknown phase '" + phase + "'");
		}
	});
};
