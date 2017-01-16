var express = require('express');
var hbs = require('hbs');

var app = express();
app.set('views', ['./uitest/templates','./modules/apps/templates','./modules/apps/public' ]);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);
app.use(express.static('./modules/apps/public'));
module.exports = app;
