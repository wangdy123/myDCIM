var db = require('dcim-db');
var util = require("dcim-util");

var express = require('express');
var app = express();
var config = require('dcim-config');

var scCluster = require('dcim-sc-cluster');
var operateLogger = require('dcim-operate-logger');
app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;

function makeFsu(objects) {
	var fsus = [];
	objects.forEach(function(item) {
		var fsu = util.findFromArray(fsus, "ID", item.ID);
		if (!fsu) {
			fsu = {
				ID : item.ID,
				NAME : item.NAME,
				CODE:item.CODE,
				MODEL : item.MODEL,
				POSTION : item.POSTION,
				params : {}
			};
			fsus.push(fsu);
		}
		if (item.PROP_NAME) {
			fsu.params[item.PROP_NAME] = item.PROP_VALUE;
		}
	});
	return fsus;
}

app.get('/fsus', function(req, res) {
	var sql = "select f.ID,f.NAME,f.CODE,f.MODEL,f.POSTION,p.PROP_NAME,p.PROP_VALUE " +
			"from config.FSU f left join config.FSU_PARAM p on f.ID=p.ID where f.POSTION=?";
	db.pool.query(sql,[req.query.position], function(error, objects) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(makeFsu(objects));
		}
	});
});

app.get('/models', function(req, res) {
	scCluster.fsu.getModels(req, function(err,result){
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else{
			var models = [];
			for(key in result){
				models.push({
					model : key,
					name : result[key]
				});
			}
			res.send(models);
		}
	});
});
app.get('/params/:model', function(req, res) {
	scCluster.fsu.getModelParams(req,req.params.model, function(err,result){
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else{
			res.send(result);
		}
	});
});
app.get('/fsuDrivers', function(req, res) {
	var fsuId=parseInt(req.query.fsuId,10);
	var sql='select * from config.DRIVER where FSU=?'; 
	connection.query(sql,[fsuId], function(err, result) {
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		}else{
			res.send(result);
		}
	});
});
app.put('/restartFsu/:id', function(req, res) {
	var fsuId=parseInt(req.params.id,10);
	scCluster.fsu.restartFsu(req,fsuId,function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
			operateLogger.fsu.restartFsu(req.user,fsuId);
		}
	});
});

function insertTask(connection,tasks,key,value){
	tasks.push(function(fsuId,callback){
		var sql='INSERT INTO config.FSU_PARAM(ID,PROP_NAME,PROP_VALUE)values(?,?,?)'; 
		connection.query(sql,[fsuId,key,value], function(err, result) {
			if(err){
			callback(err);
			}else{
				callback(null,fsuId);
			}
		});
	});
}
function createParamInsertTasks(connection,tasks,params){
	for(key in params){
		insertTask(connection,tasks,key,params[key]);
	}
}
app.post('/fsus', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			var sql='INSERT INTO config.FSU(NAME,CODE,MODEL,POSTION) values(?,?,?,?)'; 
			connection.query(sql,[obj.NAME,obj.CODE,obj.MODEL,obj.POSTION], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null,result.insertId);
				}
			});
		}];
		createParamInsertTasks(connection,tasks,obj.params);
		tasks.push(function(fsuId,callback){
			obj.ID=fsuId;
			scCluster.fsu.createFsu(req,obj,callback);
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(201).end();
			operateLogger.fsu.createFsu(req.user,obj);
		}
	});
});

function createDeleteTasks(connection,tasks,fsuId){
	tasks.push(function(cbk){
		var sql='delete from config.FSU_PARAM where ID=?'; 
		connection.query(sql,[fsuId], function(err, result) {
			if(err){
				cbk(err);
			}else{
				cbk(null);
			}
		});
	});
}

function getFsuById(connection,fsuId, callback) {
	var sql = "select f.ID,f.CODE,f.NAME,f.MODEL,f.POSTION,p.PROP_NAME,p.PROP_VALUE "
			+ "from config.FSU f left join config.FSU_PARAM p on f.ID=p.ID where f.ID=?";
	connection.query(sql, [ fsuId ], function(error, objects) {
		if (error) {
			callback(error);
			return;
		}
		var fsus = makeFsu(objects);
		if (fsus.length == 0) {
			callback("not found:" + fsuId);
		} else {
			callback(null, fsus[0]);
		}
	});
}
app.put('/fsus/:id', function(req, res) {
	var fsuId=parseInt(req.params.id,10);
	var obj = req.body;
	var old=null;
	db.doTransaction(function(connection) {
		var tasks= [function(callback){
			getFsuById(connection,fsuId,function(err,reslut){
				if(err){
					callback(err);
				}else{
					old=reslut;
					callback();
				}
			});
		},
			function(callback) {
			var sql='update config.FSU set NAME=?,CODE=?,MODEL=?,POSTION=? where ID=?';
			connection.query(sql, [obj.NAME,obj.CODE,obj.MODEL,obj.POSTION,fsuId], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null);
				}
			});
		}];
		createDeleteTasks(connection,tasks,fsuId);
		tasks.push(function(callback){
			callback(null,fsuId);
		});
		createParamInsertTasks(connection,tasks,obj.params);
		tasks.push(function(fsuId,callback){
			obj.ID=fsuId;
			scCluster.fsu.updateFsu(req,obj,old,callback);
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
			operateLogger.fsu.updateFsu(req.user,obj,old);
		}
	});
});

app.delete('/fsus/:id', function(req, res) {
	var fsuId=parseInt(req.params.id,10);
	var old=null;
	db.doTransaction(function(connection) {
		var tasks=[function(callback){
			var sql = "select count(ID) as driverCount from config.DRIVER where FSU=?";
			connection.query(sql, [ fsuId ], function(error, objects) {
				if (error) {
					callback(error);
				}else if(objects[0].driverCount>0){
					callback("have driver,can not delete:"+fsuId);
				}else{
					callback();
				}
			});
		},function(callback){
			getFsuById(connection,fsuId,function(err,reslut){
				if(err){
					callback(err);
				}else{
					old=reslut;
					callback();
				}
			});
		}];
		createDeleteTasks(connection,tasks,fsuId);
		tasks.push( function(callback) {
			var sql='delete from config.FSU where ID=?';
			connection.query(sql, [fsuId], function(err, result) {
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
			operateLogger.fsu.removeFsu(req.user,old);
		}
	});
});

module.exports = app;
