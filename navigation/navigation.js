var app = require('./app');
var db = require('../db');

app.get('/treeNode', function(req, res) {
	if (req.query.id) {
		var sql = 'select p.ID,p.OBJECT_TYPE,o.NAME,p.PARENT_ID from config.POSITION_RELATION p '
				+ 'join config.OBJECT o on p.ID=o.ID where p.PARENT_ID=?';
		db.pool.query(sql, [ req.query.id ], function(error, objects, fields) {
			if (error) {
				console.log(error);
				res.status(501).send(error);
			} else {
				res.send(objects);
			}
		});
	} else {
		var sql = 'select p.ID,p.OBJECT_TYPE,o.NAME,p.PARENT_ID from config.POSITION_RELATION p '
				+ 'join config.OBJECT o on p.ID=o.ID where p.PARENT_ID=0 or p.PARENT_ID is null';
		db.pool.query(sql, function(error, objects, fields) {
			if (error) {
				console.log(error);
				res.status(501).send(error);
			} else {
				res.send(objects);
			}
		});
	}
});

module.exports = app;
