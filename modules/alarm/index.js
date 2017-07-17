var app = require('./app');
var expressWs = require('express-ws')(app);
var db = require('dcim-db');
var util = require('dcim-util');
var permissions = require('dcim-permissions');
var config = require('dcim-config');

require('./self-diagnosis');
// require('./department')
// require('./personnel')
// require('./account')

app.ws('/alarm-ws', function(ws, req) {
	ws.on('message', function(msg) {
		console.log('_message');
		console.log(msg);
		ws.send('echo:' + msg);
	});
	require('dcim-redis').subscribe('alarm-message', function(topic, msg) {
		ws.send(msg);
	});
});

app.get('/activeAlarms', function(req, res) {
	db.QueryRecord('select * from alarm where is_finished=?', [ false ], function(err, result) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var alarms = [];
			result.rows.forEach(function(alarm) {
				var date = new Date();
				date.setTime(alarm.alarm_begin);
				alarm.alarm_begin = new Date(date);
				date.setTime(alarm.end_time);
				alarm.end_time = new Date(date);
				date.setTime(alarm.ack_time);
				alarm.ack_time = new Date(date);
				alarm.continued = util.timeDiff(alarm.alarm_begin, alarm.is_finished ? alarm.end_time : null);
				alarm.alarm_begin = util.timeformat_t(alarm.alarm_begin);
				alarm.end_time = util.timeformat_t(alarm.end_time);
				alarm.ack_time = util.timeformat_t(alarm.ack_time);
				alarms.push(alarm);
			});
			res.status(200).send(alarms);
		}
	});
});

let ejsExcel = require('ejsexcel');
let fs = require('fs');
function makeExcel(alarms, res) {
	fs.readFile(__dirname + '/xlsx_temp/alarm.xlsx', function(err, exBuf) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var data = {
				date : util.timeformat(new Date()),
				records : alarms
			};
			ejsExcel.renderExcel(exBuf, data).then(function(exlBuf2){
				res.status(200).send(exlBuf2);
			}).catch(function(err) {
				res.status(500).send(err);
				logger.error(err);
			});
			
		}
	});
}
app.get('/activeAlarms/:path', function(req, res) {
	db.QueryRecord('select * from alarm where is_finished=?', [ false ], function(err, result) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var alarms = [];
			var sq=1;
			result.rows.forEach(function(alarm) {
				var date = new Date();
				date.setTime(alarm.alarm_begin);
				alarm.alarm_begin = new Date(date);
				date.setTime(alarm.end_time);
				alarm.end_time = new Date(date);
				date.setTime(alarm.ack_time);
				alarm.ack_time = new Date(date);
				alarm.continued = util.timeDiff(alarm.alarm_begin, alarm.is_finished ? alarm.end_time : null);
				alarm.alarm_begin = util.timeformat(alarm.alarm_begin);
				alarm.end_time =alarm.is_finished? util.timeformat(alarm.end_time):"<活动告警>";
				alarm.ack_time = alarm.is_acked? util.timeformat(alarm.ack_time):"<未处理>";
				var alarm_type = util.findFromArray(config.alarmTypes, "type", alarm.alarm_type);
				alarm.alarm_type = alarm_type ? alarm_type.name : alarm.alarm_type;
				var alarm_level = util.findFromArray(config.alarmLevels.levels, "level", alarm.alarm_level);
				alarm.alarm_level = alarm_level ? alarm_level.name : alarm.alarm_level;
				alarm.sq=sq;
				sq++;
				alarms.push(alarm);
			});
			makeExcel(alarms, res);
		}
	});
});
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
		console.log("a");
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
				console.log("b");
				if (err) {
					console.log("c");
					res.status(500).send(err);
					logger.error(err);
				} else {
					console.log("d");
					res.status(204).end();
				}
			});
		}
	});
});

module.exports = app;