var app = require('./app');

var redis = require('dcim-redis');
var db = require('dcim-db');
require('dcim-logger');

function checkDb(status, beginCbk, endCbk) {
	beginCbk();
	db.pool.query('SELECT * FROM config.OBJECT where ID=1', function(error, results, fields) {
		if (error) {
			status.configdb = false;
			logger.error(err);
		} else {
			status.configdb = true;
		}
		endCbk();
	});
}
function checkHistory(status, beginCbk, endCbk) {
	beginCbk();
	db.getRecordConnect(function(err, connect) {
		if (err) {
			status.historydb = false;
			logger.error(err);
		} else {
			status.historydb = true;
		}
		endCbk();
	});
}

function checkRedis(status, beginCbk, endCbk) {
	beginCbk();
	var client = redis.createRedisConnect();
	client.on("error", function(err) {
		status.redis = false;
		endCbk();
	});
	client.set("link-test", "test string", function(err) {
		if (err) {
			status.redis = false;
			logger.error(err);
		} else {
			status.redis = true;
		}
		endCbk();
	});
}
app.get('/selfDiagnosis', function(req, res) {
	var status = {};
	var callCount = 0;
	function beginCbk() {
		callCount++;
	}
	function endCbk() {
		callCount--;
		if (callCount === 0) {
			res.status(200).send(status);
		}
	}
	checkDb(status, beginCbk, endCbk);
	checkHistory(status, beginCbk, endCbk);
	checkRedis(status, beginCbk, endCbk);
});