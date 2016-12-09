var app = require('./app');

app.get('/region-wokspace.html', function(req, res) {
	res.render('region/region-wokspace.html');
});

module.exports = app;