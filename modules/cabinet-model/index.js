var db = require('dcim-db');
var util = require("dcim-util");

var express = require('express');
var app = express();
var config = require('dcim-config');

app.use(express.static(__dirname + '/public', {
	maxAge : config.config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;

app.get('/cabinetModels', function(req, res) {
	var sql = 'select ID,NAME,ABBREVIATION,U1_POSITION,U_COUNT,DEPTH,MAX_USE_AGE from config.CABINET_MODEL';
	db.pool.query(sql, function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(objects);
		}
	});
});

app.post('/cabinetModels', function(req, res) {
	var obj = req.body;
	try{
	var chain = db.transaction(function(chain) {
		var sql='INSERT INTO config.CABINET_MODEL(NAME,ABBREVIATION,U1_POSITION,U_COUNT,DEPTH,MAX_USE_AGE)values(?,?,?,?,?,?)';
		chain.query(sql, [ obj.NAME,obj.ABBREVIATION,obj.U1_POSITION,obj.U_COUNT,obj.DEPTH,obj.MAX_USE_AGE]);
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

app.put('/cabinetModels/:id', function(req, res) {
	var obj = req.body;
	var chain = db.transaction(
			function(chain) {
				var sql='update config.CABINET_MODEL set NAME=?,ABBREVIATION=?,U1_POSITION=?,U_COUNT=?,DEPTH=?,MAX_USE_AGE=? where ID=?';
				chain.query(sql, [obj.NAME,obj.ABBREVIATION,obj.U1_POSITION,obj.U_COUNT,obj.DEPTH,obj.MAX_USE_AGE,req.params.id]);

			}, function() {
				res.status(204).end();
			}, function(error) {
				logger.error(error);
				res.status(500).send(error);
			});
});

app.delete('/cabinetModels/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.CABINET_MODEL where ID=?', [ req.params.id ]);
	}, function() {
		res.status(200).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
});

module.exports = app;
