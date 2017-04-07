require('dcim-logger');
var express = require('express');

var app = express();

var hbs = require('hbs');
app.set('views', 'templates');
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

var config = require('dcim-config').config;

app.use(require('serve-favicon')(require('path').join(__dirname, 'public', 'favicon.ico')));
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(require('cookie-parser')());

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

app.get('/static.js', require('./static'));

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};

app.use(function(req, res, next) {
	logger.accessLog(getClientIp(req)+" "+req.url);
	next();
});

require('dcim-permissions').initLogin(app, "");

app.get('/', function(req, res) {
	res.redirect("index.html?page=dashboard/dashboard.html");
});

app.use('', require("./apps"));

require('dcim-permissions').initCheckLogin(app);

app.use('', require('./uitest'));

for ( var module in config.modules) {
	var path = require('path').join(__dirname, "modules", module);
	var url = config.modules[module];
	app.use(url, require(path));
	logger.debug(url);
}

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	logger.warn("not found: " + req.url);
	next(err);
});

app.use(function(err, req, res) {
	var resBody = {
		status : err.status || 500,
		message : err.message
	};
	err.status = err.status || 500;
	res.status(err.status || 500);
	err.stack = err.stack || "";
	var meta = new Date() + ' ' + req.url + '\n';
	logger.error(meta + err.stack + '\n');
	res.send(resBody);
});

app.listen(config.httpPort);
logger.log('Express server listening on port ' + config.httpPort);
