var app = require('./app');
var db = require('dcim-db');

app.get('/latestAlarm', function(req, res) {
	db.pool.query('select max(sequence) as maxSeq,alarm_level from record.alarm group by alarm_level', function(error,
			results) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send(results);
		}
	});
});
