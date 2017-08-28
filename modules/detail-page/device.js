var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var config = require('dcim-config');
var common = require('dcim-common');
var async = require("async");

//{objectId,requestIds:[{objectId,signalId}]}
app.post('/deviceStatus', function(req, res) {
	var objectId = parseInt(req.body.objectId, 10);
	var tasks = [];
	result = {};
	tasks.push(function(cbk) {
		common.getAlarmCount(db.pool, objectId, function(err, alarmCount) {
			if (!err) {
				result.alarmCount = alarmCount;
			}
			cbk();
		});
	});
	tasks.push(function(cbk) {
		common.getRealtimeValue(req.body.requestIds, function(err, signalValues) {
			if (!err) {
				result.signalValues = signalValues;
			}
			cbk();
		});
	});

	async.parallel(tasks, function(err, results) {
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else {
			res.send(result);
		}
	});
});