var express = require('express');
var app = express();
var config = require('dcim-config');
var db = require('dcim-db');
var permissions = require('dcim-permissions');

var hbs = require('hbs');
app.set('views', [ __dirname + '/templates', __dirname + '/../templates' ]);
app.set('view engine', 'html');
app.engine('.html', hbs.__express);

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

app.put('/setPassword', function(req, res) {
	var password = req.body;
	permissions.getCurrentUser(req, res, function(error, user) {
		if (error) {
			res.status(401).send(error);
		} else {
			var chain = db.transaction(function(chain) {
				var selectSql = 'select LOGIN_PASSWORD from  portal.ACCOUNT where ID=?';
				chain.query(selectSql, [ user.ID ]).on('result', function(result) {
					if (result && result.LOGIN_PASSWORD !== password.OLD_PASSWORD) {
						res.status(400).send("口令错误");
					} else {
						var sql = 'update portal.ACCOUNT set LOGIN_PASSWORD=?,PASSWORD_TIME=sysdate() where ID=?';
						chain.query(sql, [ password.NEW_PASSWORD, user.ID ]);
					}
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				console.log(error);
				res.status(501).send(error);
			});
		}
	});
});

app.use(function(req, res, next) {
	permissions.getCurrentUser(req, res, function(error, user) {
		if (error) {
			console.log(error);
			res.render('login', {});
		} else {
			next();
		}
	});
});

app.get('/index.html', function(req, res) {
	permissions.getCurrentDetailUser(req, res, function(error, user) {
		if (error) {
			console.log(error);
			res.render('login', {});
		} else {
			getTheme(user, req, function(theme) {
				var body = {};
				body.userName = user.NAME;
				body.theme = theme;
				var page = req.query.page ? req.query.page : "dashboard/dashboard.html";
				setMenu(body, config.menus, page);
				res.render('index', body);
			});
		}
	});
});

module.exports = app;