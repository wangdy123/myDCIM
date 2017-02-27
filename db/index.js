var mysql = require("mysql");
var config = require('../config').config;

module.exports.pool = mysql.createPool({
	connectionLimit : 16,
	host : config.db.host,
	port : config.db.port,
	user : config.db.user,
	password : config.db.password,
	database : config.db.database
});

var mysql = require('mysql');
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

var redis = require("redis");

module.exports.createRedisConnect = function() {
	return redis.createClient({
		host : config.redis.host,
		port : config.redis.port,
		connect_timeout : 1
	});
}

var client = module.exports.createRedisConnect();

// client.on("connect", function() {
// client.auth(config.redis.user);
// });

client.on("error", function(err) {
	console.log("Error: " + err);
	process.exit();
});

module.exports.redis = client;
