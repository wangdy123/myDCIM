var proxy = require('express-http-proxy');
 var app = require('express')();
 app.use('', proxy('localhost/'));

module.exports = app;
