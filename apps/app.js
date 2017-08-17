var express = require('express');
var app = express();
var config = require('dcim-config').config;
var hbs = require('hbs');
app.set('views', [ __dirname + '/templates', './templates' ]);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);
app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;
