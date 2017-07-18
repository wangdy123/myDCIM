var app = require('./app');

var db = require('dcim-db');
var util = require('dcim-util');
var config = require('dcim-config');

function queryActiveAlarm(param,callback){
	
	db.QueryRecord('select * from alarm where is_finished=?', [ false ], function(err, result) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
		}
		});
}
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