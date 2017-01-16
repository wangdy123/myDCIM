var app = require('./app');

var db =require('../base').db;

app.get('/personnel/personnel-dialog.html', function(req, res) {
	function renderDialog(personnel) {
		var sql = 'select ID,NAME,DESCRIPTION from portal.DEPARTMENT';
		db.pool.query(sql, function(error, departments, fields) {
			if (error) {
				console.log(error);
				res.status(501).send(error);
			} else {
				personnel.departments = departments;
				res.render('personnel-dialog', personnel);
			}
		});
	}
	if (req.query.personnelId) {
		getPersonnelById(db.pool, req.query.personnelId, function(error, personnel) {
			console.log(error);
			if (error) {
				console.log(error);
				res.status(501).send(error);
			} else {
				renderDialog(personnel);
			}
		});
	} else {
		renderDialog({});
	}
});

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
	var sql = 'select p.ID,p.NAME,p.JOB_NUMBER,p.E_MAIL,p.TEL,p.ENABLE,p.CREATE_TIME,p.DEPARTMENT,d.NAME as DEPARTMENT_NAME '
			+ 'from portal.PERSONNEL_CFG p join portal.DEPARTMENT d on p.DEPARTMENT=d.ID';
	db.pool.query(sql, function(error, personnels, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(personnels);
		}
	});
});

app.get('/personnels/:personnelId', function(req, res) {
	getPersonnelById(db.pool, req.params.personnelId, function(error, personnel) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(personnel);
		}
	});
});

app.post('/personnels', function(req, res) {
	var personnel = req.body;
	var chain = db.transaction(function(chain) {
		var sql = 'INSERT INTO portal.PERSONNEL_CFG(NAME,JOB_NUMBER,E_MAIL,TEL,DEPARTMENT,ENABLE,CREATE_TIME) '
				+ 'values(?,?,?,?,1,sysdate())';
		chain.query(sql, [ personnel.NAME,personnel.JOB_NUMBER, personnel.E_MAIL, personnel.TEL, personnel.DEPARTMENT ]);
	}, function() {
		res.status(201).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

app.put('/personnels/enable/:personnelId', function(req, res) {
	var personnel = req.body;
	var chain = db.transaction(function(chain) {
		var sql = 'update portal.PERSONNEL_CFG set ENABLE=? where ID=?';
		chain.query(sql, [ personnel.ENABLE, req.params.personnelId ]).on('result', function(result) {
			if (!personnel.ENABLE) {
				var sql = 'update portal.ACCOUNT set ENABLE=? where ID=?';
				chain.query(sql, [ personnel.ENABLE, req.params.personnelId ]);
			}
		});
	}, function() {
		res.status(204).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

app.put('/personnels/:personnelId', function(req, res) {
	var personnel = req.body;
	var chain = db.transaction(function(chain) {
		var sql = 'update portal.PERSONNEL_CFG set NAME=?,JOB_NUMBER=?,E_MAIL=?,TEL=?,DEPARTMENT=? where ID=?';
		chain.query(sql, [ personnel.NAME,personnel.JOB_NUMBER, personnel.E_MAIL, personnel.TEL, personnel.DEPARTMENT,
				req.params.personnelId ]);
	}, function() {
		res.status(204).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

module.exports = app;
