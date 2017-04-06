var app = require('./app');
var accountRights = require('../base').config.accountRights;
var db =require('../base').db;

app.get('/rights', function(req, res) {
	res.send(accountRights);
});

function getRightName(rightId) {
	for (var i = 0; i < accountRights.length; i++) {
		if (rightId === accountRights[i].id) {
			return accountRights[i].name;
		}
	}
	return "";
}
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
		role.rights.push({
			id : roles[i].RIGHT_ID,
			name : getRightName(roles[i].RIGHT_ID)
		});
	}
	return results;
}

function getRoleById(pool, roleId, cbk) {
	var sql = 'select r.ID,r.NAME,r.DESCRIPTION,rr.RIGHT_ID from portal.ROLE r join portal.ROLE_RIGHT rr on r.ID=rr.ROLE_ID where r.ID=?';
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
	var sql = 'select r.ID,r.NAME,r.DESCRIPTION,rr.RIGHT_ID from portal.ROLE r join portal.ROLE_RIGHT rr on r.ID=rr.ROLE_ID';
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

function insertRole(role, chain) {
	chain.query('INSERT INTO portal.ROLE(NAME,DESCRIPTION)values(?,?)', [ role.NAME, role.DESCRIPTION ]).on(
			'result',
			function(result) {
				var ID=result.insertId;
					for (var i = 0; i < role.rights.length; i++) {
						chain.query('INSERT INTO portal.ROLE_RIGHT(ROLE_ID,RIGHT_ID)values(?,?)', [ ID,
								role.rights[i].id ]);
					}

			});
}
var createRoleHandler = function(req, res) {
	var role = req.body;
	var chain = db.transaction(function(chain) {
		insertRole(role, chain);
	}, function() {
		res.status(201).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
};
app.post('/roles', createRoleHandler);

app.put('/roles/:roleId', function(req, res) {
	var role = req.body;
	var rights=role.rights;
	var chain = db.transaction(
			function(chain) {
				chain.query('update portal.ROLE set NAME=?,DESCRIPTION=? where ID=?', [role.NAME,role.DESCRIPTION,req.params.roleId]).on(
						'result',
						function(result) {
							chain.query('delete from portal.ROLE_RIGHT where ROLE_ID=?', [ req.params.roleId ]).on(
									'result',
									function(result) {
										for (var i = 0; i < rights.length; i++) {
											chain.query('INSERT INTO portal.ROLE_RIGHT(ROLE_ID,RIGHT_ID)values(?,?)', [
													req.params.roleId, rights[i].id ]);
										}
									});
						});
			}, function() {
				res.status(204).end();
			}, function(error) {
				logger.error(error);
				res.status(500).send(error);
			});
});

app.delete('/roles/:roleId', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from portal.ROLE where ID=?', [ req.params.roleId ]);
	}, function() {
		res.status(200).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
});

module.exports = app;
