var EventEmitter = require('events').EventEmitter;
var q = require("bluebird");
var xtend = require('xtend');
var cache = require('./cache');
var core = require('./node-core');
var buildEnv = require('./build-env');

var parcelify = require("./parcelify");
var install = require("./install");

var u = require("./utils");

module.exports = function bundler(opts) {
  opts = opts || {};

  var db = opts.db;

  var c = cache(db);
  var log = opts.log || console;

  // Used to handle the case where a build is already in-progress
  var inProgress = {};

  var _bundle = function bundle(pkgs) {

    // support also multiple packages
    if (typeof pkgs === "string") {
      pkgs = [{
        name: pkgs,
        version: "latest"
      }];
    } else if (!u.isArray(pkgs)) {
      pkgs = [pkgs];
    }

    // wait for ALL packages to be resolved and checked
    return q.map(pkgs, build).then(function(ps) {
      return ps;
    });

    function build(pkg) {

      return new q.Promise(function(resolve, reject) {

        var moduleName = pkg.name;
        var version = pkg.version;

        var key = [moduleName, version].join('@');


        if (inProgress[key]) {
          inProgress[key].once('bundle', handleBundleEvent);
          inProgress[key].once('error', handleErrorEvent);
          return reject("build in progress");
        }

        // lookup in the cache
        return q.promisify(c.aliases.get, c.aliases)(pkg).
        then(function (result) {
            log.info("cache hit for " + key);
            resolve(result);
        }).catch(function(err){
            // Set up the EE
            inProgress[key] = new EventEmitter();
    
            // to prevent crashes from 'unhandled error' exceptions
            inProgress[key].on('error', function noop() {});

            return buildPkg();
        });

        function handleBundleEvent(res) {
          resolve(res);
          inProgress[key].removeListener('error', handleErrorEvent);
          cleanupInProgress();
        }

        function handleErrorEvent(err) {
          reject(err);
          inProgress[key].removeListener('bundle', handleBundleEvent);
          cleanupInProgress();
        }

        function cleanupInProgress() {
          if (!(
              inProgress[key].listeners('error').length +
              inProgress[key].listeners('bundle').length
            )) {
            destroyInProgress();
          }
        }

        function destroyInProgress() {
          inProgress[key] = undefined;
        }

        function buildPkg() {

          var opts;

          log.info('preparing `' + pkg.name + '`...');
          return buildEnv({
            root: moduleName,
            log: log
          }).then(function(env) {
            log.info('installing `' + pkg.name + '`...');
            opts = {
              pkg: pkg,
              env: env,
            };
            return install(opts);
          }).then(function() {
            log.info('about to parcelify `' + pkg.name + '`...');
            return parcelify(opts);
          }).then(function(bundle) {
            log.info('bundler: successfully parcelified `' + moduleName + '@' + version + '`.');

            c.statuses.put(pkg, {
              ok: true
            });

            inProgress[key].emit('bundle', bundle);
            destroyInProgress();

            var dbObj = {
              status: 200,
              bundle: bundle
            };
            c.aliases.put(pkg, dbObj, function noop() {});

            return new q.Promise(function(res, rej) {
              return opts.env.teardown().then(function() {
                resolve(dbObj);
              });
            });
          }).catch(function(err) {
            handleError(err);
            return true;
          }).done();

          function handleError(e) {
            var err = {};
            if (e instanceof Error) {
              err.stack = e.stack;
              err.message = e.message;
              err.content = e.content;
            } else {
              err = e;
            }

            if (typeof opts !== "undefined" && opts.env in opts) {
              err.dirPath = opts.env.dirPath;
            }

            inProgress[key].emit('error', err);
            destroyInProgress();

            //c.statuses.db.put(pkg, {
            c.aliases.put(pkg, {
              status: 500,
              error: err
            }, function noop() {
              return reject(err);
            });

          }

        };
      });
    }
  };
  _bundle.cache = c;

  return _bundle;
};
