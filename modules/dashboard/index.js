var app = require('./app');
var dashboard = require('dcim-config').dashboard;
var db = require('dcim-db');
var util = require("dcim-util");
var permissions = require('dcim-permissions');

app.get('/dashboard.html', function(req, res) {
	res.render('dashboard', dashboard);
});

app.get('/dialog.html', function(req, res) {
	res.render('dialog', dashboard);
});
app.get('/items', function(req, res) {
	getCurrentUserItems(req, res, function(error, userItems) {
		if (error) {
			response.writeHead(400, {
				'Content-Type' : 'text/plain'
			});
			response.end(JSON.stringify(error));
		} else {
			var result = {
				columnCount : dashboard.columns.length,
				items : []
			};
			for (var i = 0; i < dashboard.items.length; i++) {
				var item = dashboard.items[i];
				var userItem = findUserItems(item.index, userItems);
				if (userItem) {
					item.columnIndex = userItem.COLUMN_INDEX;
					item.checked = "checked";
				}
				result.items.push(item);
			}
			res.send(result);
		}
	});
});

function findUserItems(index, userItems) {
	for (var i = 0; i < userItems.length; i++) {
		if (index === userItems[i].ITEM_ID) {
			return userItems[i];
		}
	}
	return null;
}
function getUserItemById(userId, cbk) {
	db.pool.query('select ITEM_ID,COLUMN_INDEX from portal.DASHBOARD where ACCOUNT_ID = ?', [ userId ], function(error,
			results, fields) {
		if (error) {
			cbk(error);
		} else {
			cbk(null, results);
		}
	});
}
function getCurrentUserItems(req, res, cbk) {
	permissions.getCurrentUser(req, res, function(error, user) {
		if (error) {
			cbk(error);
		} else {
			getUserItemById(user.ID, cbk);
		}
	});
}
app.get('/userItems', function(req, res) {
	getCurrentUserItems(req, res, function(error, userItems) {
		if (error) {
			res.writeHead(400, {
				'Content-Type' : 'text/plain'
			});
			response.end(JSON.stringify(error));
		} else {
			var result = {
				columnCount : dashboard.columns.length,
				items : []
			};
			for (var i = 0; i < dashboard.items.length; i++) {
				var item = dashboard.items[i];
				var userItem = findUserItems(item.index, userItems);
				if (userItem) {
					item.columnIndex = userItem.COLUMN_INDEX;
					result.items.push(item);
				}
			}
			res.send(result);
		}
	});
});

function createItemTask(connection, ACCOUNT_ID, item) {
	return function(callback) {
		var sql = 'INSERT INTO portal.DASHBOARD(ACCOUNT_ID,ITEM_ID,COLUMN_INDEX)values(?,?,?)';
		connection.query(sql, [ ACCOUNT_ID, item.index, item.columnIndex ], function(err, result) {
			callback(err);
		});
	};
}

function createItemTasks(connection, ACCOUNT_ID, tasks, items) {
	for (var i = 0; i < items.length; i++) {
		tasks.push(createItemTask(connection,ACCOUNT_ID, items[i]));
	}
}

app.post('/userItems', function(req, res) {
	var items = req.body.items;
	permissions.getCurrentUser(req, res, function(error, user) {
		if (error) {
			res.status(500).send(error);
		} else {
			db.doTransaction(function(connection) {
				var tasks = [ function(callback) {
					var sql = 'DELETE FROM portal.DASHBOARD WHERE ACCOUNT_ID=?';
					connection.query(sql, [ user.ID ], function(err, result) {
						if (err) {
							callback(err);
						} else {
							callback();
						}
					});
				} ];
				createItemTasks(connection, user.ID, tasks, items);
				return tasks;
			}, function(error, result) {
				if (error) {
					logger.error(error);
					res.status(500).send(error);
				} else {
					res.status(201).end();
				}
			});
		}
	});
});
module.exports = app;