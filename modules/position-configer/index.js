var config = require('dcim-config');

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));


module.exports = app;