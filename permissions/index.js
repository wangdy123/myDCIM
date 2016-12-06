var express = require('express');
var db = require('../db');

module.exports.getCurrentUser = function(req, res, cbk) {
	cbk(null, {
		userId : 1,
		userName : "admin"
	});
}

function getaccountById(pool, accountId, cbk) {
	var sql = 'select a.ID,p.NAME,p.JOB_NUMBER,a.ACCOUNT,p.E_MAIL,p.TEL,p.ENABLE as PERSONNEL_ENABLE,'
			+ 'a.ENABLE,a.LOGIN_PASSWORD, a.PASSWORD_TIME,a.DEFAULT_THEME,a.ROLE_ID,r.NAME as ROLE_NAME,'
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
	getaccountById(db.pool, 1, cbk);
}

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