var app = require('./app');
var dashboard = require('../base').config.dashboard;
var permissions = require('../base').permissions;
var db = require('../base').db;

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

function deleteItems(chain, ACCOUNT_ID, cbk) {
	chain.query('DELETE FROM portal.DASHBOARD WHERE ACCOUNT_ID=?', [ ACCOUNT_ID ]).on('result', function(result) {
		cbk();
	});
}

function insertItem(chain, ACCOUNT_ID, items, index, cbk) {
	if (index >= items.length) {
		return;
	}
	var sql = 'INSERT INTO portal.DASHBOARD(ACCOUNT_ID,ITEM_ID,COLUMN_INDEX)values(?,?,?)';
	chain.query(sql, [ ACCOUNT_ID, items[index].index, items[index].columnIndex ]).on('result', function(result) {
		index++;
		cbk(chain, ACCOUNT_ID, items, index, cbk);
	});
}
app.post('/userItems', function(req, res) {
	var items = req.body.items;
	try {
		permissions.getCurrentUser(req, res, function(error, user) {
			if (error) {
				res.status(500).send(error);
			} else {
				var chain = db.transaction(function(chain) {
					deleteItems(chain, user.ID, function() {
						insertItem(chain, user.ID, items, 0, insertItem);
					});
				}, function() {
					res.status(201).end();
				}, function(error) {
					logger.error(error);
					res.status(500).send(error);
				});
			}
		});
	} catch (err) {
		logger.error(err);
		res.status(500).send(error);
	}
});
module.exports = app;