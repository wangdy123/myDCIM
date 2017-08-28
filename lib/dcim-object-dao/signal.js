module.exports.getByParent = function(pool, parentId, callback) {
	var sql = 'select * from config.SIGNAL where OBJECT_ID=?';
	pool.query(sql, [ parentId ], function(error, objects) {
		if (error) {
			callback(error);
			return;
		}
		callback(error, objects);
	});
};

module.exports.getByKey = function(pool, parentId, signalId, callback) {
	var sql = 'select * from config.SIGNAL where OBJECT_ID=? and SIGNAL_ID=?';
	pool.query(sql, [ parentId, signalId ], function(error, objects) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found signal:(" + parentId + "," + signalId + ")");
			return;
		}
		callback(error, objects[0]);
	});
};

module.exports.createInsertTasks = function(connection, tasks, signal) {
	tasks.push(function(callback) {
		var sql = 'INSERT INTO config.SIGNAL set ?';
		connection.query(sql, signal, function(err, result) {
			callback(err);
		});
	});
};
module.exports.createInsertSignalsTasks = function(connection, tasks, signals) {
	var sql = 'INSERT INTO config.SIGNAL set ?';
	signals.forEach(function(signal) {
		tasks.push(function(callback) {
			connection.query(sql, signal, function(err, result) {
				callback(err);
			});
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, signal) {
	tasks.push(function(callback) {
		var sql = 'REPLACE INTO config.SIGNAL set ?';
		connection.query(sql, signal, function(err, result) {
			callback(err);
		});
	});
};

module.exports.createDeleteByKeyTasks = function(connection, tasks, parentId, signalId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ parentId, signalId ], function(err, result) {
			callback(err);
		});
	});
};
module.exports.createDeleteByParentTasks = function(connection, tasks, parentId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL where OBJECT_ID=?';
		connection.query(sql, [ parentId ], function(err, result) {
			callback(err);
		});
	});
};
