var config = require('dcim-config');

var express = require('express');
var app = express();

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
	var fileName = path.join(process.cwd(), 'conf', 'signal', req.query.deviceType + '.json');
	res.sendFile(fileName);
});

