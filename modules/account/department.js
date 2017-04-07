var app = require('./app');
var db = require('dcim-db');


function getDepartmentById(pool, departmentId, cbk) {
	var sql = 'select ID,NAME,DESCRIPTION from portal.DEPARTMENT where ID=?';
	pool.query(sql, [ departmentId ], function(error, departments, fields) {
		if (error) {
			cbk(error);
		} else {
			if (departments.length < 1) {
				cbk("not found,department id:" + departmentId);
			}else{
			cbk(null, departments[0]);
			}
		}
	});
}

app.get('/departments', function(req, res) {
	var sql = 'select ID,NAME,DESCRIPTION from portal.DEPARTMENT';
	db.pool.query(sql, function(error, departments, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(departments);
		}
	});
});

app.get('/departments/:departmentId', function(req, res) {
	getDepartmentById(db.pool, req.params.departmentId, function(error, department) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(department);
		}
	});
});

app.post('/departments', function(req, res) {
	var department = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'INSERT INTO portal.DEPARTMENT(NAME,DESCRIPTION)values(?,?)';
			connection.query(sql, [ department.NAME, department.DESCRIPTION ], function(err, result) {
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

app.put('/departments/:departmentId', function(req, res) {
	var department = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'update portal.DEPARTMENT set NAME=?,DESCRIPTION=? where ID=?';
			connection.query(sql, [department.NAME,department.DESCRIPTION,req.params.departmentId], function(err, result) {
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

app.delete('/departments/:departmentId', function(req, res) {
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'delete from portal.DEPARTMENT where ID=?';
			connection.query(sql, [ req.params.departmentId ], function(err, result) {
				callback(err);
			});
		} ];
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(200).end();
		}
	});
});

module.exports = app;
