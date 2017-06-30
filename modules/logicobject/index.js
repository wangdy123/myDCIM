var db = require('dcim-db');
var util = require("dcim-util");
var objectDao = require('dcim-object-dao')

var express = require('express');
var app = express();
var config = require('dcim-config');

module.exports = app;

for(var type in config.objectTypes){
	require("./"+config.objectTypes[type].namespace).initRequest(app);
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
				res.send(objects);
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
				res.send(objects);
			}
		});
	} else {
		var sql = 'select o.ID,o.OBJECT_TYPE,o.NAME,o.CODE,p.PARENT_ID from config.OBJECT o '
				+ 'left join config.POSITION_RELATION p on p.ID=o.ID where o.ID=?';
		db.pool.query(sql, [ config.config.root_object_id ], function(error, objects, fields) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(objects);
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
		objectDao.objectExt.createInsertTasks(connection,tasks,req.body.properties);
		
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
		objectDao.objectExt.createInsertTasks(connection,tasks,req.body.properties);
		
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

app.delete('/objectNodes/:id', function(req, res) {
	db.doTransaction(function(connection) {
		var tasks=[];
		tasks.push(function(callback) {
			var sql ='select ID from config.POSITION_RELATION where PARENT_ID=?';
			connection.query(sql, [ req.params.id], function(err, result) {
				if(err){
				callback(err);
				}else{
					if(result.length>0){
						callback("包含子对象，不能删除！");
					}
					else{
						callback();
					}
				}
			});
		});
		tasks.push(function(callback) {
			var sql ='delete from config.OBJECT where ID=?';
			connection.query(sql, [ req.params.id], function(err, result) {
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
			res.status(200).end();
		}
	});
});
