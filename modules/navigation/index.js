var db = require('dcim-db');
var util = require("dcim-util");
var objectDao = require('dcim-object-dao')

var express = require('express');
var app = express();
var config = require('dcim-config').config;

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;

app.get('/objectNodes', function(req, res) {
	if (req.query.id) {
		var sql = 'select o.ID,o.OBJECT_TYPE,o.NAME,p.PARENT_ID from config.OBJECT o '
				+ 'join config.POSITION_RELATION p on p.ID=o.ID where p.PARENT_ID=?';
		db.pool.query(sql, [ req.query.id ], function(error, objects, fields) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(objects);
			}
		});
	} else {
		var sql = 'select o.ID,o.OBJECT_TYPE,o.NAME,p.PARENT_ID from config.OBJECT o '
				+ 'left join config.POSITION_RELATION p on p.ID=o.ID where o.ID=?';
		db.pool.query(sql, [ config.root_object_id ], function(error, objects, fields) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(objects);
			}
		});
	}
});

app.get('/objectNodes/:id', function(req, res) {
	var sql = 'select ID,OBJECT_TYPE,NAME from config.OBJECT where ID=?';
	db.pool.query(sql, [ req.params.id ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
			return;
		}
		if (objects.length === 0) {
			res.status(500).send("not found:" + req.params.id);
			return;
		}
		var namespace = config.objectTypes[objects[0].OBJECT_TYPE].namespace;
		objectDao[namespace].getById(db.pool, req.params.id, function(error, result) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(result);
			}
		});
	});
});