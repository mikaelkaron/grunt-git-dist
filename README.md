[![Build Status](https://travis-ci.org/mikaelkaron/grunt-git-dist.png)](https://travis-ci.org/mikaelkaron/grunt-git-dist)
[![NPM version](https://badge.fury.io/js/grunt-git-dist.png)](http://badge.fury.io/js/grunt-git-dist)

# grunt-git-dist

> Release using git

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-git-dist --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-git-dist');
```

## The "git-dist" task

### Overview
In your project's Gruntfile, add a section named `git-dist` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  "git-dist" : {
    "options" : {
      "url" : "<%= pkg.repository.url %>",
      "branch" : "build/2.x",
      "dir" : "<%= build.dist %>",
      "message" : "<%= pkg.name %> - <%= pkg.version %>",
      "name" : "<%= pkg.author.name %>",
      "email" : "<%= pkg.author.email %>",
      "empty" : true
    },
    "your_target": {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

> Note that since this is a [multi-task](http://gruntjs.com/creating-tasks#multi-tasks) you have to have at least one target defined for `git-dist` (otherwise the task won't run)

### Options

#### options.url
Type: `String`  
Default value: `undefined`

A string value that is used to select what repository to clone. If empty the current repository will be used.

#### options.branch
Type: `String`  
Default value: `undefined`

A string value that is used to select what branch to clone.

#### options.dir
Type: `String`  
Default value: `undefined`

A string value that is used select what dir to clone to.

#### options.message
Type: `String`  
Default value: `undefined`

A string value that is used as a commit message.

#### options.name
Type: `String`  
Default value: `undefined`

A string value that is used as the committer name.

#### options.email
Type: `String`  
Default value: `undefined`

A string value that is used as the committer email.

#### options.empty
Type: `Boolean`  
Default value: `undefined`

A boolean value that is used to allow empty commits.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.2.2 - Added support for `empty`  
0.2.1 - Realized that we can support URL, so added it back  
0.2.0 - Remove support for URL as we always clone the local repository  
0.1.1 - Fix so deleted files are tracked  
0.1.0 - Initial release  
