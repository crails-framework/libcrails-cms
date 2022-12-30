# libcrails-cms

A _Content Management System_ built upon the Crails Framework. Designed to be light, fast and easy to extend. The default settings
include:

* document editor based on [CKEditor](https://ckeditor.com)
* extensible page editor based on [ContentTools](https://getcontenttools.com)
* [OpenGraph](https://opengraph.dev) support
* custom theme support using [ecpp](https://github.com/crails-framework/ecpp) templates
* upload management using [Uppy](http://uppy.io) and [ImageMagick](https://imagemagick.org)
* simple user management

## Building

Install the [Crails Framework](https://crails-framework.github.io/website/) using one of the install guides.

Install [npm](https://www.npmjs.com) on your system.

Then, run the following commands:

```sh
# Preparing the package
bpkg create -d cms-build-gcc cc config.cxx=g++
cd cms-build-gcc
bpkg add 'https://github.com/crails-framework/libcrails-cms.git#master'
bpkg fetch
bpkg build libcrails-cms '?sys:libssl' --configure-only

# Generate HTML templates, JavaScript and stylesheets
cd libcrails-cms-2.0.0
./prebuild.sh
cd ..

# Builds the project
bpkg build libcrails-cms
bpkg install --all --recursive config.install.root=/usr/local config.install.sudo=sudo
```

## Warning

This CMS is currently in development. To use it and customize it, it's best to be familiar with the [Crails Framework](https://crails-framework.github.io/website/).

Further developments will include a Command Line Interface tool to quickly scaffold new projects and extend on the default features.

Additional core features are also in the works, including marketplace, booking and blogging.
