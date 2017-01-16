var express = require('express');
var hbs = require('hbs');

var app = express();
app.set('views', ['./uitest/templates','./modules/configer/templates','./modules/configer/public' ]);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);
app.use(express.static('./modules/configer/public'));
module.exports = app;
