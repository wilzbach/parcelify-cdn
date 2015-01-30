var exec = require('child_process').exec;
var q = require("bluebird");

module.exports = function(opts) {

  var pkgVersion = opts.pkg.name + '@' + opts.pkg.version;
  var env = opts.env;
  var log = env.log;

  return new q.Promise(function(resolve, reject) {
    env.exec("npm install " + pkgVersion, function(err, stdout, stderr) {
      if (err) {
        return reject(err);
      }
      log.info(pkgVersion + " installed successfully");
      resolve();
    });
  });
};
