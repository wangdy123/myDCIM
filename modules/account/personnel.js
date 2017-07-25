var app = require('./app');
var db = require('dcim-db');

function getPersonnelById(pool, personnelId, cbk) {
	var sql = 'select p.ID,p.NAME,p.JOB_NUMBER,p.E_MAIL,p.TEL,p.ENABLE,p.CREATE_TIME,p.DEPARTMENT,d.NAME as DEPARTMENT_NAME '
			+ 'from portal.PERSONNEL_CFG p join portal.DEPARTMENT d on p.DEPARTMENT=d.ID where p.ID=?';
	pool.query(sql, [ personnelId ], function(error, personnels, fields) {
		if (error) {
			cbk(error);
		} else {
			if (personnels.length < 1) {
				cbk("not found,personnel id:" + personnelId);
			} else {
				cbk(null, personnels[0]);
			}
		}
	});
}

app.get('/personnels', function(req, res) {
	var sql = 'select p.ID,p.NAME,p.JOB_NUMBER,p.E_MAIL,p.TEL,p.ENABLE,p.CREATE_TIME,p.DEPARTMENT,'
			+ 'd.NAME as DEPARTMENT_NAME from portal.PERSONNEL_CFG p join portal.DEPARTMENT d on p.DEPARTMENT=d.ID';
	db.pool.query(sql, function(error, personnels, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(personnels);
		}
	});
});

app.get('/personnels/:personnelId', function(req, res) {
	getPersonnelById(db.pool, req.params.personnelId, function(error, personnel) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(personnel);
		}
	});
});

app.post('/personnels', function(req, res) {
	var personnel = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'INSERT INTO portal.PERSONNEL_CFG(NAME,JOB_NUMBER,E_MAIL,TEL,DEPARTMENT,ENABLE,CREATE_TIME) '
					+ 'values(?,?,?,?,?,1,sysdate())';
			connection.query(sql, [ personnel.NAME, personnel.JOB_NUMBER, personnel.E_MAIL, personnel.TEL,
					personnel.DEPARTMENT ], function(err, result) {
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

app.put('/personnels/enable/:personnelId', function(req, res) {
	var personnel = req.body;
	db.doTransaction(function(connection) {
		var tasks = [ function(callback) {
			var sql = 'update portal.PERSONNEL_CFG set ENABLE=? where ID=?';
			connection.query(sql, [ personnel.ENABLE, req.params.personnelId ], function(err, result) {
				callback(err);
			});
		} ];
		if (!personnel.ENABLE) {
			tasks.push(function(callback) {
				var sql = 'update portal.ACCOUNT set ENABLE=? where ID=?';
				connection.query(sql, [ personnel.ENABLE, req.params.personnelId ], function(err, result) {
					callback(err);
				});
			});
		}
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

app.put('/personnels/:personnelId', function(req, res) {
	var personnel = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'update portal.PERSONNEL_CFG set NAME=?,JOB_NUMBER=?,E_MAIL=?,TEL=?,DEPARTMENT=? where ID=?';
			connection.query(sql, [ personnel.NAME, personnel.JOB_NUMBER, personnel.E_MAIL, personnel.TEL,
					personnel.DEPARTMENT, req.params.personnelId ], function(err, result) {
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
