var app = require('./app');
var permissions = require('dcim-permissions');
var util = require('dcim-util');
var db = require('dcim-db');


app.put('/finishAlarm', function(req, res) {
	var sql = 'update alarm set is_finished=?,end_time=?,reason=? where object_id=? and signal_id=? and alarm_begin=?';
	permissions.checkUserPassword(req, res, req.body.password, function(err, user) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var alarms = req.body.alarms;
			var params = [];
			for (var i = 0; i < alarms.length; i++) {
				params.push([ true, new Date().getTime(), alarms[i].reason, alarms[i].object_id, alarms[i].signal_id,
						util.date_parse(alarms[i].alarm_begin).getTime() ]);
			}
			db.executeRecordSqls(sql, params, function(err) {
				if (err) {
					res.status(500).send(err);
					logger.error(err);
				} else {
					res.status(204).end();
				}
			});
		}
	});
});

app.put('/alarmReason', function(req, res) {
	var sql = 'update alarm set reason=? where object_id=? and signal_id=? and alarm_begin=?';
	permissions.checkUserPassword(req, res, req.body.password, function(err, user) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var alarms = req.body.alarms;
			var params = [];
			for (var i = 0; i < alarms.length; i++) {
				params.push([ alarms[i].reason, alarms[i].object_id, alarms[i].signal_id,
						util.date_parse(alarms[i].alarm_begin).getTime() ]);
			}
			db.executeRecordSqls(sql, params, function(err) {
				if (err) {
					res.status(500).send(err);
					logger.error(err);
				} else {
					res.status(204).end();
				}
			});
		}
	});
});

app.put('/alarmAck', function(req, res) {
	var sql = 'update alarm set is_acked=?,ack_time=?,ack_user=?,reason=? '
			+ 'where object_id=? and signal_id=? and alarm_begin=?';
	permissions.checkUserPassword(req, res, req.body.password, function(err, user) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var alarms = req.body.alarms;
			var params = [];
			for (var i = 0; i < alarms.length; i++) {
				params.push([ true, new Date().getTime(), user.NAME, alarms[i].reason, alarms[i].object_id,
						alarms[i].signal_id, util.date_parse(alarms[i].alarm_begin).getTime() ]);
			}
			db.executeRecordSqls(sql, params, function(err) {
				if (err) {
					res.status(500).send(err);
					logger.error(err);
				} else {
					res.status(204).end();
				}
			});
		}
	});
});
