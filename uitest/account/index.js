var app = require('./app');

app.get('/role.html', function(req, res) {
	res.render('role-wokspace.html');
});

app.get('/account.html', function(req, res) {
	res.render('account-wokspace.html');
});
app.get('/department.html', function(req, res) {
	res.render('department-wokspace.html');
});
app.get('/personnel.html', function(req, res) {
	res.render('personnel-wokspace.html');
});

module.exports = app;