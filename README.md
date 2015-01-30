parcelify-cdn
=============

> Parcelify as a service

Serves cached css resources of a npm module.

Inspired by [browserify-cdn](https://github.com/jesusabdullah/browserify-cdn)

This service runs [parcelify](https://github.com/rotundasoftware/parcelify) (browserify for css) and then the output is [displayed](http://parce.li/bundle/biojs-vis-msa) + cached.

# API

## GET /bundle/:module

Get the latest version of :module.

## GET /bundle/:module@:version

Get a version of `:module` which satisfies the given `:version`
[semver range](https://github.com/isaacs/node-semver#ranges). Defaults to latest.

## GET /debug-bundle/:module
## GET /debug-bundle/:module@:version

The same as the prior two, except with `--debug` passed to parcelify.
