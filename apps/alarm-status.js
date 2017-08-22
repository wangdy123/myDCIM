var app = require('./app');
var db = require('dcim-db');
var async = require("async");
app.get('/alarmStatus', function(req, res) {
	var status = {};
	var tasks = [
			function(cbk) { // 用于判断是否有新告警
				var sql = 'select max(sequence) as maxSeq from record.alarm';
				db.pool.query(sql, function(error, results) {
					if (error) {
						cbk(error);
					} else {
						if (results.length < 1) {
							status.maxSequece = 0;
						} else {
							status.maxSequece = results[0].maxSeq;
						}
						cbk();
					}
				});
			},
			function(cbk) { // 用于显示告警总数
				var sql = 'select count(sequence) as alarmCount,alarm_level from record.alarm '
						+ 'where end_time is null group by alarm_level';
				db.pool.query(sql, function(error, results) {
					if (error) {
						cbk(error);
					} else {
						status.activeAlarmCount = results;
						cbk();
					}
				});
			},
			function(cbk) { // 用于告警声光通知
				var sql = 'select count(sequence) as alarmCount,alarm_level from record.alarm '
						+ 'where end_time is null and ack_time is null group by alarm_level';
				db.pool.query(sql, function(error, results) {
					if (error) {
						cbk(error);
					} else {
						status.unAckActiveAlarmCount = results;
						cbk();
					}
				});
			} ];
	async.parallel(tasks, function(err, results) {
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else {
			res.status(200).send(status);
		}
	});
});
