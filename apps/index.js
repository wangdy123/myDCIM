var express = require('express');
var app = express();
var config = require('dcim-config');
var db = require('dcim-db');
var permissions = require('dcim-permissions');
var util = require("dcim-util");

var hbs = require('hbs');
app.set('views', [ __dirname + '/templates', './templates' ]);
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
		body.url = path;
		body.border = false;
		for (var j = 0; j < menu.childMenus.length; j++) {
			if (menu.childMenus[j].url === path) {
				menu.selected = true;
				body.title = menu.childMenus[j].title;
				menu.childMenus[j].class = "panel-header";
				body.border = menu.childMenus[j].border;
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
			return;
		}
		db.doTransaction(function(connection) {
			return [
					function(callback) {
						var selectSql = 'select LOGIN_PASSWORD from  portal.ACCOUNT where ID=?';
						connection.query(selectSql, [ user.ID ], function(err, result) {
							if (err) {
								callback(err);
								return;
							}
							if (result.length < 1
									|| result[0].LOGIN_PASSWORD !== util.transToSha1(password.OLD_PASSWORD)) {
								callback("口令错误");
							} else {
								callback();
							}
						});
					},
					function(callback) {
						var sql = 'update portal.ACCOUNT set LOGIN_PASSWORD=?,PASSWORD_TIME=sysdate() where ID=?';
						connection.query(sql, [ util.transToSha1(password.NEW_PASSWORD), user.ID ], function(err,
								result) {
							callback(err);
						});
					},
					function(callback) {
						var sql = 'insert into portal.ACCOUNT_PASSWORD_LOG(ACCOUNT_ID,CHANGE_TIME,'
								+ 'NEW_PASSWORD,OLD_PASSWORD)values(?,sysdate(),?,?)';
						var oldPassword = util.transToSha1(password.OLD_PASSWORD);
						var newPassword = util.transToSha1(password.NEW_PASSWORD);
						var params = [ user.ID, oldPassword, newPassword ];
						connection.query(sql, params, function(err, result) {
							callback(err);
						});
					} ];
		}, function(error, result) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.status(204).end();
			}
		});
	});
});

app.use(function(req, res, next) {
	permissions.getCurrentUser(req, res, function(error, user) {
		if (error) {
			logger.error(error);
			res.render('login', {});
		} else {
			next();
		}
	});
});

app.get('/index.html', function(req, res) {
	permissions.getCurrentDetailUser(req, res, function(error, user) {
		if (error) {
			logger.error(error);
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