var app = require('./app');

var db = require('dcim-db');
var util = require('dcim-util');
var config = require('dcim-config');
var cache = require('dcim-cache');

function queryActiveAlarm(querys,callback){
	var params=[];
	var filters=[];
	var orderBy="";
	if(querys.alarmType){
		var alarmType = querys.alarmType.split(",");
		if(alarmType.length>0){
			filters.push("alarm_type in("+querys.alarmType+")");
		}
	}
	if(querys.alarmLevel){
		var alarmLevel = querys.alarmLevel.split(",");
		if(alarmLevel.length>0){
			filters.push("alarm_level in("+alarmLevel.join(',')+")");
		}
	}
	if(querys.deviceType){
		var deviceType = querys.deviceType.split(",");
		if(deviceType.length>0){
		console.log(deviceType);
			filters.push("device_type in("+deviceType.join(',')+")");
		}
	}
	if(querys.startDate){
		filters.push(" alarm_begin >=? ");
		var start=util.date_parse(querys.startDate);
		start.setHours(0,0,0,0);
		params.push(start);
	}
	if(querys.endDate){
		filters.push(" alarm_begin <=? ");
		var end=util.date_parse(querys.endDate);
		end.setHours(23,59,59,999);
		params.push(end);
	}
	if(querys.sort){
		orderBy=" order by "+querys.sort+" "+querys.order;
	}
	
	function query(params,filters,orderBy){
		var sql="select sequence,object_id,signal_id,alarm_type,alarm_begin,alarm_level,end_time," +
		"object_name,alarm_name,alarm_value,alarm_desc,alarm_status,ack_time,reason,ack_user " +
		"from record.alarm where end_time is null or ack_time is null " +(filters.length>0?("and "+filters.join(" and ")):"")+orderBy;
		db.pool.query(sql, params, callback);
	}
	if(querys.objectId){
		cache.getChildObjectId(db.pool,querys.objectId,function(err,childIds){
			if (err) {
				callback(err);
			}else{
			filters.push("object_id in("+childIds.join(',')+")");
			query(params,filters,orderBy);
			}
		});
	}else{
		query(params,filters,orderBy);
	}

}

app.get('/activeAlarms', function(req, res) {
	queryActiveAlarm(req.query, function(err, result) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var alarms = [];
			result.forEach(function(alarm) {
				alarm.is_finished=alarm.end_time?true:false;
				alarm.is_acked=alarm.ack_time?true:false;
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
	queryActiveAlarm(req.query, function(err, results) {
		if (err) {
			res.status(500).send(err);
			logger.error(err);
		} else {
			var alarms = [];
			var sq=1;
			results.forEach(function(alarm) {
				alarm.is_finished=alarm.end_time?true:false;
				alarm.is_acked=alarm.ack_time?true:false;
				alarm.continued = util.timeDiff(alarm.alarm_begin, alarm.is_finished ? alarm.end_time : null);
				alarm.alarm_begin = util.timeformat(alarm.alarm_begin);
				alarm.end_time =alarm.is_finished? util.timeformat(alarm.end_time):"<活动告警>";
				alarm.ack_time = alarm.is_acked? util.timeformat(alarm.ack_time):"<未处理>";
				var alarm_type = util.findFromArray(config.alarmTypes, "type", alarm.alarm_type);
				alarm.alarm_type = alarm_type ? alarm_type.name : alarm.alarm_type;
				var alarm_level = util.findFromArray(config.alarmLevels.levels, "level", alarm.alarm_level);
				alarm.alarm_level = alarm_level ? alarm_level.name : alarm.alarm_level;
				var device_type = util.findFromArray(config.deviceTypes, "type", alarm.device_type);
				alarm.device_type = device_type ? device_type.name : alarm.device_type;
				alarm.sq=sq;
				sq++;
				alarms.push(alarm);
			});
			makeExcel(alarms, res);
		}
	});
});