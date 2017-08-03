var db = require('dcim-db');
var util = require("dcim-util");

var express = require('express');
var app = express();
var config = require('dcim-config');

app.use(express.static(__dirname + '/public', {
	maxAge : config.config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;

app.get('/deviceModels', function(req, res) {
	var sql = 'select ID,NAME,CODE,DEVICE_TYPE,VENDER,MAX_USE_AGE,DESCRIPTION from config.DEVICE_MODEL';
	db.pool.query(sql, function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(objects);
		}
	});
});

app.post('/deviceModels', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql='INSERT INTO config.DEVICE_MODEL set ?'; 
			connection.query(sql,obj, function(err, result) {
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

app.put('/deviceModels/:id', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql='update config.DEVICE_MODEL set NAME=?,CODE=?,DEVICE_TYPE=?,'
				+'VENDER=?,MAX_USE_AGE=?,DESCRIPTION=? where ID=?';
			connection.query(sql, [obj.NAME,obj.CODE,obj.DEVICE_TYPE,obj.VENDER,obj.MAX_USE_AGE,obj.DESCRIPTION,req.params.id], function(err, result) {
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

app.delete('/deviceModels/:id', function(req, res) {
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql='delete from config.DEVICE_MODEL where ID=?';
			connection.query(sql, [req.params.id ], function(err, result) {
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
			res.status(200).end();
		}
	});
});

module.exports = app;
