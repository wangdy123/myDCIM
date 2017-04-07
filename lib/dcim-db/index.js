var mysql = require("mysql");
var config = require('dcim-config').config;
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
module.exports.make
var transaction = require('node-mysql-transaction');

module.exports.transaction = function(transactionOpt, commitCbk, rollbackCbk) {
	var chain = transaction({
		connection : [ mysql.createConnection, {
			host : config.db.host,
			port : config.db.port,
			user : config.db.user,
			password : config.db.password,
			database : config.db.database
		} ]
	}).chain();
	chain.on('commit', function() {
		commitCbk();

	}).on('rollback', function(err) {
		rollbackCbk(err);
	});

	chain.on('result', function(result) {
		chain.commit();
	}).autoCommit(false);
	transactionOpt(chain);
};

module.exports.doTransaction = function(taskCreator, callback) {
	pool.getConnection(function(err, connection) {
		if (err) {
			callback(err);
			return;
		}
		try {
			var tasks = taskCreator(connection);
			tasks.splice(0, 0, function(callback) {
				connection.beginTransaction(function(err) {
					callback(err);
				});
			});
			tasks.push(function(callback) {
				connection.commit(function(err) {
					callback(err);
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
