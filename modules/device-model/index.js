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
	try{
	var chain = db.transaction(function(chain) {
		var sql='INSERT INTO config.DEVICE_MODEL(NAME,CODE,DEVICE_TYPE,VENDER,MAX_USE_AGE,DESCRIPTION)'
			+'values(?,?,?,?,?,?)';
		chain.query(sql, [ obj.NAME,obj.CODE,obj.DEVICE_TYPE,obj.VENDER,obj.MAX_USE_AGE,obj.DESCRIPTION]);
	}, function() {
		res.status(201).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
	}
	catch(err){
		logger.error(err);
		res.status(500).send(error);
	}
});

app.put('/deviceModels/:id', function(req, res) {
	var obj = req.body;
	var chain = db.transaction(
			function(chain) {
				var sql='update config.DEVICE_MODEL set NAME=?,CODE=?,DEVICE_TYPE=?,'
					+'VENDER=?,MAX_USE_AGE=?,DESCRIPTION=? where ID=?';
				chain.query(sql, [obj.NAME,obj.CODE,obj.DEVICE_TYPE,obj.VENDER,obj.MAX_USE_AGE,obj.DESCRIPTION,req.params.id]);

			}, function() {
				res.status(204).end();
			}, function(error) {
				logger.error(error);
				res.status(500).send(error);
			});
});

app.delete('/deviceModels/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.DEVICE_MODEL where ID=?', [ req.params.id ]);
	}, function() {
		res.status(200).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
});

module.exports = app;
