var q = require("bluebird");
var npmi = require('npmi');
var join = require('path').join;
var fs = q.promisifyAll(require("fs"));

module.exports = function(opts) {

  var env = opts.env;
  var log = env.log;

  var options = {
    name: opts.pkg.name, // your module name
    version: opts.pkg.version, // expected version [default: 'latest']
    path: opts.env.dirPath, // installation path [default: '.']
    forceInstall: false, // force install if set to true (even if already installed, it will do a reinstall) [default: false]
    npmLoad: { // npm.load(options, callback): this is the "options" given to npm.load()
      loglevel: 'error' // [default: {loglevel: 'silent'}]
    }
  };
  return new q.Promise(function(resolve, reject) {
    npmi(options, function(err, result) {
      if (err) {
        //if (err.code === npmi.LOAD_ERR) reject('npm load error');
        //else if (err.code === npmi.INSTALL_ERR){

        // dirty , hacky way to get the log messages
        logFile = join(options.path, "node_modules", options.name, "npm-debug.log");
        if (fs.existsSync(logFile)) {
          return fs.readFileAsync(logFile, {encoding: "utf8"}).then(function(content) {
            err.content = content;
            return reject(err);
          });
        } else {
          return reject(err);
        }
      }
      log.info(options.name + '@' + options.version + " installed successfully");
      resolve();
    });
  });
};
