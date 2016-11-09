var app = require('./app');

app.get('/bar.html', function(req, res) {
	try {
		var config = require('./baseinfo').getHtmlBaseInfo(req, res);
		config.title = "柱状图";
		res.render('bar', config);
	} catch (e) {
		console.log(e);
	}
});

module.exports = app;