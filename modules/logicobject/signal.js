var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var async = require("async");
var config = require('dcim-config');

app.get('/signals', function(req, res) {
		var sql = 'select * from config.SIGNAL where OBJECT_ID=?';
		db.pool.query(sql, [ req.query.parentId ], function(error, results, fields) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(results);
			}
		});

});

app.get('/signals/:objectId/:signalId', function(req, res) {
	var sql = 'select * from config.SIGNAL where where OBJECT_ID=? and SIGNAL_ID=?';
	db.pool.query(sql, [ req.params.objectId,req.params.signalId ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
			return;
		}
		if (objects.length === 0) {
			res.status(500).send("not found:(" + req.params.objectId+','+req.params.signalId+')');
			return;
		}
		res.send(objects[0]);
	});
});

app.post('/signals', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql ='INSERT INTO config.SIGNAL set ?';
			connection.query(sql, obj, function(err, result) {
				if(err){
					callback(err);
				}else{
						callback();
				}
			});
		}];
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(201).end();
		}
	});

});

app.put('/signals/:objectId/:signalId', function(req, res) {
	var obj = req.body;
	obj.OBJECT_ID=req.params.objectId;
	obj.SIGNAL_ID=req.params.signalId;
db.doTransaction(function(connection) {
	return [ function(callback) {
		var sql ='REPLACE INTO config.SIGNAL set ?';
		connection.query(sql, obj, function(err, result) {
			if(err){
				callback(err);
			}else{
					callback();
			}
		});
	}];
}, function(error, result) {
	if (error) {
		logger.error(error);
		res.status(500).send(error);
	} else {
		res.status(204).end();
	}
});
});

app.delete('/signals/:objectId/:signalId', function(req, res) {
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql ='delete from config.SIGNAL  where OBJECT_ID=? and SIGNAL_ID=?';
			connection.query(sql, [ req.params.objectId,req.params.signalId ], function(err, result) {
				if(err){
					callback(err);
				}else{
						callback();
				}
			});
		}];
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
		}
	});
});
