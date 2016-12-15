var express = require('express');
var app = express();

app.use('', require('./dashboard'));
app.use('', require('./account'));
app.use('', require('./navigation'));
app.use('', require('./configer'));
app.use('', require('./monitor'));

module.exports = app;