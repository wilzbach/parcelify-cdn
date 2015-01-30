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
    bundle.forEach(function(b){
      res.write(b);
    });
    res.end();
  });
  builder.catch(function(err) {
    res.setHeader('content-type', 'text/plain');
    res.statusCode = 500;
    res.write(JSON.stringify(err));
    res.end();
  });
}
