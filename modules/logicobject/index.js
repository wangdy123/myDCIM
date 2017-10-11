var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var objectDao = require('dcim-object-dao');
var async = require("async");

var config = require('dcim-config');
var scCluster = require('dcim-sc-cluster');
var operateLogger = require('dcim-operate-logger');

require('./signal');

module.exports = app;

for(var type in config.objectTypes){
	require("./"+config.objectTypes[type].namespace).initRequest(app);
}


function getCompleteObjects(objects,callback){
	var tasks = [];
	function addTask(obj) {
		tasks.push(function(cb) {
			var namespace = config.objectTypes[obj.OBJECT_TYPE].namespace;
			objectDao[namespace].getById(db.pool, obj.ID, function(err,result){
				if(err){
					cb(null,obj);
				}else{
					cb(null,result);
				}
			});
		});
	}
	for (var i = 0; i < objects.length; i++) {
		addTask(objects[i]);
	}
	async.parallel(tasks,callback);
}

var common = require('dcim-common');

function getObjectFullname(objects,callback){
	var tasks = [];
	objects.forEach(function(obj){
		tasks.push(function(cb) {
			common.getObjectPathName(0,obj.ID,function(err,fullname){
				obj.FULL_NAME=fullname;
				cb();
			});
		});
	});

	async.parallel(tasks,callback);
}
app.get('/seach', function(req, res) {
		var sql = 'select o.ID,o.OBJECT_TYPE,o.NAME,o.CODE,p.PARENT_ID from config.OBJECT o '
				+ 'left join config.POSITION_RELATION p on p.ID=o.ID where o.NAME like(?) or o.CODE like(?)';
		var param="%"+req.query.value+"%";
		db.pool.query(sql, [ param,param ], function(error, objects, fields) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				getCompleteObjects(objects,function(err,results){
					if (err) {
						logger.error(err);
						res.status(500).send(err);
					}else{
						getObjectFullname(results,function(err){
							res.send(results);
						});
					}
				});
			}
		});
});

app.get('/objectNodes', function(req, res) {
	if (req.query.id) {
		var sql = 'select o.ID,o.OBJECT_TYPE,o.CODE,o.NAME,p.PARENT_ID from config.OBJECT o '
				+ 'join config.POSITION_RELATION p on p.ID=o.ID where p.PARENT_ID=?';
		db.pool.query(sql, [ req.query.id ], function(error, objects, fields) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				getCompleteObjects(objects,function(err,results){
					if (err) {
						logger.error(err);
						res.status(500).send(err);
					}else{
						res.send(results);
					}
				});
			}
		});
	} else {
		var sql = 'select o.ID,o.OBJECT_TYPE,o.NAME,o.CODE,p.PARENT_ID from config.OBJECT o '
				+ 'left join config.POSITION_RELATION p on p.ID=o.ID where o.ID=?';
		db.pool.query(sql, [ config.root_object_id ], function(error, objects, fields) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				getCompleteObjects(objects,function(err,results){
					if (err) {
						logger.error(err);
						res.status(500).send(err);
					}else{
						res.send(results);
					}
				});
			}
		});
	}
});

function getNodeById(connection,id,callback){
	var sql = 'select ID,OBJECT_TYPE,NAME,CODE from config.OBJECT where ID=?';
	connection.query(sql, [ id ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found:" + id);
			return;
		}

		var namespace = config.objectTypes[objects[0].OBJECT_TYPE].namespace;
		objectDao[namespace].getById(connection, id, function(error, result) {
			if (error) {
				callback(error);
			} else {
				callback(null,result);
			}
		});
	});
}
app.get('/objectNodes/:id', function(req, res) {
	getNodeById(db.pool,req.params.id,function(error,result){
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(result);
		}
	});
	
});

function createSignals(connection,nodeId,signals,callback){
	var signalTask=[];
	objectDao.signal.createInsertSignalsTasks(connection,signalTask,signals);
	async.waterfall(signalTask, function(err,result){
		callback(err,nodeId);
	});
}
app.post('/objectNodes', function(req, res) {
	var nodeSignals=[];
	var obj=req.body;
	db.doTransaction(function(connection) {
		var tasks= [];
		objectDao.node.createInsertTask(connection,tasks,obj);
			
		tasks.push(function(nodeId,callback){
			objectDao.signal.createSignalByTemplate(obj,nodeId,obj.DRIVER_ID,obj.params,function(err,signals){
				if(err){
					callback(err);
					}else{
						nodeSignals=signals;
						createSignals(connection,nodeId,signals,callback);
					}
			});	
		});
		
		tasks.push(function(nodeId,callback){
			obj.ID=nodeId;
			scCluster.node.createNode(req,obj,nodeSignals,callback);
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			operateLogger.node.createNode(req.user,obj);
			res.status(201).end();
		}
	});

});

app.put('/objectNodes/:id', function(req, res) {
	var obj=req.body;
	obj.ID=req.params.id;
	var old=null;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			getNodeById(connection,obj.ID,function(error,result){
			if (error) {
				callback(error);
			} else {
				old=result;
				callback();
			}
		});
	}];
		objectDao.node.createUpdateTask(connection,tasks,obj);
		tasks.push(function(nodeId,callback){
			scCluster.node.updateNode(req,obj,old,callback);
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			operateLogger.node.updateNode(req.user,obj,old);
			res.status(204).end();
		}
	});
});

function deleteObject(connection,nodeObject,callback){
	var tasks=[];
	objectDao.signal.createDeleteByParentTasks(connection,tasks,nodeObject.ID);

	tasks.push(function(cb) {
		var sql ='delete from config.FSU where POSTION=?';
		connection.query(sql, [ nodeObject.ID], function(err,result){
			cb(err);
		});
	});
	tasks.push(function(cb) {
		var sql ='delete from config.DRIVER where POSTION=?';
		connection.query(sql, [ nodeObject.ID], function(err,result){
			cb(err);
		});
	});
	objectDao.node.createDeleteTask(connection,tasks,nodeObject);
	async.waterfall(tasks, function(err,result){
		callback(err);
	});
}

app.delete('/objectNodes/:id', function(req, res) {
	var old=null;
	var parent=null;
	db.doTransaction(function(connection) {
		var tasks=[];
		tasks.push(function(callback) {
			var sql = 'select o.ID,o.OBJECT_TYPE,o.CODE,o.NAME,p.PARENT_ID from config.OBJECT o '
				+ 'join config.POSITION_RELATION p on p.ID=o.ID where p.PARENT_ID=?';
			connection.query(sql, [req.params.id], function(err, results) {
				if(err){
					callback(err);
				}else{
					if(results.length>0){
						callback("not empty cannot delete");
					}else{
						callback();
					}
				}
			});
		});
		tasks.push(function(callback) {
			getNodeById(connection,req.params.id,function(error,result){
				if (error) {
					callback(error);
				} else {
					old=result;
					deleteObject(connection,old,callback)
				}
			});
		});
		tasks.push(function(callback) {
			getNodeById(connection,old.PARENT_ID,function(error,result){
				if (error) {
					parent=null;
					callback();
				} else {
					parent=result;
					callback();
				}
			});
		});
		tasks.push(function(callback){
			scCluster.node.removeNode(req,old,parent,callback);
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			operateLogger.node.removeNode(req.user,old);
			res.status(200).end();
		}
	});
});
