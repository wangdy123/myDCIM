var mysql = require("mysql");
var config = require('dcim-config');
var async = require("async");

var pool = mysql.createPool({
	connectionLimit : 16,
	host : config.db.host,
	port : config.db.port,
	user : config.db.user,
	password : config.db.password,
	database : config.db.database
});

module.exports.pool = pool;

module.exports.doTransaction = function(taskCreator, callback) {
	pool.getConnection(function(err, connection) {
		if (err) {
			callback(err);
			return;
		}
		try {
			var tasks = taskCreator(connection);
			tasks.splice(0, 0, function(cb) {
				connection.beginTransaction(function(err) {
					cb(err);
				});
			});
			tasks.push(function(cb) {
				connection.commit(function(err) {
					cb(err);
				});
			});
			async.waterfall(tasks, function(err, results) {
				if (err) {
					connection.rollback();
				}
				connection.release();
				callback(err, results);
			});
		} catch (e) {
			logger.error(e);
			connection.rollback();
			connection.release();
			callback(e);
		}
	});
};

module.exports.query = function(taskMapCreator, callback) {
	pool.getConnection(function(err, connection) {
		if (err) {
			callback(err);
			return;
		}
		var taskMap = taskMapCreator(connection);
		async.series(taskMap, function(err, results) {
			connection.release();
			callback(err, results);
		});
	});
};

var cassandra = require('cassandra-driver');
var recordConnect = null;
function getRecordConnect(callback) {
	if (!recordConnect) {
		var nodes = [];
		for (var i = 0; i < config.cassandra.nodes.length; i++) {
			var node = config.cassandra.nodes[i];
			nodes.push(node.host + ":" + node.port);
		}
		recordConnect = new cassandra.Client({
			contactPoints : nodes,
			keyspace : config.cassandra.record_keyspace
		});
	}
	recordConnect.connect(function(err) {
		if (err) {
			if (recordConnect) {
				recordConnect.shutdown();
			}
			recordConnect = null;
			callback(err);
		} else {
			callback(null, recordConnect, function(err) {
				if (err) {
					logger.error(err);
					recordConnect.shutdown();
					recordConnect = null;
				}
			});
		}
	});
}

function resetRecordConnect(connect) {
	connect.shutdown();
	connect = null;
}

function QueryRecord(sql, param, callback) {
	getRecordConnect(function(err, connect, finishCbk) {
		if (err) {
			callback(err);
			return;
		}
		connect.execute(sql, param, {
			prepare : true
		}, function(err, result) {
			if (err) {
				resetRecordConnect(connect);
				callback(err);
			} else {
				callback(null, result);
			}
			finishCbk(err);
		});
	});
}

function executeRecordSqls(sql, params, callback) {
	getRecordConnect(function(err, connect, finishCbk) {
		if (err) {
			callback(err);
			return;
		}
		var tasks = [];
		function addTask(param) {
			tasks.push(function(cb) {
				connect.execute(sql, param, {
					prepare : true
				}, cb);
			});
		}
		for (var i = 0; i < params.length; i++) {
			addTask(params[i]);
		}
		async.parallel(tasks, function(err, results) {
			if (err) {
				resetRecordConnect(connect);
				callback(err);
			} else {
				callback(null, results);
			}
			finishCbk(err);
		});
	});
}

module.exports.getRecordConnect = getRecordConnect;
module.exports.resetRecordConnect = resetRecordConnect;
module.exports.QueryRecord = QueryRecord;
module.exports.executeRecordSqls = executeRecordSqls;
