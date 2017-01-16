var express = require('express');
var hbs = require('hbs');

var app = express();
app.set('views', ['./uitest/templates','./modules/account/templates','./modules/account/public' ]);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

app.use(express.static('./modules/account/public'));
module.exports = app;
