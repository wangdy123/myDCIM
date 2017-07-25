var express = require('express');
var db = require('dcim-db');
var cache = require('./ssid_cache');
var util = require("dcim-util");
var accountRights = require('dcim-config').accountRights;

module.exports.checkUserPassword = function(req, res, password, cbk) {
	module.exports.getCurrentUser(req, res, function(err, user) {
		if (err) {
			cbk(err);
		} else {
			var sql = 'select ID,LOGIN_PASSWORD ' + 'from portal.ACCOUNT  where ID=? and ENABLE=1 ';
			db.pool.query(sql, [ user.ID ], function(error, accounts, fields) {
				if (error) {
					cbk(error);
					return;
				}
				if (accounts.length < 1) {
					cbk("not found,account id:" + user.ID);
				} else {
					if (util.transToSha1(password) === accounts[0].LOGIN_PASSWORD) {
						cbk(null,user);
					} else {
						cbk('wrong password');
					}
				}
			});
		}
	});
};

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
};

module.exports.getRoleByAccountId = function(pool, accountId, cbk) {
	var sql = 'select r.ID as ROLE_ID,r.NAME from portal.ROLE r join portal.ACCOUNT_ROLE a on a.ROLE_ID=r.ID '
			+ 'where a.ACCOUNT_ID=?';
	pool.query(sql, [ accountId ], cbk);
};
module.exports.getaccountById = function(pool, accountId, cbk) {
	var sql = 'select a.ID,p.NAME,p.JOB_NUMBER,a.ACCOUNT,a.IS_GOD,a.HOME_PAGE,p.E_MAIL,p.TEL,p.ENABLE as PERSONNEL_ENABLE,'
			+ 'a.ENABLE,a.PASSWORD_TIME,a.DEFAULT_THEME,p.CREATE_TIME,p.DEPARTMENT,d.NAME as DEPARTMENT_NAME '
			+ 'from portal.ACCOUNT a join portal.PERSONNEL_CFG p on a.ID=p.ID '
			+ 'join portal.DEPARTMENT d on p.DEPARTMENT=d.ID where a.ID=?';
	pool.query(sql, [ accountId ], function(error, accounts, fields) {
		if (error) {
			cbk(error);
			return;
		}
		if (accounts.length < 1) {
			cbk("not found,account id:" + accountId);
		} else {
			module.exports.getRoleByAccountId(pool, accountId, function(err, roles) {
				if (err) {
					cbk(error);
					return;
				}
				accounts[0].roles = roles;
				cbk(null, accounts[0]);
			});
		}
	});
};

function getaccountByNamePassword(pool, name, password, cbk) {
	var sql = 'select a.ID,p.NAME,p.JOB_NUMBER,a.ACCOUNT,a.IS_GOD,a.HOME_PAGE,p.E_MAIL,p.TEL,p.ENABLE as PERSONNEL_ENABLE,'
			+ 'a.ENABLE,a.PASSWORD_TIME,a.DEFAULT_THEME,p.CREATE_TIME,p.DEPARTMENT,d.NAME as DEPARTMENT_NAME '
			+ 'from portal.ACCOUNT a join portal.PERSONNEL_CFG p on a.ID=p.ID '
			+ 'join portal.DEPARTMENT d on p.DEPARTMENT=d.ID where a.ACCOUNT=? and a.LOGIN_PASSWORD=?';
	pool.query(sql, [ name, util.transToSha1(password) ], function(error, accounts, fields) {
		if (error) {
			cbk(error);
			return;
		}
		if (accounts.length < 1) {
			cbk("not found user:" + name + ",password:" + password);
		} else {
			module.exports.getRoleByAccountId(pool, accounts[0].ID, function(err, roles) {
				if (err) {
					cbk(error);
					return;
				}
				accounts[0].roles = roles;
				cbk(null, accounts[0]);
			});
		}
	});
}
function findRightById(rightId) {
	for (var i = 0; i < accountRights.rights.length; i++) {
		if (accountRights.rights[i].id === rightId) {
			return accountRights.rights[i];
		}
	}
}

function getAccountRight(pool, accountId, cbk) {
	var sql = 'select a.ACCOUNT_ID,a.ROLE_ID,rr.RIGHT_ID from portal.ACCOUNT_ROLE a join portal.ROLE r on a.ROLE_ID=r.ID '
			+ 'join portal.ROLE_RIGHT rr on rr.ROLE_ID=r.ID where a.ACCOUNT_ID=?';
	pool.query(sql, [ accountId ], function(error, rows, fields) {
		if (error) {
			cbk(error);
		} else {
			var functions = accountRights.baseFunctions;
			var menus = accountRights.baseMenus;
			var rights = [];
			for (var i = 0; i < rows.length; i++) {
				var right = findRightById(rows[i].RIGHT_ID);
				if (right) {
					if (right.functions) {
						functions = functions.concat(right.functions);
					}
					if (right.menus) {
						menus = menus.concat(right.menus);
					}
					rights.push({
						id : right.id,
						name : right.name
					});
				}
			}
			cbk(null, {
				functions : functions,
				menus : menus,
				rights : rights
			});
		}
	});
};

function checkAuth(account, url, method) {
	if (account.IS_GOD) {
		return true;
	}
	if (!account.right) {
		account.right = {};
	}
	for (var i = 0; i < account.right.functions.length; i++) {
		var func = account.right.functions[i];
		if (func.methods.indexOf(method.toLowerCase()) >= 0 && url.match(func.regexp)) {
			return true;
		}
	}
	return false;
}

module.exports.initCheckLogin = function(app) {
	app.use(function(req, res, next) {
		module.exports.getCurrentUser(req, res, function(err, result) {
			if (err) {
				res.status(401).send(JSON.stringify(err));
			} else {
				if (checkAuth(result, req.url, req.method)) {
					next();
				} else {
					logger.error("user:" + result.NAME + ",url:" + req.url + ",method:" + req.method + " not allow");
					res.status(403).send(JSON.stringify("无操作权限，请联系系统管理员或重新登录"));
				}
			}
		});
	});
};

module.exports.initLogin = function(app) {
	app.post('/login', function(req, res) {
		getaccountByNamePassword(db.pool, req.body.username, req.body.password, function(error, account) {
			if (error) {
				logger.error(error);
				res.status(400).send("用户帐号或密码不正确");
				return;
			}
			if (!account.ENABLE) {
				res.status(400).send("用户未启用");
				return;
			}
			getAccountRight(db.pool, account.ID, function(error, right) {
				if (error) {
					logger.error(error);
					res.status(400).send("登录出错，请重试");
					return;
				}
				account.right = right;
				var ssid = require('node-uuid').v1();
				cache.set(ssid, account, function(err, result) {
					if (error) {
						logger.error(error);
						res.status(400).send("登录出错，请重试");
						return;
					}
					res.cookie('ssid', ssid);
					res.send("登录成功");
				});
			});
		});
	});

	app.get('/logout', function(req, res) {
		cache.remove(req.cookies.ssid, function(err, result) {
			res.clearCookie('ssid');
			res.redirect(req.headers.referer ? req.headers.referer : "/");
		});
	});

	app.get('/currentAccount', function(req, res) {
		module.exports.getCurrentUser(req, res, function(err, account) {
			if (err) {
				res.status(400).send(err);
			} else {
				res.send(account);
			}
		});
	});
};