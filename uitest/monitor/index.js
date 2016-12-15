var app = require('./app');

app.get('/map.html', function(req, res) {
	res.render('map.html');
});

app.get('/monitor.html', function(req, res) {
	res.render('monitor.html');
});


module.exports = app;