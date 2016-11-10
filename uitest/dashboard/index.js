var app = require('./app');
var dashboard = require('../../config').dashboard;

app.get('/dashboard.html', function(req, res) {
	res.render('dashboard', dashboard);
});

module.exports = app;