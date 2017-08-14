var app = require('./app');
var db = require('dcim-db');
var common = require('dcim-common');

app.get('/profile/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var profile = {};
	var tasks = [];
	tasks.push(function(cbk) {
		common.getBuildingCount(db.pool, objectId, function(err, count) {
			if (!err) {
				profile.buildingCount = count;
			}
			cbk(err);
		});
	});
	tasks.push(function(cbk) {
		common.getRoomCount(db.pool, objectId, function(err, count) {
			if (!err) {
				profile.roomCount = count;
			}
			cbk(err);
		});
	});
	tasks.push(function(cbk) {
		common.getCabinetCount(db.pool, objectId, function(err, count) {
			if (!err) {
				profile.cabinetCount = count;
			}
			cbk(err);
		});
	});

	res.send(profile);
});

app.get('/status/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	common.getAlarmCount(db.pool, objectId, function(err, status) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			res.send(status);
		}
	});
});

var async = require("async");
app.get('/childStatus', function(req, res) {
	var objectId = parseInt(req.query.id, 10);
	var status = {
		childObject : []
	};
	var sql = 'select o.ID,o.OBJECT_TYPE,o.CODE,o.NAME,p.PARENT_ID from config.OBJECT o '
			+ 'join config.POSITION_RELATION p on p.ID=o.ID where p.PARENT_ID=?';
	db.pool.query(sql, [ objectId ], function(error, objects, fields) {
		if (error) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var tasks = [];
			objects.forEach(function(item) {
				tasks.push(function(cbk) {
					common.getAlarmCount(db.pool, item.ID, cbk);
				});
			});
			async.parallel(tasks, function(err, results) {
				status.childObject = results;
				res.send(status);
			});
		}
	});
});

//[{objectId,signalId}]
app.post('/realtimeValue', function(req, res) {
	var nodeSignalIds = req.body;
	common.getRealtimeValue(nodeSignalIds, function(err, values) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			res.send(values);
		}
	});
});
