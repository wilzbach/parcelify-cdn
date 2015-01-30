var q = require("bluebird");
var npmi = require('npmi');

module.exports = function(opts) {

  var env = opts.env;
  var log = env.log;

  var options = {
    name: opts.pkg.name, // your module name
    version: opts.pkg.version, // expected version [default: 'latest']
    path: opts.env.dirPath, // installation path [default: '.']
    forceInstall: false, // force install if set to true (even if already installed, it will do a reinstall) [default: false]
    npmLoad: { // npm.load(options, callback): this is the "options" given to npm.load()
      loglevel: 'silent' // [default: {loglevel: 'silent'}]
    }
  };
  return new q.Promise(function(resolve, reject) {
    npmi(options, function(err, result) {
      if (err) {
        if (err.code === npmi.LOAD_ERR) reject('npm load error');
        else if (err.code === npmi.INSTALL_ERR) reject('npm install error');
        return reject(err.message);
      }
      log.info(options.name + '@' + options.version + " installed successfully");
      resolve();
    });
  });
};
