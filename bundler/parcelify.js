var parcelify = require("parcelify");
var fs = require("fs");
var q = require("bluebird");
var join = require('path').join;
var browserify = require("browserify");

module.exports = function(opts) {
  var moduleName = opts.pkg.name;
  return new q.Promise(function(resolve, reject) {

    var cwd = join(opts.env.dirPath, "node_modules", moduleName);

    var config = require(join(cwd, "package.json"));
    var cssPath = join(cwd, "bundle.css");

    var b = browserify({
      basedir: cwd
    });

    b.add(join(cwd, config.main), {
      expose: moduleName
    });

    try {
      var p = parcelify(b, {
        bundles: {
          style: cssPath
        }
      });
      p.on("done", function() {
        fs.readFile(cssPath, "utf8", function(err, body) {
          resolve(body);
        });
      });
      p.on("error", function(err) {
        reject(err);
      });
    } catch (e) {
      reject(e);
    }
    b.bundle();
  });
};
