var express = require('express');
var db = require('../db');
var cache = require('./ssid_cache');

module.exports.getCurrentUser = function(req, res, cbk) {
	cache.get(req.cookies.ssid, cbk);
}

module.exports.getaccountById = function(pool, accountId, cbk) {
	var sql = 'select a.ID,p.NAME,p.JOB_NUMBER,a.ACCOUNT,p.E_MAIL,p.TEL,p.ENABLE as PERSONNEL_ENABLE,'
			+ 'a.ENABLE,a.PASSWORD_TIME,a.DEFAULT_THEME,a.ROLE_ID,r.NAME as ROLE_NAME,'
			+ 'p.CREATE_TIME,p.DEPARTMENT,d.NAME as DEPARTMENT_NAME '
			+ 'from portal.ACCOUNT a join portal.PERSONNEL_CFG p on a.ID=p.ID '
			+ 'join portal.ROLE r on a.ROLE_ID=r.ID ' + 'join portal.DEPARTMENT d on p.DEPARTMENT=d.ID where a.ID=?';
	pool.query(sql, [ accountId ], function(error, accounts, fields) {
		if (error) {
			cbk(error);
		} else {
			if (accounts.length < 1) {
				cbk("not found,account id:" + accountId);
			} else {
				cbk(null, accounts[0]);
			}
		}
	});
}

module.exports.getCurrentDetailUser = function(req, res, cbk) {
	cache.get(req.cookies.ssid, function(err, result) {
		if (err) {
			cbk(err);
		} else {
			module.exports.getaccountById(db.pool, result.ID, cbk);
		}
	});
}

module.exports.initCheckLogin = function(app) {
	app.use(function(req, res, next) {
		console.log(req.method + " " + req.url);
		console.log('cookies: ' + JSON.stringify(req.cookies));
		if (!req.cookies.ssid) {
			res.status(401).send("not login");
		}
		cache.get(req.cookies.ssid, function(err, result) {
			if (err) {
				res.status(401).send(JSON.stringify(err));
			} else {
				next();
			}
		});
	});
};

module.exports.initLogin = function(app, path) {
	app.post(path + '/login', function(req, res) {
		var sql = 'select a.ID,p.NAME,a.ACCOUNT,a.ROLE_ID from portal.ACCOUNT a '
				+ 'join portal.PERSONNEL_CFG p on a.ID=p.ID '
				+ 'where a.ACCOUNT=? and a.LOGIN_PASSWORD=? and a.ENABLE=1';
		db.pool.query(sql, [ req.body.username, req.body.password ], function(error, accounts, fields) {
			if (error) {
				console.log(error);
				res.redirect("/");
			} else {
				if (accounts.length < 1) {
					console.log("not found in db");
					res.redirect("/");
				} else {
					var ssid = require('node-uuid').v1();
					cache.set(ssid, accounts[0], function(err, result) {
						if (err) {
							res.redirect("/");
						} else {
							res.cookie('ssid', ssid);
							res.redirect(req.referer ? req.referer : "/");
						}
					});
				}
			}
		});
	});

	app.get(path + '/logout', function(req, res) {
		cache.remove(req.cookies.ssid, function(err, result) {
			res.clearCookie('ssid');
			res.redirect(req.referer);
		});
	});
};