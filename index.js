var express = require('express');
var app = express();

var hbs = require('hbs');
app.set('views', 'templates');
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

var config = require('./config').config;

app.use(require('serve-favicon')(require('path').join(__dirname, 'public', 'favicon.ico')));
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(require('cookie-parser')());

app.use(require('cookie-session')({
	secret : 'ooosdosgfsdgff'
}));

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));


app.get('/static.js', require('./static'));

require('./permissions').initLogin(app,"/DCIM");

app.get('/', function(req, res) {
	res.redirect("/DCIM/apps/monitor-dashboard.html");
});
app.use('/DCIM/apps', require("./apps"));

//require('./permissions').initCheckLogin(app);


/**
 * upload test
 */
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
app.post('/node',upload.single('avatar'), function(req, res) {
	var obj = req.body;
	console.log(obj);
	console.log(req.file);
	res.status(201).end();
});
//* /

app.use('/DCIM', require('./uitest'));

var fs = require('fs');
var dirList = fs.readdirSync("modules");
dirList.forEach(function(item) {
	var path = './modules/' + item;
	if (fs.statSync(path).isDirectory()) {
		app.use('/DCIM/' + item, require(path));
	}
});

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	console.warn("not found: " + req.url);
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
	console.log(meta + err.stack + '\n');
	res.send(resBody);
});

app.listen(config.httpPort);
console.log('Express server listening on port ' + config.httpPort);
