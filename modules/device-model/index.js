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

var path = require('path');
var fs = require('fs');
app.get('/params/:deviceType', function(req, res) {
	var fileName = path.join(process.cwd(), 'conf', 'device_model_ext', req.params.deviceType + '.json');
	fs.exists(fileName, function(exists){
		if(exists){
			res.sendFile(fileName);			
		}else{
			res.send([]);
		}
	});
});

function makeModel(objects) {
	var models = [];
	objects.forEach(function(item) {
		var model = util.findFromArray(models, "ID", item.ID);
		if (!model) {
			model = {
				ID : item.ID,
				NAME : item.NAME,
				CODE:item.CODE,
				DEVICE_TYPE : item.DEVICE_TYPE,
				VENDER : item.VENDER,
				MAX_USE_AGE : item.MAX_USE_AGE,
				DESCRIPTION : item.DESCRIPTION,
				params : {}
			};
			models.push(model);
		}
		if (item.PROP_NAME) {
			model.params[item.PROP_NAME] = item.PROP_VALUE;
		}
	});
	return models;
}

app.get('/deviceModels', function(req, res) {
	var sql = 'select m.ID,m.NAME,m.CODE,m.DEVICE_TYPE,m.VENDER,m.MAX_USE_AGE,m.DESCRIPTION,'
		+'p.PROP_NAME,p.PROP_VALUE from config.DEVICE_MODEL m left join config.DEVICE_MODEL_PARAM p on m.ID=p.ID';
	db.pool.query(sql, function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(makeModel(objects));
		}
	});
});

function insertTask(connection,tasks,key,value){
	tasks.push(function(modelId,callback){
		var sql='INSERT INTO config.DEVICE_MODEL_PARAM(ID,PROP_NAME,PROP_VALUE)values(?,?,?)'; 
		connection.query(sql,[modelId,key,value], function(err, result) {
			if(err){
			callback(err);
			}else{
				callback(null,modelId);
			}
		});
	});
}
function createParamInsertTasks(connection,tasks,params){
	for(key in params){
		insertTask(connection,tasks,key,params[key]);
	}
}
app.post('/deviceModels', function(req, res) {
	var obj = req.body;
	var params=obj.params;
	delete obj.params;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			var sql='INSERT INTO config.DEVICE_MODEL set ?'; 
			connection.query(sql,obj, function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null,result.insertId);
				}
			});
		}];
		createParamInsertTasks(connection,tasks,params);
		tasks.push(function(modelId,callback){
			callback();
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(201).end();
			operateLogger.deviceModel.create(req.user,obj);
		}
	});
});
function createParamDeleteTasks(connection,tasks,modelId){
	tasks.push(function(cbk){
		var sql='delete from config.DEVICE_MODEL_PARAM where ID=?'; 
		connection.query(sql,[modelId], function(err, result) {
			if(err){
				cbk(err);
			}else{
				cbk(null);
			}
		});
	});
}

function getModelById(connection,modelId, callback) {
	var sql = "select m.ID,m.NAME,m.CODE,m.DEVICE_TYPE,m.VENDER,m.MAX_USE_AGE,m.DESCRIPTION,p.PROP_NAME," +
			"p.PROP_VALUE from config.DEVICE_MODEL m left join config.DEVICE_MODEL_PARAM p on m.ID=p.ID where m.ID=?";
	connection.query(sql, [ modelId ], function(error, objects) {
		if (error) {
			callback(error);
			return;
		}
		var models=makeModel(objects)
		if (models.length == 0) {
			callback("not found:" + modelId);
		} else {
			callback(null, models[0]);
		}
	});
}

app.put('/deviceModels/:id', function(req, res) {
	var modelId=parseInt(req.params.id,10);
	var obj = req.body;
	var old=null;
	db.doTransaction(function(connection) {
		var tasks=  [function(callback){
			getModelById(connection,modelId,function(err,reslut){
				if(err){
					callback(err);
				}else{
					old=reslut;
					callback();
				}
			});
		}, function(callback) {
			var sql='update config.DEVICE_MODEL set NAME=?,CODE=?,DEVICE_TYPE=?,'
				+'VENDER=?,MAX_USE_AGE=?,DESCRIPTION=? where ID=?';
			connection.query(sql, [obj.NAME,obj.CODE,obj.DEVICE_TYPE,obj.VENDER,obj.MAX_USE_AGE,obj.DESCRIPTION,modelId], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback();
				}
			});
		}];
		createParamDeleteTasks(connection,tasks,modelId);
		tasks.push(function(callback){
			callback(null,modelId);
		});
		createParamInsertTasks(connection,tasks,obj.params);
		tasks.push(function(modelId,callback){
			callback();
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
			operateLogger.deviceModel.update(req.user,obj,old);
		}
	});
});

app.delete('/deviceModels/:id', function(req, res) {
	var modelId=parseInt(req.params.id,10);
	var old=null;
	db.doTransaction(function(connection) {
		var tasks=[function(callback){
			getModelById(connection,modelId,function(err,reslut){
				if(err){
					callback(err);
				}else{
					old=reslut;
					callback();
				}
			});
		}];
		createParamDeleteTasks(connection,tasks,modelId);
		tasks.push( function(callback) {
			var sql='delete from config.DEVICE_MODEL where ID=?';
			connection.query(sql, [req.params.id ], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback();
				}
			});
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
			operateLogger.deviceModel.remove(req.user,old);
		}
	});
});

module.exports = app;
