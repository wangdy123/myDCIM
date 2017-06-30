var db = require('dcim-db');
var util = require("dcim-util");

var express = require('express');
var app = express();
var config = require('dcim-config');

app.use(express.static(__dirname + '/public', {
	maxAge : config.config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;

app.get('/deviceVenders', function(req, res) {
	var sql = 'select ID,NAME,CODE,ABBREVIATION,DESCRIPTION from config.DEVICE_VENDER';
	db.pool.query(sql, function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(objects);
		}
	});
});

app.post('/deviceVenders', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql='INSERT INTO config.DEVICE_VENDER(NAME,CODE,ABBREVIATION,DESCRIPTION)values(?,?,?,?)';
			connection.query(sql, [ obj.NAME,obj.CODE,obj.ABBREVIATION,obj.DESCRIPTION], function(err, result) {
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

app.put('/deviceVenders/:id', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql='update config.DEVICE_VENDER set NAME=?,CODE=?,ABBREVIATION=?,DESCRIPTION=? where ID=?';
			connection.query(sql,[obj.NAME,obj.CODE,obj.ABBREVIATION,obj.DESCRIPTION,req.params.id], function(err, result) {
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

app.delete('/deviceVenders/:id', function(req, res) {
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql='delete from config.DEVICE_VENDER where ID=?';
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
