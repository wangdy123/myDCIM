var express = require('express');
var app = express();

var hbs = require('hbs');
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

var db = require('../base').db;
var config = require('../base').config;
app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

function getTheme(user, req, cbk) {
	if (req.cookies.theme) {
		cbk(req.cookies.theme);
	} else {
		cbk(user.DEFAULT_THEME);
	}
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
				menu.childMenus[j].class="panel-header";
				body.htmlFileUrl = menu.childMenus[j].htmlFileUrl;
				console.log('htmlFileUrl: ' + menu.childMenus[j].htmlFileUrl);
				body.border = false;
				body.scripts=menu.childMenus[j].scripts;
				body.links=menu.childMenus[j].links;
			}else{
				menu.childMenus[j].class="";
			}
		}
	}
	body.menus = menus;
}

app.get('/:path', function(req, res) {
	require('../base').permissions.getCurrentDetailUser(req, res, function(error, user) {
		if (error) {
			res.writeHead(401, {
				'Content-Type' : 'text/plain'
			});
			res.end(JSON.stringify(error));
		} else {
			getTheme(user, req, function(theme) {
				var body = {};
				body.userName = user.NAME;
				body.theme = theme;
				body.themes = config.themes;
				setMenu(body, config.menus, req.params.path);
				res.render('index', body);
			});
		}
	});
});

module.exports = app;