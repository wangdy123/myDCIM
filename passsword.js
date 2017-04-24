var db = require('dcim-db');
var util = require("dcim-util");

console.log(process.argv);
if (process.argv.length === 4) {
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'update portal.ACCOUNT set LOGIN_PASSWORD=?,PASSWORD_TIME=sysdate() where ACCOUNT=?';
			connection.query(sql, [ util.transToSha1(process.argv[3]), process.argv[2] ], function(err, result) {
				callback(err);
			});
		} ];
	}, function(error, result) {
		if (error) {
			console.log(error);
		} else {
			console.log(util.transToSha1(process.argv[3]))
		}
		process.exit();
	});
}