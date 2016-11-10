var express = require('express');
var app = express();

var hbs = require('hbs');
app.set('views', './templates/apps');
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

var db = require('../db');
var config = require('../config');

function getTheme(pool, userId, req, cbk) {
	cbk("default");
};
function setMenu(body, menus, path) {
	console.log('path: ' + path);
	for (var i = 0; i < menus.length; i++) {
		var menu = menus[i];
		menu.selected = false;
		for (var j = 0; j < menu.childMenus.length; j++) {
			if (menu.childMenus[j].url === path) {
				menu.selected = true;
				body.title = menu.childMenus[j].title;
				body.htmlFileUrl = menu.childMenus[j].htmlFileUrl;
				console.log('htmlFileUrl: ' + menu.childMenus[j].htmlFileUrl);
				body.border = false;
			}
		}
	}
	body.menus = menus;
}

app.get('/:path', function(req, res) {
	require('../permissions').getCurrentUser(req, res, function(error, user) {
		if (error) {
			response.writeHead(401, {
				'Content-Type' : 'text/plain'
			});
			response.end(JSON.stringify(error));
		} else {
			var pool = db.pool;
			getTheme(pool, user.userId, req, function(theme) {
				var body = {};
				body.userName = user.userName;
				body.theme = theme;
				body.themes = config.themes;
				setMenu(body, config.menus, req.params.path);
				res.render('index', body);
			});
		}
	});
});

module.exports = app;