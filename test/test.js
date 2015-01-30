var winston = require("winston");

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

var bundler = require("./bundler");
var bundle = bundler({
  log: logger,
  db: "./cdn.db"
});

bundle("menu-builder").then(function() {
  console.log("done", arguments);
});
