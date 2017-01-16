var express = require('express');
var app = express();

app.use('/dashboard', require('./dashboard'));
app.use('/account', require('./account'));
app.use('/navigation', require('./navigation'));
app.use('/configer', require('./configer'));
app.use('/monitor', require('./monitor'));
app.use('/apps', require('./apps'));

module.exports = app;