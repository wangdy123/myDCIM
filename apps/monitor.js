var app = require('./app');

app.get('/monitor.html', function(req, res) {
	try {
		var config = require('./baseinfo').getHtmlBaseInfo(req, res);
		config.title = "监控系统";
		config.url="/monitor.html";
		config.border=false;
		res.render('monitor', config);
	} catch (e) {
		console.log(e);
	}
});

module.exports = app;