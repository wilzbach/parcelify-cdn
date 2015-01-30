var parcelify = require("parcelify");
var fs = require("fs");
var q = require("bluebird");
var join = require('path').join;

module.exports = function(opts) {
  var moduleName = opts.pkg.name;
  return new q.Promise(function(resolve, reject) {

    var cwd = join(opts.env.dirPath, "node_modules", moduleName);

    var config = require(join(cwd, "package.json"));
    var cssPath = join(cwd, "bundle.css");

    var p = parcelify(join(cwd, config.main), {
      bundles: {
        style: cssPath
      }
    });
    p.on("done", function() {
      fs.readFile(cssPath, "utf8", function(err, body){
        resolve(body);
      });
    });
    p.on("error", function(err) {
      reject(err);
    });
  });
};
