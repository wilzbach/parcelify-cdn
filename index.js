#!/usr/bin/env node

var express = require('express');
var compress = require('compression');
var responseTime = require('response-time');
var winston = require('winston');
var expressWinston = require('express-winston');
var wares = require("./lib/middlewares");

var port = process.env.PORT || process.argv[2] || 3000;

var app = express();

// activate Express middlewares 
app.use(compress());
app.disable('x-powered-by');
app.use(wares.cors);
app.use(wares.poweredBy);
app.use(wares.cacheControl);
app.use(responseTime());


// log all requests
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: true
    })
  ],
  meta: false,
  msg: "HTTP {{req.method}} {{res.statusCode}} {{req.url}}",
  colorStatus: true
}));

// logging
var transports = {
  transports: [
    new(winston.transports.Console)({
      colorize: true,
      prettyPrint: false
    }),
    new(winston.transports.File)({
      filename: 'logs/main.log'
    })
  ]
};
var logger = new(winston.Logger)(transports);

// load modules
var single = require("./single");
var bundler = require("./bundler/index");
var bundle = bundler({
  log: logger,
  db: "./cdn.db"
});
single(app, bundle);
app.use(expressWinston.logger(transports));

var server = app.listen(port, function() {
  console.log('Listening on port %d', server.address().port);
});
