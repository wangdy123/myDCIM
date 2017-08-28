var app = require('./app');
var permissions = require('dcim-permissions');
var util = require('dcim-util');
var db = require('dcim-db');
var operateLogger = require('dcim-operate-logger');
var async = require("async");

var common = require("dcim-common");


function selectAlarm(conn, sequences, finishCbk) {
	var sql = 'select * from record.alarm where sequence in(' + sequences.join(',') + ')';
	conn.query(sql, function(err, results) {
		if (err) {
			finishCbk(err);
		} else {
			finishCbk(null, results);
		}
	});
}
function deleteAlarm(conn, sequences, finishCbk) {
	var sql = 'delete from record.alarm where sequence in(' + sequences.join(',') + ')';
	conn.query(sql, function(err, results) {
		if (err) {
			finishCbk(err);
		} else {
			finishCbk(null);
		}
	});
}

function setAlarmFinised(alarms, finishInfo, user, finishCbk) {
	var sql = 'insert into alarm (sequence,object_id,signal_id,alarm_type,device_type,alarm_begin,alarm_level,end_time,'
			+ 'object_name,alarm_name,alarm_value,alarm_desc,alarm_status,ack_time,reason,ack_user)'
			+ 'values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	var params = [];
	for (var i = 0; i < alarms.length; i++) {
		var alarm = alarms[i];
		var info = util.findFromArray(finishInfo, "sequence", alarm.sequence);
		if (info) {
			alarm.reason = info.reason;
		}
		if (!alarm.ack_time) {
			alarm.ack_time = new Date();
			alarm.ack_user = user.NAME;
		}
		common.alarmFinished(alarm);
		var param = [ alarm.sequence, alarm.object_id, alarm.signal_id, alarm.alarm_type, alarm.device_type,
				alarm.alarm_begin.getTime(), alarm.alarm_level, new Date().getTime(), alarm.object_name,
				alarm.alarm_name, alarm.alarm_value, alarm.alarm_desc, alarm.alarm_status, alarm.ack_time.getTime(),
				alarm.reason, alarm.ack_user ];
		params.push(param);
	}
	db.executeRecordSqls(sql, params, finishCbk);
}

app.put('/finishAlarm', function(req, res) {
	var sql = 'update alarm set is_finished=?,end_time=?,reason=? where sequence=? ';
	permissions.checkUserPassword(req, res, req.body.password, function(err, user) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			db.doTransaction(function(connection) {
				var tasks = [];
				var finishInfo = req.body.alarms;
				var sequences = [];
				finishInfo.forEach(function(item) {
					sequences.push(item.sequence);
				});
				var alarms = [];
				tasks.push(function(cb) {
					selectAlarm(connection, sequences, function(err, results) {
						if (err) {
							cb(err);
						} else {
							alarms = results;
							cb();
						}
					});
				});
				tasks.push(function(cb) {
					deleteAlarm(connection, sequences, cb);
				});
				tasks.push(function(cb) {
					setAlarmFinised(alarms, finishInfo, user, function(err) {
						cb(err);
					});
				});
				return tasks;
			}, function(err) {
				if (err) {
					res.status(500).send(err);
					logger.error(err);
				} else {
					operateLogger.loggerSetAlarmFinished(user, req.body.alarms);
					res.status(204).end();
				}
			});
		}
	});
});

app.put('/alarmReason', function(req, res) {
	function makeTask(connection, alarm, user) {
		var sql = 'update record.alarm set reason=? where sequence=?';
		return function(callback) {
			connection.query(sql, [ alarm.reason, alarm.sequence ], function(err, result) {
				if (err) {
					callback(err);
				} else {
					callback();
				}
			});
		};
	}

	permissions.checkUserPassword(req, res, req.body.password, function(err, user) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			db.doTransaction(function(connection) {
				var tasks = [];
				var alarms = req.body.alarms;
				for (var i = 0; i < alarms.length; i++) {
					tasks.push(makeTask(connection, alarms[i], user));
				}
				return tasks;
			}, function(err) {
				if (err) {
					res.status(500).send(err);
					logger.error(err);
				} else {
					operateLogger.loggerSetAlarmReason(user, req.body.alarms);
					res.status(204).end();
				}
			});
		}
	});
});

function moveFinishedAlarm(connection, ackInfos, finishCbk) {
	var sql = 'insert into alarm (sequence,object_id,signal_id,alarm_type,device_type,alarm_begin,alarm_level,end_time,'
			+ 'object_name,alarm_name,alarm_value,alarm_desc,alarm_status,ack_time,reason,ack_user)'
			+ 'values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	var sequences = [];
	ackInfos.forEach(function(item) {
		sequences.push(item.sequence);
	});
	var tasks = [];
	var alarms = [];
	tasks.push(function(cb) {
		selectAlarm(connection, sequences, function(err, results) {
			if (err) {
				cb(err);
			} else {
				alarms = results;
				cb();
			}
		});
	});
	var finishedAlarms = [];
	tasks.push(function(cb) {
		var finishedSequence = [];
		alarms.forEach(function(alarm) {
			if (alarm.end_time) {
				finishedSequence.push(alarm.sequence);
				finishedAlarms.push(alarm);
			}
		});
		if (finishedSequence.length <= 0) {
			cb();
		} else {
			deleteAlarm(connection, finishedSequence, cb);
		}
	});
	tasks.push(function(cb) {
		var params = [];
		finishedAlarms.forEach(function(alarm) {
			var param = [ alarm.sequence, alarm.object_id, alarm.signal_id, alarm.alarm_type, alarm.device_type,
					alarm.alarm_begin.getTime(), alarm.alarm_level, alarm.end_time.getTime(), alarm.object_name,
					alarm.alarm_name, alarm.alarm_value, alarm.alarm_desc, alarm.alarm_status,
					alarm.ack_time.getTime(), alarm.reason, alarm.ack_user ];
			params.push(param);
		});
		db.executeRecordSqls(sql, params, cb);
	});
	async.waterfall(tasks,finishCbk);
}

app.put('/alarmAck', function(req, res) {
	function makeTask(connection, alarm, user) {
		var sql = 'update record.alarm set ack_time=?,ack_user=?,reason=? where sequence=? ';
		return function(callback) {
			connection.query(sql, [ new Date(), user.NAME, alarm.reason, alarm.sequence ], function(err, result) {
				if (err) {
					callback(err);
				} else {
					callback();
				}
			});
		};
	}
	permissions.checkUserPassword(req, res, req.body.password, function(err, user) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			db.doTransaction(function(connection) {
				var tasks = [];
				var alarms = req.body.alarms;
				for (var i = 0; i < alarms.length; i++) {
					tasks.push(makeTask(connection, alarms[i], user));
				}

				tasks.push(function(cb) {
					moveFinishedAlarm(connection, alarms, function(err){
						cb(err);
					});
				});
				return tasks;
			}, function(err) {
				if (err) {
					res.status(500).send(err);
					logger.error(err);
				} else {
					common.alarmAck(user.NAME,req.body.alarms);
					operateLogger.loggerAckAlarm(user, req.body.alarms);
					res.status(204).end();
				}
			});
		}
	});
});
