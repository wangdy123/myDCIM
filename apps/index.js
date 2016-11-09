var app = require('./app');

app.get('/:path', function(req, res) {
	try {
		var config = require('./baseinfo').getHtmlBaseInfo(req, res);
		config.title = req.params.path;
		config.url="/monitor.html";
		config.border=false;
		res.render('monitor', config);
	} catch (e) {
		console.log(e);
	}
});

//require('./bar');
//require('./dashboard');
//require('./monitor');

module.exports = app;