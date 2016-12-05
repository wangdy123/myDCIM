var express = require('express');
var hbs = require('hbs');

var app = express();
app.set('views', ['./uitest/templates','./account/templates','./account/public' ]);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

module.exports = app;