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

app.get('/fsus', function(req, res) {
	var sql = "select f.ID,f.NAME,f.CODE,f.MODEL,f.POSTION,p.PROP_NAME,p.PROP_VALUE " +
			"from config.FSU f left join config.FSU_PARAM p on f.ID=p.ID where f.POSTION=?";
	db.pool.query(sql,[req.query.position], function(error, objects) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			var fsus=[];
			objects.forEach(function(item){
				var fsu=util.findFromArray(fsus,"ID",item.ID);
				if(!fsu){
					fsu={
							ID:	item.ID,
							NAME:	item.NAME,
							CODE:	item.CODE,
							MODEL:	item.MODEL,
							POSTION:	item.POSTION,
							params:{}
					};
					fsus.push(fsu);
				}
				if(item.PROP_NAME){
					fsu.params[item.PROP_NAME]=item.PROP_VALUE;
				}
			});
			res.send(fsus);
		}
	});
});
app.get('/models', function(req, res) {
	var dirName = path.join(process.cwd(), 'conf', 'fsu_model');
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
	var fileName = path.join(process.cwd(), 'conf', 'fsu_model', req.params.model + '.json');
	res.sendFile(fileName);
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
	var params=obj.params;
    delete obj.params;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
			var sql='INSERT INTO config.FSU set ?'; 
			connection.query(sql,obj, function(err, result) {
				if(err){
				callback(err);
				}else{
					callback(null,result.insertId);
				}
			});
		}];
		createParamInsertTasks(connection,tasks,params);
		tasks.push(function(fsuId,callback){
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
app.put('/fsus/:id', function(req, res) {
	var fsuId=parseInt(req.params.id,10);
	var obj = req.body;
	var params=obj.params;
    delete obj.params;
	db.doTransaction(function(connection) {
		var tasks= [ function(callback) {
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
		createParamInsertTasks(connection,tasks,params);
		tasks.push(function(fsuId,callback){
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

app.delete('/fsus/:id', function(req, res) {
	var fsuId=parseInt(req.params.id,10);
	db.doTransaction(function(connection) {
		var tasks=[];
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
			res.status(200).end();
		}
	});
});

module.exports = app;
