var app = require('./app');

app.get('/region-wokspace.html', function(req, res) {
	res.render('object/region/region-wokspace.html');
});
app.get('/station-base-wokspace.html', function(req, res) {
	res.render('object/station-base/station-base-wokspace.html');
});
app.get('/building-wokspace.html', function(req, res) {
	res.render('object/building/building-wokspace.html');
});
app.get('/floor-wokspace.html', function(req, res) {
	res.render('object/floor/floor-wokspace.html');
});
app.get('/room-wokspace.html', function(req, res) {
	res.render('object/room/room-wokspace.html');
});
module.exports = app;