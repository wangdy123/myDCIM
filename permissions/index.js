var express = require('express');

var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json').toString());

module.exports.initCheckLogin = function(app) {
	app.use(require('cookie-session')({
		secret : 'ooosdosgfsdgff'
	}));
	app.use(function(req, res, next) {
		// console.log('session: ' + JSON.stringify(req.session));
		// console.log('session user: ' + JSON.stringify(req.session.user));
		console.log('cookies: ' + JSON.stringify(req.cookies));
		res.locals.user = req.session.user;
		next();
	});
};