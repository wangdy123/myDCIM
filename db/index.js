var mysql = require("mysql");
var config = require('../config.json');

module.exports.getPool = mysql.createPool({
	connectionLimit : 16,
	host : config.db.host,
	port : config.db.port,
	user : config.db.user,
	password : config.db.password,
	database : config.db.database
});

var mysql = require('mysql');
var transaction = require('node-mysql-transaction');

module.exports.createTransactionChain = function() {
	transaction({
		connection : [ mysql.createConnection, {
			host : config.db.host,
			port : config.db.port,
			user : config.db.user,
			password : config.db.password,
			database : config.db.database
		} ]
	}).chain();
};

var redis = require("redis");

var client = redis.createClient({
	host : config.redis.host,
	port : config.redis.port
});

client.on("connect", function() {
	client.auth(config.redis.user);
});

client.on("error", function(err) {
	console.log("Error: " + err);
});

module.exports.redis = client;
