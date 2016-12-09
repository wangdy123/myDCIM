var app = require('./app');

app.get('/region-nav.html', function(req, res) {
	res.render('region/region-nav.html');
});

module.exports = app;