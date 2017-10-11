var db = require('dcim-db');
var util = require("dcim-util");

var express = require('express');
var app = express();
var config = require('dcim-config');
var operateLogger = require('dcim-operate-logger');

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
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
			operateLogger.deviceVender.create(req.user,obj);
		}
	});
});
function getVenderById(connection,venderId, callback) {
	var sql = "select ID,NAME,CODE,ABBREVIATION,DESCRIPTION from config.DEVICE_VENDER where ID=?";
	connection.query(sql, [ venderId ], function(error, objects) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length == 0) {
			callback("not found:" + venderId);
		} else {
			callback(null, objects[0]);
		}
	});
}

app.put('/deviceVenders/:id', function(req, res) {
	var venderId=parseInt(req.params.id,10);
	var obj = req.body;
	var old=null;
	db.doTransaction(function(connection) {
		return [function(callback){
			getVenderById(connection,venderId,function(err,reslut){
				if(err){
					callback(err);
				}else{
					old=reslut;
					callback();
				}
			});
		}, function(callback) {
			var sql='update config.DEVICE_VENDER set NAME=?,CODE=?,ABBREVIATION=?,DESCRIPTION=? where ID=?';
			connection.query(sql,[obj.NAME,obj.CODE,obj.ABBREVIATION,obj.DESCRIPTION,venderId], function(err, result) {
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
			operateLogger.deviceVender.update(req.user,obj,old);
		}
	});
});

app.delete('/deviceVenders/:id', function(req, res) {
	var modelId=parseInt(req.params.id,10);
	var old=null;
	db.doTransaction(function(connection) {
		return [function(callback){
			getVenderById(connection,venderId,function(err,reslut){
				if(err){
					callback(err);
				}else{
					old=reslut;
					callback();
				}
			});
		}, function(callback) {
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
			res.status(204).end();
			operateLogger.deviceVender.remove(req.user,old);
		}
	});
});

module.exports = app;
