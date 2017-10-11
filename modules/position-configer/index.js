var config = require('dcim-config');

var express = require('express');
var app = express();
var scCluster = require('dcim-sc-cluster');

app.use(express.static(__dirname + '/public', {
	maxAge : config.fileMaxAge * 3600 * 24 * 1000
}));


module.exports = app;

var db = require('dcim-db');


function findChildrenCode(code,codes){
	for(var i=0;i<codes.length;i++){
		if(codes[i].code==code){
			return codes[i];
		}
	}
}

function createCodeArray(codeTrees){
	var codes=[];
	codeTrees.forEach(function(code){
		codes.push({
			code :code.code,
			name : code.name
		});
	});
	return codes;
}
function getChildrenCode(region){
	if(region.REGION_TYPE===0){
		return createCodeArray(config.reginCode);
	}
	if(region.REGION_TYPE>=3){
		return [{
				code :region.CODE,
				name : region.NAME
			}];
	}
	if(region.REGION_TYPE===1){
		var root=findChildrenCode(region.CODE.slice(0, 2) + "0000",config.reginCode);
		if(root){
			return createCodeArray(root.children);
		}
		return [];
	}
	var root=findChildrenCode(region.CODE.slice(0, 2) + "0000",config.reginCode);
	if(!root){
		return [];
	}
	var cityCode=findChildrenCode(region.CODE.slice(0, 4) + "00",root.children);
	if(!cityCode){
		return [];
	}
	return createCodeArray(cityCode.children);
}
app.get('/regionCode', function(req, res) {
		var sql = 'select o.ID,o.NAME,o.CODE,a.REGION_TYPE from config.OBJECT o '
			+ 'join config.ADMINISTRATIVE_REGION a on o.ID=a.ID where o.ID=?';
		db.pool.query(sql, [ req.query.id ], function(error, objects) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
				return;
			} 
				if(objects.length<1){
					res.send([]);
					return;
				}
				res.send(getChildrenCode(objects[0]));
			
		});

});

var path = require('path');
app.get('/defaultSignals', function(req, res) {
	var fileName=path.join(process.cwd(), 'conf', 'signal', 'nodeType'+req.query.nodeType + '.json');
	if(req.query.deviceType){
		fileName = path.join(process.cwd(), 'conf', 'signal', req.query.deviceType + '.json');
	}
	res.sendFile(fileName);
});

var fs = require('fs');
app.get('/device/params/:deviceType', function(req, res) {
	var fileName = path.join(process.cwd(), 'conf', 'device_type_ext', req.params.deviceType + '.json');
	fs.exists(fileName, function(exists){
		if(exists){
			res.sendFile(fileName);			
		}else{
			res.send([]);
		}
	});
});

app.get('/signalFuncModel', function(req, res) {
	scCluster.signal.getFuncModels(req, function(err,result){
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

app.get('/signalFuncParams/:model', function(req, res) {
	scCluster.signal.getFuncParams(req,req.params.model, function(err,result){
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else{
			res.send(result);
		}
	});
});

app.get('/signalConditionModel', function(req, res) {
	scCluster.signal.getConditionModels(req, function(err,result){
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
app.get('/signalConditionParams/:model', function(req, res) {
	scCluster.signal.getConditionParams(req,req.params.model, function(err,result){
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else{
			res.send(result);
		}
	});
});




