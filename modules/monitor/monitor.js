var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var config = require('dcim-config');

// TODO::获取对象实时状态
app.get('/status/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var status = {
		ID : objectId,
		alarmCount : 2,
		maxAlarmLevel : 3
	};
	res.send(status);
});

// TODO::获取子对象实时状态
app.get('/status', function(req, res) {
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
					alarmCount : 2,
					maxAlarmLevel : 3
				});
			}
		}
		res.send(status);
	});
});