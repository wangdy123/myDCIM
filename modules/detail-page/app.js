var express = require('express');

var app = express();
var config = require('dcim-config');
app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;
