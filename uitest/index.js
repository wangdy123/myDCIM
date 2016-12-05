var express = require('express');
var app = express();

app.use('', require('./dashboard'));
app.use('', require('./account'));
module.exports = app;