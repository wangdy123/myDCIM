var app = require('./app');

var redis = require('dcim-redis');
var db = require('dcim-db');
var async = require("async");

app.get('/selfDiagnosis', function(req, res) {
	var status = [];

	var tasks = [ function(cbk) {
		var client = redis.createRedisConnect();
		client.on("error", function(err) {
			status.push("缓存服务通讯异常");
			logger.error(err);
			cbk(null);
		});
		client.set("link-test", "test string", function(err) {
			if (err) {
				status.push("缓存服务通讯异常");
				logger.error(err);
			}
			cbk(null);
		});
	}, function(cbk) {
		db.getRecordConnect(function(err, connect) {
			if (err) {
				status.push("记录数据库通讯异常");
				logger.error(err);
			}
			cbk(null);
		});
	}, function(cbk) {
		db.pool.query('SELECT * FROM config.OBJECT where ID=1', function(error) {
			if (error) {
				status.push("配置数据库通讯异常");
				logger.error(err);
			}
			cbk(null);
		});
	} ];
	async.parallel(tasks, function(err, results) {
		res.status(200).send(status);
	});
});