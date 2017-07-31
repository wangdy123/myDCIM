var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var config = require('dcim-config');

// TODO::获取对象实时状态 
app.get('/regionStatus/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var status = {
		ID : objectId,
		buildingCount : 2,
		roomCount : 3,
		cabinetCount:100,
		alarmLevel1Count:5,
		alarmLevel2Count:2,
		alarmLevel3Count:22,
		alarmLevel4Count:1
	};
	res.send(status);
});

// TODO::获取子对象实时状态
app.get('/childStatus', function(req, res) {
	var objectId = parseInt(req.query.id, 10);
	var status = {
		ID : objectId,
		childObject : []
	};
	var sql = 'select o.ID,o.OBJECT_TYPE,o.CODE,o.NAME,p.PARENT_ID from config.OBJECT o '
			+ 'join config.POSITION_RELATION p on p.ID=o.ID where p.PARENT_ID=?';
	db.pool.query(sql, [ objectId ], function(error, objects, fields) {
		if (!error) {
			for ( var i = 0; i < objects.length; i++) {
				status.childObject.push({
					ID : objects[i].ID,
					alarmLevel1Count:5,
					alarmLevel2Count:2,
					alarmLevel3Count:22,
					alarmLevel4Count:1
				});
			}
		}
		res.send(status);
	});
});

app.get('/detailPage/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);

});


