var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var async = require("async");
var config = require('dcim-config');
var objectDao = require('dcim-object-dao');

app.get('/signals', function(req, res) {
	objectDao.signal.getByParent(db.pool,req.query.parentId,function(error,signals){
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(signals);
		}
	});
});

app.get('/signals/:objectId/:signalId', function(req, res) {
	objectDao.signal.getByParent(db.pool,req.params.objectId,req.params.signalId,function(error,signal){
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(signal);
		}
	});
});

app.post('/signals', function(req, res) {
	var obj = req.body;

	db.doTransaction(function(connection) {
		var tasks=[];
		objectDao.signal.createInsertTasks(connection,tasks,obj);
		return tasks;
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
		var tasks=[];
		objectDao.signal.createUpdateTasks(connection,tasks,obj);
		return tasks;
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
		return [function(callback) {
			var sql ='delete from config.SIGNAL_CONDITION_PROP  where OBJECT_ID=? and SIGNAL_ID=?';
			connection.query(sql, [ req.params.objectId,req.params.signalId ], function(err, result) {
				if(err){
					callback(err);
				}else{
						callback();
				}
			});
		},function(callback) {
			var sql ='delete from config.SIGNAL_CONDITION where OBJECT_ID=? and SIGNAL_ID=?';
			connection.query(sql, [ req.params.objectId,req.params.signalId ], function(err, result) {
				if(err){
					callback(err);
				}else{
						callback();
				}
			});
		}, function(callback) {
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
