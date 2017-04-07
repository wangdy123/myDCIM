var express = require('express');
var db = require('dcim-db');
var cache = require('./ssid_cache');
var util = require("dcim-util");

module.exports.getCurrentUser = function(req, res, cbk) {
	if (res.locals.user) {
		cbk(null, res.locals.user);
		return;
	}
	if (!req.cookies.ssid) {
		cbk("no ssid");
	} else {
		cache.get(req.cookies.ssid, function(err, user) {
			if (err) {
				cbk(err);
			} else {
				res.locals.user = user;
				cbk(null, user);
			}
		});
	}
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
	module.exports.getCurrentUser(req, res, function(err, u) {
		if (err) {
			cbk(err);
		} else {
			module.exports.getaccountById(db.pool, u.ID, cbk);
		}
	});
}

module.exports.initCheckLogin = function(app) {
	app.use(function(req, res, next) {
		module.exports.getCurrentUser(req, res, function(err, result) {
			if (err) {
				res.status(401).send(JSON.stringify(err));
			} else {
				next();
			}
		});
	});
};

module.exports.initLogin = function(app) {
	app.post('/login', function(req, res) {
		var sql = 'select a.ID,p.NAME,a.ACCOUNT,a.ROLE_ID from portal.ACCOUNT a '
				+ 'join portal.PERSONNEL_CFG p on a.ID=p.ID '
				+ 'where a.ACCOUNT=? and a.LOGIN_PASSWORD=? and a.ENABLE=1';
		db.pool.query(sql, [ req.body.username, util.transToSha1(req.body.password) ],
				function(error, accounts, fields) {
					var referer = req.headers.referer ? req.headers.referer : "/";
					if (error) {
						logger.error(error);
						res.status(400).send("登录出错，请重试！");
					} else {
						if (accounts.length < 1) {
							res.status(400).send("用户帐号或密码不正确");
						} else {
							var ssid = require('node-uuid').v1();
							cache.set(ssid, accounts[0], function(err, result) {
								res.cookie('ssid', ssid);
								res.redirect(req.headers.referer ? req.headers.referer : "/");
							});
						}
					}
				});
	});

	app.get('/logout', function(req, res) {
		cache.remove(req.cookies.ssid, function(err, result) {
			res.clearCookie('ssid');
			res.redirect(req.headers.referer ? req.headers.referer : "/");
		});
	});
};