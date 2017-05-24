var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var config = require('dcim-config');

var path = require('path');
var fs = require('fs');
var privateKey = fs.readFileSync('ca/private.pem', 'utf8');

app.get('/screenData/:id', function(req, res) {
	var fileName = path.join(process.cwd(), 'screenData', req.params.id + '.json');
	var screenData = fs.readFileSync(fileName, 'utf8');
	//var screenData = require(fileName);
	res.send(JSON.parse(screenData));
});
