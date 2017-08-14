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
			+ 'and p.ID not in (select ID from portal.ACCOUNT) and p.ENABLE=1';
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
	var sql = 'select a.ID,p.NAME,p.JOB_NUMBER,a.ACCOUNT,a.IS_GOD,p.E_MAIL,p.TEL,'
			+ 'p.ENABLE as PERSONNEL_ENABLE,a.ENABLE,a.PASSWORD_TIME,a.DEFAULT_THEME,'
			+ 'a.HOME_PAGE,p.CREATE_TIME,p.DEPARTMENT,d.NAME as DEPARTMENT_NAME '
			+ 'from portal.ACCOUNT a join portal.PERSONNEL_CFG p on a.ID=p.ID '
			+ 'join portal.DEPARTMENT d on p.DEPARTMENT=d.ID';
	db.pool.query(sql, function(error, accounts, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
			return;
		}
		var sql = 'select a.ACCOUNT_ID,r.ID as ROLE_ID,r.NAME '
				+ 'from portal.ROLE r join portal.ACCOUNT_ROLE a on a.ROLE_ID=r.ID ';
		db.pool.query(sql, function(err, roles) {
			if (err) {
				logger.error(error);
				res.status(500).send(error);
				return;
			}

			for (var i = 0; i < accounts.length; i++) {
				accounts[i].roles = [];
				for (var j = 0; j < roles.length; j++) {
					if (roles[j].ACCOUNT_ID === accounts[i].ID) {
						accounts[i].roles.push(roles[j]);
					}
				}
			}
			res.send(accounts);
		});
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

function createAcountRoleTask(connection, ACCOUNT_ID, accountRole) {
	return function(callback) {
		var sql = 'INSERT INTO portal.ACCOUNT_ROLE(ACCOUNT_ID,ROLE_ID)values(?,?)';
		connection.query(sql, [ ACCOUNT_ID, accountRole.ROLE_ID ], function(err, result) {
			callback(err);
		});
	};
}

function createAcountRoleTasks(connection, tasks, ACCOUNT_ID, accountRoles) {
	for (var i = 0; i < accountRoles.length; i++) {
		tasks.push(createAcountRoleTask(connection, ACCOUNT_ID, accountRoles[i]));
	}
}

app.post('/accounts', function(req, res) {
	var account = req.body;
	db.doTransaction(function(connection) {
		var tasks = [ function(callback) {
			var sql = 'INSERT INTO portal.ACCOUNT(ID,ACCOUNT,IS_GOD,DEFAULT_THEME,'
					+ 'LOGIN_PASSWORD,PASSWORD_TIME,ENABLE,HOME_PAGE)values(?,?,0,?,?,sysdate(),1,?)';
			connection.query(sql, [ account.ID, account.ACCOUNT, account.DEFAULT_THEME,
					util.transToSha1(account.LOGIN_PASSWORD), account.HOME_PAGE ], function(err, result) {
				callback(err);
			});
		} ];

		createAcountRoleTasks(connection, tasks, account.ID, account.roles);
		return tasks;
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
		var tasks = [ function(callback) {
			var sql = 'update portal.ACCOUNT set DEFAULT_THEME=?,HOME_PAGE=? where ID=?';
			connection.query(sql, [ account.DEFAULT_THEME, account.HOME_PAGE, account.ID ], function(err, result) {
				callback(err);
			});
		}, function(callback) {
			var sql = 'delete from portal.ACCOUNT_ROLE where ACCOUNT_ID=?';
			connection.query(sql, [ account.ID ], function(err, result) {
				callback(err);
			});
		} ];
		createAcountRoleTasks(connection, tasks, account.ID, account.roles);
		return tasks;
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
