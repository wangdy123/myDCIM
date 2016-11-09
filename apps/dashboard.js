var app = require('./app');

app.get('/dashboard.html', function(req, res) {
	try {
		var config = require('./baseinfo').getHtmlBaseInfo(req, res);
		config.title = "DCIM主页";
		res.render('dashboard', config);
	} catch (e) {
		console.log(e);
	}
});

module.exports = app;