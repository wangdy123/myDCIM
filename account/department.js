var app = require('./app');

var db =require('../db');


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
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(departments);
		}
	});
});

app.get('/departments/:departmentId', function(req, res) {
	getDepartmentById(db.pool, req.params.departmentId, function(error, department) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(department);
		}
	});
});

app.post('/departments', function(req, res) {
	var department = req.body;
	var chain = db.transaction(function(chain) {
		chain.query('INSERT INTO portal.DEPARTMENT(NAME,DESCRIPTION)values(?,?)', [ department.NAME, department.DESCRIPTION ]);
	}, function() {
		res.status(201).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

app.put('/departments/:departmentId', function(req, res) {
	var department = req.body;
	var chain = db.transaction(
			function(chain) {
				chain.query('update portal.DEPARTMENT set NAME=?,DESCRIPTION=? where ID=?', [department.NAME,department.DESCRIPTION,req.params.departmentId]);
			}, function() {
				res.status(204).end();
			}, function(error) {
				console.log(error);
				res.status(501).send(error);
			});
});

app.delete('/departments/:departmentId', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from portal.DEPARTMENT where ID=?', [ req.params.departmentId ]);
	}, function() {
		res.status(200).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

module.exports = app;
