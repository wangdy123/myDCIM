var express = require('express');
var app = express();

var hbs = require('hbs');
app.set('views', [ __dirname + '/templates', __dirname + '/../templates' ]);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

var config = require('../config');
app.use(express.static(__dirname + '/public', {
	maxAge : config.config.fileMaxAge * 3600 * 24 * 1000
}));

function getTheme(user, req, cbk) {
	if (req.cookies.theme) {
		cbk(req.cookies.theme);
	} else {
		cbk(user.DEFAULT_THEME);
	}
};

function setMenu(body, menus, path) {
	for (var i = 0; i < menus.length; i++) {
		var menu = menus[i];
		menu.selected = false;
		for (var j = 0; j < menu.childMenus.length; j++) {
			if (menu.childMenus[j].url === path) {
				menu.selected = true;
				body.title = menu.childMenus[j].title;
				menu.childMenus[j].class = "panel-header";
				body.url = menu.childMenus[j].url;
				body.border = false;
				body.scripts = menu.childMenus[j].scripts;
				body.links = menu.childMenus[j].links;
			} else {
				menu.childMenus[j].class = "";
			}
		}
	}
	body.menus = menus;
}

app.use(function(req, res, next) {
	require('../permissions').getCurrentUser(req, res, function(error, user) {
		if (error) {
			console.log(error);
			res.render('login', {});
		} else {
			next();
		}
	});
});

app.get('/index.html', function(req, res) {
	require('../permissions').getCurrentDetailUser(req, res, function(error, user) {
		if (error) {
			console.log(error);
			res.render('login', {});
		} else {
			getTheme(user, req, function(theme) {
				var body = {};
				body.userName = user.NAME;
				body.theme = theme;
				setMenu(body, config.menus, req.query.page);
				res.render('index', body);
			});
		}
	});
});

module.exports = app;