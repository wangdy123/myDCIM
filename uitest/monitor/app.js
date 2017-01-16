var express = require('express');
var hbs = require('hbs');

var app = express();
app.set('views', ['./uitest/templates','./modules/monitor/public' ]);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);
var config = require('../base').config;
app.use(express.static('./modules/monitor/public'));
module.exports = app;
