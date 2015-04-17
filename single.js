var q = require("bluebird");

module.exports = function(app, bundle) {
  app.get('/bundle/:name', singular(bundle));
  app.get('/debug-bundle/:name', singular(bundle, {
    debug: true
  }));
};

function singular(bundle, opts) {
  opts = opts || {};
  return function(req, res) {
    getParams(opts, req);
    serveBundle(res, bundle(opts));
  };
}

function getParams(opts, req) {
  opts = opts || {};
  var t = req.params.name.split('@'),
    name = t.shift(),
    version,
    subfile = name.split('/');

  if (t.length) {
    version = t.shift();
  } else {
    version = 'latest';
  }

  if (subfile.length > 1) {
    name = subfile.shift();
    subfile = subfile.join('/');
    o.subfile = subfile;
  }

  opts.name = name;
  opts.version = version;
}

function serveBundle(res, builder) {
  builder.then(function(bundle) {
    res.setHeader('content-type', 'text/css');
    for (var i = 0; i < bundle.length; i++) {
      var b = bundle[i];
      if (b != undefined) {
        if (b.status === 200) {
          res.write(b.bundle);
        } else {
          return q.reject(b);
        }
      }
    }
    res.end();
  }).catch(function(err) {
    res.setHeader('content-type', 'text/plain');
    res.statusCode = 500;
    if (!!err.error) {
      err = err.error;
    }
    if (!!err.stack) {
      //res.write("MSG: " + err.message + "\n");
      if (!!err.content) {
        res.write(err.content);
      } else {
        res.write(err.stack);
      }
    } else {
      res.write(JSON.stringify(err));
    }
    res.end();
  });
}
