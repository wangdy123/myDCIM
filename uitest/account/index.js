var app = require('./app');

app.get('/role.html', function(req, res) {
	res.render('role/role-wokspace.html');
});

app.get('/account.html', function(req, res) {
	res.render('account/account-wokspace.html');
});
app.get('/department.html', function(req, res) {
	res.render('department/department-wokspace.html');
});
app.get('/personnel.html', function(req, res) {
	res.render('personnel/personnel-wokspace.html');
});

module.exports = app;