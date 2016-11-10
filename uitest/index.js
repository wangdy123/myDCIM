var express = require('express');
var app = express();

app.use('', require('./dashboard'));
module.exports = app;