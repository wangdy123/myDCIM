var express = require('express');
var hbs = require('hbs');

var app = express();
app.set('views', ['./uitest/templates','./modules/dashboard/templates']);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);
app.use(express.static('./modules/dashboard/public'));
module.exports = app;
