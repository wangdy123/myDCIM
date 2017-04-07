var app = require('./app');
var db = require('dcim-db');
var util = require("dcim-util");
var permissions = require('dcim-permissions');

var config = require('dcim-config');
app.get('/themes', function(req, res) {
	res.send(config.themes);
});


app.get('/personnelsNotAccount', function(req, res) {
	var sql = 'select p.ID,p.NAME,p.JOB_NUMBER,p.E_MAIL,p.TEL,p.ENABLE,p.CREATE_TIME,p.DEPARTMENT,'
			+ 'd.NAME as DEPARTMENT_NAME from portal.PERSONNEL_CFG p '
			+ 'join portal.DEPARTMENT d on p.DEPARTMENT=d.ID where p.DEPARTMENT=? '
			+ 'and p.ID not in (select ID from portal.ACCOUNT)';
	db.pool.query(sql, [ req.query.departmentId ], function(error, personnels, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(personnels);
		}
	});
});

app.get('/accounts', function(req, res) {
	var sql = 'select a.ID,p.NAME,p.JOB_NUMBER,a.ACCOUNT,p.E_MAIL,p.TEL,p.ENABLE as PERSONNEL_ENABLE,'
			+ 'a.ENABLE,a.DEFAULT_THEME,a.ROLE_ID,r.NAME as ROLE_NAME,p.CREATE_TIME,p.DEPARTMENT,'
			+ 'd.NAME as DEPARTMENT_NAME from portal.ACCOUNT a join portal.PERSONNEL_CFG p on a.ID=p.ID '
			+ 'join portal.ROLE r on a.ROLE_ID=r.ID ' + 'join portal.DEPARTMENT d on p.DEPARTMENT=d.ID';
	db.pool.query(sql, function(error, accounts, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(accounts);
		}
	});
});

app.get('/accounts/:accountId', function(req, res) {
	permissions.getaccountById(db.pool, req.params.accountId, function(error, role) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(role);
		}
	});
});

app.post('/accounts', function(req, res) {
	var account = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'INSERT INTO portal.ACCOUNT(ID,ACCOUNT,ROLE_ID,DEFAULT_THEME,'
					+ 'LOGIN_PASSWORD,PASSWORD_TIME,ENABLE)values(?,?,?,?,?,sysdate(),1)';
			connection.query(sql, [ account.ID, account.ACCOUNT, account.ROLE_ID, account.DEFAULT_THEME,
					account.LOGIN_PASSWORD ], function(err, result) {
				callback(err);
			});
		} ];
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(201).end();
		}
	});
});

app.put('/accounts', function(req, res) {
	var account = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'update portal.ACCOUNT set ROLE_ID=?,DEFAULT_THEME=? where ID=?';
			connection.query(sql, [ account.ROLE_ID, account.DEFAULT_THEME, account.ID ], function(err, result) {
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
app.put('/accounts/enable/:accountId', function(req, res) {
	var account = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'update portal.ACCOUNT set ENABLE=? where ID=?';
			connection.query(sql, [ account.ENABLE, req.params.accountId ], function(err, result) {
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

module.exports = app;
