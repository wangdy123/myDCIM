var async = require("async");
var util = require('dcim-util');
var fs = require('fs');

function createSignal(defaultSignal, deviceId, seq) {
	seq = seq ? seq : 0;
	signal = util.deepClone(defaultSignal);
	var num = 1;
	signal.conditions.forEach(function(condition) {
		condition.CONDITION_NUM = num;
		if (!condition.CONDITION_TYPE) {
			condition.CONDITION_TYPE = 'highLevelAlarm';
		}
		num++;
	});

	signal.OBJECT_ID = deviceId;
	signal.SIGNAL_NAME = signal.SIGNAL_NAME.replace('XX', (seq + 1));
	signal.SIGNAL_ID = signal.SIGNAL_ID + seq;
	return signal;
}

function getPropertyValue(properties, name) {
	var item = util.findFromArray(properties, "PRO_NAME", name);
	if (item) {
		return item.PRO_VALUE;
	}
};

module.exports.createSignalByTemplate = function(connection, fileName, parentId, properties, callback) {
	fs.readFile(fileName, function(err, data) {
		if (err) {
			callback(err);
			return;
		}
		try {
			var defaultSignals = JSON.parse(data);
			var signalTasks = [];
			for (group in defaultSignals) {
				if (group == "defaults") {
					defaultSignals["defaults"].forEach(function(item) {
						module.exports.createInsertTasks(connection, signalTasks, createSignal(item, parentId));
					});
				} else {
					var count = parseInt(getPropertyValue(properties, group), 10);
					if (!isNaN(count)) {
						for (var i = 0; i < count; i++) {
							defaultSignals[group].forEach(function(item) {
								module.exports.createInsertTasks(connection, signalTasks, createSignal(item, parentId,
										i));
							});
						}
					}
				}
			}
			async.parallel(signalTasks, function(err, result) {
				callback(err);
			});
		} catch (err) {
			callback(err);
		}
	});
};

module.exports.getByParent = function(pool, parentId, callback) {
	var signals = null;
	var tasks = [ function(cbk) {
		var sql = 'select * from config.SIGNAL where OBJECT_ID=?';
		pool.query(sql, [ parentId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				signals = results;
				cbk(null);
			}
		});
	}, function(cbk) {
		var sql = 'select * from config.SIGNAL_CONDITION where OBJECT_ID=?';
		pool.query(sql, [ parentId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(condition) {
					for (var i = 0; i < signals.length; i++) {
						var signal = signals[i];
						if (signal.OBJECT_ID === condition.OBJECT_ID && signal.SIGNAL_ID === condition.SIGNAL_ID) {
							delete condition.OBJECT_ID;
							delete condition.SIGNAL_ID;
							if (signal.conditions) {
								signal.conditions.push(condition);
							} else {
								signal.conditions = [ condition ];
							}
							break;
						}
					}
				});
				cbk(null);
			}
		});
	}, function(cbk) {
		var sql = 'select * from config.SIGNAL_CONDITION_PROP where OBJECT_ID=?';
		pool.query(sql, [ parentId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(prop) {
					for (var i = 0; i < signals.length; i++) {
						var signal = signals[i];
						if (signal.OBJECT_ID === prop.OBJECT_ID && signal.SIGNAL_ID === prop.SIGNAL_ID) {
							for (var j = 0; j < signal.conditions.length; j++) {
								if (signal.conditions[j].CONDITION_NUM === prop.CONDITION_NUM) {
									signal.conditions[j][prop.PROP] = prop.VALUE;
									break;
								}
							}
							break;
						}
					}
				});
				cbk(null);
			}
		});
	} ];

	async.waterfall(tasks, function(error) {
		callback(error, signals);
	});
};

module.exports.getByKey = function(pool, parentId, signalId, callback) {
	var signal = null;
	var tasks = [ function(cbk) {
		var sql = 'select * from config.SIGNAL where OBJECT_ID=? and SIGNAL_ID=?';
		pool.query(sql, [ parentId, signalId ], function(error, objects) {
			if (error) {
				cbk(error);
			} else if (objects.length === 0) {
				cbk("not found:(" + parentId + ',' + signalId + ')');
				return;
			} else {
				signal = objects[0];
				cbk(null);
			}
		});
	}, , function(cbk) {
		var sql = 'select * from config.SIGNAL_CONDITION where OBJECT_ID=? and SIGNAL_ID=?';
		pool.query(sql, [ parentId, signalId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(condition) {
					delete condition.OBJECT_ID;
					delete condition.SIGNAL_ID;
					if (signal.conditions) {
						signal.conditions.push(condition);
					} else {
						signal.conditions = [ condition ];
					}
				});
				cbk(null);
			}
		});
	}, function(cbk) {
		var sql = 'select * from config.SIGNAL_CONDITION_PROP where OBJECT_ID=? and SIGNAL_ID=?';
		pool.query(sql, [ parentId, signalId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(prop) {
					for (var j = 0; j < signal.conditions.length; j++) {
						if (signal.conditions[j].CONDITION_NUM === prop.CONDITION_NUM) {
							signal.conditions[j][prop.PROP] = prop.VALUE;
							break;
						}
					}
				});
				cbk(null);
			}
		});
	} ];

	async.waterfall(tasks, function(error) {
		callback(error, signal);
	});
};

function makeConditionCreateTasks(connection, tasks, objectId, signalId, conditions) {
	if (!conditions) {
		return;
	}
	var baskPros = [ "CONDITION_NUM", "CONDITION_TYPE", "ALARM_DESC", "ALARM_LEVEL", "ALARM_DELAY" ];
	conditions.forEach(function(condition) {
		tasks.push(function(callback) {
			var temp = {
				OBJECT_ID : objectId,
				SIGNAL_ID : signalId
			};
			baskPros.forEach(function(item) {
				temp[item] = condition[item];
			});
			var sql = 'INSERT INTO config.SIGNAL_CONDITION set ?';
			connection.query(sql, temp, function(err, result) {
				if (err) {
					callback(err);
				} else {
					callback();
				}
			});
		});
		for ( var key in condition) {
			if (baskPros.indexOf(key) < 0) {
				(function(key) {
					tasks.push(function(callback) {
						var temp = {
							OBJECT_ID : objectId,
							SIGNAL_ID : signalId,
							CONDITION_NUM : condition.CONDITION_NUM,
							PROP : key,
							VALUE : condition[key]
						};
						var sql = 'INSERT INTO config.SIGNAL_CONDITION_PROP set ?';
						connection.query(sql, temp, function(err, result) {
							if (err) {
								callback(err);
							} else {
								callback();
							}
						});
					});
				})(key);
			}
		}
	});
}

module.exports.createInsertTasks = function(connection, tasks, signal) {
	var conditions = signal.conditions;
	delete signal.conditions;

	tasks.push(function(callback) {
		var sql = 'INSERT INTO config.SIGNAL set ?';
		connection.query(sql, signal, function(err, result) {
			callback(err);
		});
	});
	makeConditionCreateTasks(connection, tasks, signal.OBJECT_ID, signal.SIGNAL_ID, conditions);
};
module.exports.createInsertSignalsTasks = function(connection, tasks, signals) {
	signals.forEach(function(signal) {
		module.exports.createInsertTasks(connection, tasks, signal);
	});
};

module.exports.createUpdateTasks = function(connection, tasks, signal) {
	var conditions = signal.conditions;
	delete signal.conditions;
	tasks.push(function(callback) {
		var sql = 'REPLACE INTO config.SIGNAL set ?';
		connection.query(sql, signal, function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_CONDITION_PROP where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ signal.OBJECT_ID, signal.SIGNAL_ID ], function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_CONDITION where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ signal.OBJECT_ID, signal.SIGNAL_ID ], function(err, result) {
			callback(err);
		});
	});
	makeConditionCreateTasks(connection, tasks, signal.OBJECT_ID, signal.SIGNAL_ID, conditions);
};

module.exports.createDeleteByKeyTasks = function(connection, tasks, parentId, signalId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_CONDITION_PROP where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ parentId, signalId ], function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_CONDITION where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ parentId, signalId ], function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL  where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ parentId, signalId ], function(err, result) {
			callback(err);
		});
	});
};
module.exports.createDeleteByParentTasks = function(connection, tasks, parentId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_CONDITION_PROP where OBJECT_ID=?';
		connection.query(sql, [ parentId ], function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_CONDITION where OBJECT_ID=?';
		connection.query(sql, [ parentId ], function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL where OBJECT_ID=?';
		connection.query(sql, [ parentId ], function(err, result) {
			callback(err);
		});
	});
};
