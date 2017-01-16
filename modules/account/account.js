var app = require('./app');

var db =require('../base').db;

function getaccountById(pool, accountId, cbk) {
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

app.get('/themes', function(req, res) {
	var config = require('../config');
	res.send(config.themes);
});

app.get('/personnelsNotAccount', function(req, res) {
	var sql = 'select p.ID,p.NAME,p.JOB_NUMBER,p.E_MAIL,p.TEL,p.ENABLE,p.CREATE_TIME,p.DEPARTMENT,d.NAME as DEPARTMENT_NAME '
			+ 'from portal.PERSONNEL_CFG p join portal.DEPARTMENT d on p.DEPARTMENT=d.ID where p.DEPARTMENT=? '
			+ 'and p.ID not in (select ID from portal.ACCOUNT)';
	db.pool.query(sql, [ req.query.departmentId ], function(error, personnels, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
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
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(accounts);
		}
	});
});

app.get('/accounts/:accountId', function(req, res) {
	getaccountById(db.pool, req.params.accountId, function(error, role) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(role);
		}
	});
});

app.post('/accounts', function(req, res) {
	var account = req.body;
	var chain = db.transaction(function(chain) {
		var sql = 'INSERT INTO portal.ACCOUNT(ID,ACCOUNT,ROLE_ID,DEFAULT_THEME,'
				+ 'LOGIN_PASSWORD,PASSWORD_TIME,ENABLE)values(?,?,?,?,?,sysdate(),1)';
		chain.query(sql,
				[ account.ID, account.ACCOUNT, account.ROLE_ID, account.DEFAULT_THEME, account.LOGIN_PASSWORD ]);
	}, function() {
		res.status(201).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

app.put('/accounts', function(req, res) {
	var account = req.body;
	var chain = db.transaction(function(chain) {
		chain.query('update portal.ACCOUNT set ROLE_ID=?,DEFAULT_THEME=? where ID=?', [ account.ROLE_ID,
				account.DEFAULT_THEME, account.ID ]);
	}, function() {
		res.status(204).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});
app.put('/accounts/enable/:accountId', function(req, res) {
	var personnel = req.body;
	var chain = db.transaction(function(chain) {
		var sql = 'update portal.ACCOUNT set ENABLE=? where ID=?';
		chain.query(sql, [ personnel.ENABLE, req.params.accountId ]);
	}, function() {
		res.status(204).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

module.exports = app;
