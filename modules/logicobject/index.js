var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var objectDao = require('dcim-object-dao');
var async = require("async");

var config = require('dcim-config');

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

app.get('/objectNodes/:id', function(req, res) {
	var sql = 'select ID,OBJECT_TYPE,NAME,CODE from config.OBJECT where ID=?';
	db.pool.query(sql, [ req.params.id ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
			return;
		}
		if (objects.length === 0) {
			res.status(500).send("not found:" + req.params.id);
			return;
		}

		var namespace = config.objectTypes[objects[0].OBJECT_TYPE].namespace;
		objectDao[namespace].getById(db.pool, req.params.id, function(error, result) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(result);
			}
		});
	});
});

app.post('/objectNodes', function(req, res) {
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			var sql ='INSERT INTO config.OBJECT(NAME,CODE,OBJECT_TYPE)values(?,?,?)';
			connection.query(sql, [ req.body.NAME, req.body.CODE, req.body.OBJECT_TYPE ], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null,result.insertId);
				}
			});
		},function(nodeId,callback) {
			var sql ='INSERT INTO config.POSITION_RELATION(ID,PARENT_ID)values(?,?)';
			connection.query(sql, [ nodeId, req.body.PARENT_ID ], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null,nodeId);
				}
			});
		} ];
		var namespace=config.objectTypes[req.body.OBJECT_TYPE].namespace;
		objectDao[namespace].createInsertTasks(connection,tasks,req.body);
		objectDao.objectExt.createInsertTasks(connection,tasks,req.body.params);
		if(req.body.DEVICE_TYPE){
			tasks.push(function(nodeId,callback){
				objectDao.signal.createSignalByTemplate(req.body.DEVICE_TYPE,nodeId,req.body.DRIVER_ID,req.body.params,function(err,signals){
					if(err){
						callback(err);
						}else{
							var signalTask=[];
							createInsertSignalsTasks(connection,signalTask,signals);
							async.waterfall(signalTask, function(err,result){
								callback(nodeId,err);
							});
						}
				});
				
			});
		}
		tasks.push(function(nodeId,callback){
			callback();
		});
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

app.put('/objectNodes/:id', function(req, res) {
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			var sql ='update config.OBJECT set NAME=?,CODE=? where ID=?';
			connection.query(sql, [ req.body.NAME,req.body.CODE,req.params.id], function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null,req.params.id);
				}
			});
		}];
		var namespace=config.objectTypes[req.body.OBJECT_TYPE].namespace;
		objectDao[namespace].createUpdateTasks(connection,tasks,req.body);
		objectDao.objectExt.createDeleteTasks(connection,tasks,req.params.id);
		objectDao.objectExt.createInsertTasks(connection,tasks,req.body.params);
		
		tasks.push(function(nodeId,callback){
			callback();
		});
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

function deleteChild(connection,childObjects,callback){
	if(childObjects.length<=0){
		callback();
		return;
	}
	var tasks=[];
	childObjects.forEach(function(object){
		tasks.push(function(cb){
			deleteObject(connection,object, function(err,result){
				cb(err);
			});
		});
	});
	async.parallel(tasks, function(err,result){
		callback(err);
	});
}
function deleteObject(connection,nodeObject,callback){
	var tasks=[];
	tasks.push(function(cb) {
		var sql = 'select o.ID,o.OBJECT_TYPE,o.CODE,o.NAME,p.PARENT_ID from config.OBJECT o '
			+ 'join config.POSITION_RELATION p on p.ID=o.ID where p.PARENT_ID=?';
		connection.query(sql, [ nodeObject.ID], function(err, results) {
			if(err){
				cb(err);
			}else{
				deleteChild(connection,results,cb);
			}
		});
	});
	
	objectDao.signal.createDeleteByParentTasks(connection,tasks,nodeObject.ID);
	
	var namespace=config.objectTypes[nodeObject.OBJECT_TYPE].namespace;
	objectDao[namespace].createDeleteTasks(connection,tasks,nodeObject.ID);
	
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
	tasks.push(function(cb) {
		var sql ='delete from config.OBJECT_EXT where ID=?';
		connection.query(sql, [ nodeObject.ID], function(err,result){
			cb(err);
		});
	});
	tasks.push(function(cb) {
		
		var sql ='delete from config.POSITION_RELATION where ID=?';
		connection.query(sql, [ nodeObject.ID], function(err,result){
			cb(err);
		});
	});
	tasks.push(function(cb) {
		var sql ='delete from config.OBJECT where ID=?';
		connection.query(sql, [ nodeObject.ID], function(err,result){
			cb(err);
		});
	});
	async.waterfall(tasks, function(err,result){
		callback(err);
	});
}

app.delete('/objectNodes/:id', function(req, res) {
	db.doTransaction(function(connection) {
		var tasks=[];
		var nodeObject=null;
		tasks.push(function(callback) {
			var sql = 'select ID,OBJECT_TYPE,NAME,CODE from config.OBJECT where ID=?';
			connection.query(sql, [ req.params.id], function(err, result) {
				if(err){
				callback(err);
				}else{
					if (result.length === 0) {
						callback();
					}else{
						deleteObject(connection,result[0], function(err,result){
							callback(err);
						});
					}
				}
			});
		});
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(200).end();
		}
	});
});
