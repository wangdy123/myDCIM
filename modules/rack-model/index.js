var db = require('dcim-db');
var util = require("dcim-util");

var express = require('express');
var app = express();
var config = require('dcim-config');

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;

app.get('/rackModels', function(req, res) {
	var sql = 'select ID,NAME,ABBREVIATION,U1_POSITION,U_COUNT,DEPTH,MAX_USE_AGE from config.RACK_MODEL';
	db.pool.query(sql, function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(objects);
		}
	});
});

app.post('/rackModels', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql ='INSERT INTO config.RACK_MODEL(NAME,ABBREVIATION,U1_POSITION,U_COUNT,DEPTH,MAX_USE_AGE)values(?,?,?,?,?,?)';
			connection.query(sql, [ obj.NAME,obj.ABBREVIATION,obj.U1_POSITION,obj.U_COUNT,obj.DEPTH,obj.MAX_USE_AGE], function(err, result) {
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

app.put('/rackModels/:id', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql='update config.RACK_MODEL set NAME=?,ABBREVIATION=?,U1_POSITION=?,U_COUNT=?,DEPTH=?,MAX_USE_AGE=? where ID=?';
			connection.query(sql, [obj.NAME,obj.ABBREVIATION,obj.U1_POSITION,obj.U_COUNT,obj.DEPTH,obj.MAX_USE_AGE,req.params.id], function(err, result) {
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

app.delete('/rackModels/:id', function(req, res) {
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql='delete from config.RACK_MODEL where ID=?';
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
