var express = require('express');
var hbs = require('hbs');
var test_conf = require(require('path').join(__dirname, 'conf.json'));

var app = express();
var templatePaths = [ './uitest/templates' ];
for (var i = 0; i < test_conf.length; i++) {
	if (test_conf[i].publicPath) {
		templatePaths.push(test_conf[i].publicPath);
	}
}

app.set('views', templatePaths);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);
app.use(express.static(__dirname + '/public'));

function initTest(test) {
	//logger.log(test);
	app.get("/" + test.url, function(req, res) {
		res.render(test.target, test);
	});
}
for (var i = 0; i < test_conf.length; i++) {
	initTest(test_conf[i]);
}

app.get('/uitests', function(req, res) {
	res.send(test_conf);
});

app.get('/uitest.html', function(req, res) {
	res.render('ui-test-home');
});

module.exports = app;