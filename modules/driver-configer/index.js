var db = require('dcim-db');
var util = require("dcim-util");

var express = require('express');
var app = express();
var config = require('dcim-config');

var scCluster = require('dcim-sc-cluster');
var operateLogger = require('dcim-operate-logger');
var common = require('dcim-common');
var async = require("async");

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;

app.get('/driverSignals', function(req, res) {
	scCluster.driver.getDriverKey(req,req.query.driverId, function(err,result){
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else{
			res.send(result);
		}
	});
});

function makeDrivers(objects) {
	var drivers=[];
	objects.forEach(function(item){
		var driver=util.findFromArray(drivers,"ID",item.ID);
		if(!driver){
			driver={
					ID:	item.ID,
					NAME:	item.NAME,
					FSU:	item.FSU,
					MODEL:	item.MODEL,
					POSTION:	item.POSTION,
					params:{}
			};
			drivers.push(driver);
		}
		if(item.PROP_NAME){
			driver.params[item.PROP_NAME]=item.PROP_VALUE;
		}
	});
	return drivers;
}

app.get('/drivers', function(req, res) {
	var sql = "select d.ID,d.NAME,d.MODEL,d.POSTION,d.FSU,p.PROP_NAME,p.PROP_VALUE " +
			"from config.DRIVER d left join config.DRIVER_PARAM p on d.ID=p.ID where d.POSTION=?";
	db.pool.query(sql,[req.query.position], function(error, objects) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(makeDrivers(objects));
		}
	});
});

app.get('/drivers/:id', function(req, res) {
	var sql = "select d.ID,d.NAME,d.MODEL,d.POSTION,d.FSU,p.PROP_NAME,p.PROP_VALUE " +
			"from config.DRIVER d left join config.DRIVER_PARAM p on d.ID=p.ID where d.ID=?";
	db.pool.query(sql,[req.params.id], function(error, objects) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			var drivers=makeDrivers(objects);
			if(drivers.length>0){
				res.send(drivers[0]);
			}
			else{
				res.status(404).send("not found driver:"+req.params.id);
			}
		}
	});
});

app.get('/models', function(req, res) {
	scCluster.driver.getModels(req, function(err,result){
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
	scCluster.driver.getModelParams(req,req.params.model, function(err,result){
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else{
			res.send(result);
		}
	});
});

app.get('/signals', function(req, res) {
	var driverId=parseInt(req.query.driverId,10);
	var sql = "select * from config.SIGNAL where DRIVER_ID=?";
	db.pool.query(sql, [ driverId ], function(error, objects) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else{
			var tasks = [];
			tasks.push(function(callback){
				objects.forEach(function(signal){
					common.getObjectPathName(0,signal.OBJECT_ID,function(err,name){
						if(!err){
							signal.OBJECT_NAME=name;
						}
						callback();
					});
			});
			});
			async.parallel(tasks, function(err, results) {
				res.send(objects);
			});
			
		}
	});
});

app.put('/restartDriver/:id', function(req, res) {
	var driverId=parseInt(req.params.id,10);
	scCluster.driver.restartDriver(req,driverId,function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
			operateLogger.driver.restartDriver(req.user,driverId);
		}
	});
});

function insertTask(connection,tasks,key,value){
	tasks.push(function(driverId,callback){
		var sql='INSERT INTO config.DRIVER_PARAM(ID,PROP_NAME,PROP_VALUE)values(?,?,?)'; 
		connection.query(sql,[driverId,key,value], function(err, result) {
			if(err){
			callback(err);
			}else{
				callback(null,driverId);
			}
		});
	});
}
function createParamInsertTasks(connection,tasks,params){
	for(key in params){
		insertTask(connection,tasks,key,params[key]);
	}
}
app.post('/drivers', function(req, res) {
	var obj = req.body;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			var sql='INSERT INTO config.DRIVER(NAME,FSU,MODEL,POSTION) values(?,?,?,?)'; 
			connection.query(sql,[obj.NAME,obj.FSU,obj.MODEL,obj.POSTION], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null,result.insertId);
				}
			});
		}];
		createParamInsertTasks(connection,tasks,obj.params);
		tasks.push(function(driverId,callback){
			obj.ID=driverId;
			scCluster.driver.createDriver(req,obj,callback);
		});
		
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			operateLogger.driver.createDriver(req.user,obj);
			res.status(201).end();
		}
	});
});

function createDeleteTasks(connection,tasks,driverId){
	tasks.push(function(cbk){
		var sql='delete from config.DRIVER_PARAM where ID=?'; 
		connection.query(sql,[driverId], function(err, result) {
			if(err){
				cbk(err);
			}else{
				cbk(null);
			}
		});
	});
}

function getDriverById(connection,driverId, callback) {
	var sql = "select d.ID,d.NAME,d.MODEL,d.POSTION,d.FSU,p.PROP_NAME,p.PROP_VALUE " +
	"from config.DRIVER d left join config.DRIVER_PARAM p on d.ID=p.ID where d.ID=?";
	connection.query(sql, [ driverId ], function(error, objects) {
		if (error) {
			callback(error);
			return;
		}
		var drivers = makeDrivers(objects);
		if (drivers.length == 0) {
			callback("not found:" + driverId);
		} else {
			callback(null, drivers[0]);
		}
	});
}

app.put('/drivers/:id', function(req, res) {
	var driverId=parseInt(req.params.id,10);
	var obj = req.body;
	var old=null;
	db.doTransaction(function(connection) {
		var tasks= [function(callback){
			var sql='select count(*) as ct from config.SIGNAL where DRIVER_ID=?';
			connection.query(sql, [driverId], function(err, result) {
				if(err){
				callback(err);
				}else{
					if(result[0].ct>0){
						callback("has signal cannot delete");
					}else{
						callback();
					}
				}
			});
		}, function(callback) {
			var sql='update config.DRIVER set NAME=?,FSU=?,MODEL=?,POSTION=? where ID=?';
			connection.query(sql, [obj.NAME,obj.FSU,obj.MODEL,obj.POSTION,driverId], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null);
				}
			});
		}];
		createDeleteTasks(connection,tasks,driverId);
		tasks.push(function(callback){
			callback(null,driverId);
		});
		createParamInsertTasks(connection,tasks,obj.params);
		tasks.push(function(driverId,callback){
			obj.ID=driverId;
			scCluster.driver.updateDriver(req,obj,old,callback);
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
			operateLogger.driver.updateDriver(req.user,obj);
		}
	});
});

app.delete('/drivers/:id', function(req, res) {
	var driverId=parseInt(req.params.id,10);
	var old=null;
	db.doTransaction(function(connection) {
		var tasks=[function(callback){
			getDriverById(connection,driverId,function(err,reslut){
				if(err){
					callback(err);
				}else{
					old=reslut;
					callback();
				}
			});
		},function(callback){
			getDriverById(connection,driverId,function(err,reslut){
				if(err){
					callback(err);
				}else{
					old=reslut;
					callback();
				}
			});
		}];
		createDeleteTasks(connection,tasks,driverId);
		tasks.push( function(callback) {
			var sql='delete from config.DRIVER where ID=?';
			connection.query(sql, [driverId], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback();
				}
			});
		});
		tasks.push(function(callback){
			scCluster.driver.removeDriver(req,old,callback);
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
			operateLogger.driver.removeDriver(req.user,old);
		}
	});
});

module.exports = app;
