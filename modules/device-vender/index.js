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
	try{
	var chain = db.transaction(function(chain) {
		var sql='INSERT INTO config.DEVICE_VENDER(NAME,CODE,ABBREVIATION,DESCRIPTION)values(?,?,?,?)';
		chain.query(sql, [ obj.NAME,obj.CODE,obj.ABBREVIATION,obj.DESCRIPTION]);
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

app.put('/deviceVenders/:id', function(req, res) {
	var obj = req.body;
	var chain = db.transaction(
			function(chain) {
				var sql='update config.DEVICE_VENDER set NAME=?,CODE=?,ABBREVIATION=?,DESCRIPTION=? where ID=?';
				chain.query(sql, [obj.NAME,obj.CODE,obj.ABBREVIATION,obj.DESCRIPTION,req.params.id]);
			}, function() {
				res.status(204).end();
			}, function(error) {
				logger.error(error);
				res.status(500).send(error);
			});
});

app.delete('/deviceVenders/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.DEVICE_VENDER where ID=?', [ req.params.id ]);
	}, function() {
		res.status(200).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
});

module.exports = app;
