var mysql = require("mysql");
var config = require('dcim-config').config;

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
