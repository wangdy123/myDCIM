var app = require('./app');
var accountRights = require('dcim-config').accountRights;
var db = require('dcim-db');

app.get('/rights', function(req, res) {
	res.send(accountRights);
});

function findRole(roleId, roles) {
	for (var i = 0; i < roles.length; i++) {
		if (roleId === roles[i].ID) {
			return roles[i];
		}
	}
	return null;
}
function pivotRoleRight(roles) {
	var results = [];
	for (var i = 0; i < roles.length; i++) {
		var role = findRole(roles[i].ID, results);
		if (!role) {
			role = {
				ID : roles[i].ID,
				NAME : roles[i].NAME,
				DESCRIPTION : roles[i].DESCRIPTION,
				rights : []
			};
			results.push(role);
		}
		if(roles[i].RIGHT_ID){
		role.rights.push(roles[i].RIGHT_ID);
		}
	}
	return results;
}

function getRoleById(pool, roleId, cbk) {
	var sql = 'select r.ID,r.NAME,r.DESCRIPTION,rr.RIGHT_ID from portal.ROLE r left join portal.ROLE_RIGHT rr on r.ID=rr.ROLE_ID where r.ID=?';
	pool.query(sql, [ roleId ], function(error, roles, fields) {
		if (error) {
			cbk(error);
		} else {
			var results = pivotRoleRight(roles);
			if (results.length < 1) {
				cbk("not found,fole id:" + roleId);
			}else{
			cbk(null, results[0]);
			}
		}
	});
}

function requestAllHandler(req, res) {
	var sql = 'select r.ID,r.NAME,r.DESCRIPTION,rr.RIGHT_ID from portal.ROLE r left join portal.ROLE_RIGHT rr on r.ID=rr.ROLE_ID';
	db.pool.query(sql, function(error, roles, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(pivotRoleRight(roles));
		}
	});
}

app.get('/roles', requestAllHandler);

app.get('/roles/:roleId', function(req, res) {
	getRoleById(db.pool, req.params.roleId, function(error, role) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(role);
		}
	});
});

function createRoleRightTask(connection,right){
	return function(roleId,callback){
		var sql='INSERT INTO portal.ROLE_RIGHT(ROLE_ID,RIGHT_ID)values(?,?)';
		connection.query(sql, [ roleId,right.id ], function(err, result) {
			callback(err,roleId);
			});
	};
}

function createRoleRightTasks(connection,tasks,rights){
	for (var i = 0; i < rights.length; i++) {
		tasks.push(createRoleRightTask(connection,rights[i]));
	}
	tasks.push(function(roleId,callback){
		callback();
	});
}
app.post('/roles', function(req, res) {
	var role = req.body;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			var sql ='INSERT INTO portal.ROLE(NAME,DESCRIPTION)values(?,?)';
			connection.query(sql, [ role.NAME, role.DESCRIPTION ], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null,result.insertId);
				}
			});
		} ];
		createRoleRightTasks(connection,tasks,role.rights);
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

app.put('/roles/:roleId', function(req, res) {
	var role = req.body;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			var sql = 'update portal.ROLE set NAME=?,DESCRIPTION=? where ID=?';
			connection.query(sql, [role.NAME,role.DESCRIPTION,req.params.roleId], function(err, result) {
				callback(err);
			});
		} ,function(callback) {
			var sql ='delete from portal.ROLE_RIGHT where ROLE_ID=?';
			connection.query(sql, [req.params.roleId], function(err, result) {
				callback(err,req.params.roleId);
			});
		}];
		createRoleRightTasks(connection,tasks,role.rights);
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

app.delete('/roles/:roleId', function(req, res) {
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'delete from portal.ROLE where ID=?';
			connection.query(sql, [ req.params.roleId ], function(err, result) {
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
