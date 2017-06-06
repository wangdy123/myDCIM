var config = require('dcim-config');
var db = require('dcim-db');
var util = require("dcim-util");
var objectDao=require('dcim-object-dao')

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public', {
	maxAge : config.config.fileMaxAge * 3600 * 24 * 1000
}));


for(var type in config.objectTypes){
	require("./"+config.objectTypes[type].namespace).initRequest(app);
}

app.get('/objectNodes/:id', function(req, res) {
		var sql = 'select ID,OBJECT_TYPE,NAME from config.OBJECT where ID=?';
		db.pool.query(sql, [ req.params.id ], function(error, objects, fields) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
				return;
			} 
				if(objects.length===0){
					res.status(500).send("not found:"+req.params.id);
					return;
				}
				var namespace=config.objectTypes[objects[0].OBJECT_TYPE].namespace;
				objectDao[namespace].getById(db.pool,req.params.id,function(error,result){
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
			var sql ='INSERT INTO config.OBJECT(NAME,OBJECT_TYPE)values(?,?)';
			connection.query(sql, [ req.body.NAME, req.body.OBJECT_TYPE ], function(err, result) {
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
			var sql ='update config.OBJECT set NAME=? where ID=?';
			connection.query(sql, [ req.body.NAME,req.params.id], function(err, result) {
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
						callback("has child ,can't delete");
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

module.exports = app;