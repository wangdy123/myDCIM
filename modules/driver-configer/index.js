var db = require('dcim-db');
var util = require("dcim-util");

var express = require('express');
var app = express();
var config = require('dcim-config');
var path = require('path');
var fs = require('fs');

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));

module.exports = app;

app.get('/drivers', function(req, res) {
	var sql = "select d.ID,d.NAME,d.MODEL,d.POSTION,d.FSU,p.PROP_NAME,p.PROP_VALUE " +
			"from config.DRIVER d left join config.DRIVER_PARAM p on d.ID=p.ID where d.POSTION=?";
	db.pool.query(sql,[req.query.position], function(error, objects) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
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
			res.send(drivers);
		}
	});
});
app.get('/models', function(req, res) {
	var dirName = path.join(process.cwd(), 'conf', 'driver_model');
	fs.readdir(dirName, function(err,files){
		 if(err){
			logger.error(err);
			res.status(500).send(err);
		 }else{
			 var models=[];
			 files.forEach(function(file){
				 var index=file.lastIndexOf('.json');
				 if(index>0){
					 var name=file.substr(0,index);
					 models.push({name:name,model:name});
				 }
			 });
			 res.send(models);
		 }
	});
});
app.get('/params/:model', function(req, res) {
	var fileName = path.join(process.cwd(), 'conf', 'driver_model', req.params.model + '.json');
	res.sendFile(fileName);
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
	var params=obj.params;
    delete obj.params;
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
		createParamInsertTasks(connection,tasks,params);
		tasks.push(function(driverId,callback){
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
app.put('/drivers/:id', function(req, res) {
	var driverId=parseInt(req.params.id,10);
	var obj = req.body;
	var params=obj.params;
    delete obj.params;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
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
		createParamInsertTasks(connection,tasks,params);
		tasks.push(function(driverId,callback){
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

app.delete('/drivers/:id', function(req, res) {
	var driverId=parseInt(req.params.id,10);
	db.doTransaction(function(connection) {
		var tasks=[];
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
