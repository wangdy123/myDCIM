var app = require('./app');
var expressWs = require('express-ws')(app);
var db = require('dcim-db');

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
				alarm.alarmLast = "";
				alarms.push(alarm);
			});
			res.status(200).send(alarms);
		}
	});
});
module.exports = app;