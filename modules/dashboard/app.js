var express = require('express');
var hbs = require('hbs');

var app = express();
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

var config = require('../base').config;
app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;
