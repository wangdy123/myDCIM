var async = require("async");
var config = require("dcim-config");
var getChildObjectId = require("./child-objectid");


function getAlarmCount(pool, id, callback) {
	getChildObjectId(pool, id, function(err, childIds) {
		if (err) {
			callback(err);
		} else {
			childIds.push(id);
			var sql = 'select alarm_level,count(sequence) as ALARM_COUNT from record.alarm '
					+ ' where end_time is null and object_id in(' + childIds.join(',') + ') group by alarm_level';
			pool.query(sql, function(error, objects, fields) {
				if (error) {
					callback(err);
				} else {
					var status = {
						alarmLevel1Count : 0,
						alarmLevel2Count : 0,
						alarmLevel3Count : 0,
						alarmLevel4Count : 0
					};
					for (var i = 0; i < objects.length; i++) {
						switch (objects[i].alarm_level) {
						case 1:
							status.alarmLevel1Count = objects[i].ALARM_COUNT;
							break;
						case 2:
							status.alarmLevel2Count = objects[i].ALARM_COUNT;
							break;
						case 3:
							status.alarmLevel3Count = objects[i].ALARM_COUNT;
							break;
						case 4:
							status.alarmLevel4Count = objects[i].ALARM_COUNT;
							break;

						}
					}
					callback(null, status);
				}
			});
		}
	});
}

module.exports = getAlarmCount;
