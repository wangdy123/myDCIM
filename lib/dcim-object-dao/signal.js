var async = require("async");
var util = require('dcim-util');
var fs = require('fs');

function createSignal(defaultSignal, deviceId, driverId, seq) {
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
	if (signal.SRC_SIGNAL_ID) {
		signal.SRC_SIGNAL_ID = signal.SRC_SIGNAL_ID + seq;
	} else {
		signal.DRIVER_ID = driverId;
		signal.DRIVER_KEY = signal.DRIVER_KEY.replace('XX', (seq + 1));
	}
	return signal;
}

function getPropertyValue(params, name) {
	if (params[name]) {
		return params[name];
	}
};

var path = require('path');
module.exports.createSignalByTemplate = function(deviceType, parentId, driverId, params, callback) {
	var fileName = path.join(process.cwd(), 'conf', 'signal', deviceType + '.json');
	fs.readFile(fileName, function(err, data) {
		if (err) {
			callback(err);
			return;
		}

		var defaultSignals = JSON.parse(data);
		var signals = [];
		for (group in defaultSignals) {
			if (group == "defaults") {
				defaultSignals["defaults"].forEach(function(item) {
					signals.push(createSignal(item, parentId, driverId));
				});
			} else {
				var count = parseInt(getPropertyValue(params, group), 10);
				if (!isNaN(count)) {
					for (var i = 0; i < count; i++) {
						defaultSignals[group].forEach(function(item) {
							signals.push(createSignal(item, parentId, driverId, i));
						});
					}
				}
			}
		}
		callback(null, signals);
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
							condition.params = {};
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
									if (!signal.conditions[j].params) {
										signal.conditions[j].params = {};
									}
									signal.conditions[j].params[prop.PROP] = prop.VALUE;
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
	}, function(cbk) {
		var sql = 'select * from config.SIGNAL_TRANS_FUNC where OBJECT_ID=?';
		pool.query(sql, [ parentId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(funcs) {
					for (var i = 0; i < signals.length; i++) {
						var signal = signals[i];
						if (signal.OBJECT_ID === funcs.OBJECT_ID && signal.SIGNAL_ID === funcs.SIGNAL_ID) {
							delete funcs.OBJECT_ID;
							delete funcs.SIGNAL_ID;
							funcs.params = {};
							signal.funcs = funcs;
							break;
						}
					}
				});
				cbk(null);
			}
		});
	}, function(cbk) {
		var sql = 'select * from config.SIGNAL_TRANS_FUNC_PROP where OBJECT_ID=?';
		pool.query(sql, [ parentId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(prop) {
					for (var i = 0; i < signals.length; i++) {
						var signal = signals[i];
						if (signal.OBJECT_ID === prop.OBJECT_ID && signal.SIGNAL_ID === prop.SIGNAL_ID) {
							if (!signal.funcs[j].params) {
								signal.funcs[j].params = {};
							}
							signal.funcs[j].params[prop.PROP] = prop.VALUE;
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
	}, function(cbk) {
		var sql = 'select * from config.SIGNAL_CONDITION where OBJECT_ID=? and SIGNAL_ID=?';
		pool.query(sql, [ parentId, signalId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(condition) {
					delete condition.OBJECT_ID;
					delete condition.SIGNAL_ID;
					condition.params = {};
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
							if (!signal.conditions[j].params) {
								signal.conditions[j].params = {};
							}
							signal.conditions[j].params[prop.PROP] = prop.VALUE;
							break;
						}
					}
				});
				cbk(null);
			}
		});
	}, function(cbk) {
		var sql = 'select * from config.SIGNAL_TRANS_FUNC where OBJECT_ID=?';
		pool.query(sql, [ parentId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(funcs) {
					delete funcs.OBJECT_ID;
					delete funcs.SIGNAL_ID;
					funcs.params = {};
					signal.funcs = funcs;
				});
				cbk(null);
			}
		});
	}, function(cbk) {
		var sql = 'select * from config.SIGNAL_TRANS_FUNC_PROP where OBJECT_ID=?';
		pool.query(sql, [ parentId ], function(error, results) {
			if (error) {
				cbk(error);
			} else {
				results.forEach(function(prop) {
					if (!signal.funcs[j].params) {
						signal.funcs[j].params = {};
					}
					signal.funcs[j].params[prop.PROP] = prop.VALUE;
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

	conditions.forEach(function(condition) {
		var params = condition.params;
		delete condition.params;
		condition.OBJECT_ID = objectId;
		condition.SIGNAL_ID = signalId;
		tasks.push(function(callback) {
			var sql = 'INSERT INTO config.SIGNAL_CONDITION set ?';
			connection.query(sql, condition, function(err, result) {
				if (err) {
					callback(err);
				} else {
					callback();
				}
			});
		});
		params.forEach(function(param) {
			tasks.push(function(callback) {
				param.OBJECT_ID = objectId;
				param.SIGNAL_ID = signalId;
				var sql = 'INSERT INTO config.SIGNAL_CONDITION_PROP set ?';
				connection.query(sql, param, function(err, result) {
					if (err) {
						callback(err);
					} else {
						callback();
					}
				});
			});
		});

	});
}
function makeFuncsCreateTasks(connection, tasks, objectId, signalId, funcs) {
	if (!funcs) {
		return;
	}

	var params = funcs.params;
	delete funcs.params;
	funcs.OBJECT_ID = objectId;
	funcs.SIGNAL_ID = signalId;
	tasks.push(function(callback) {
		var sql = 'INSERT INTO config.SIGNAL_TRANS_FUNC set ?';
		connection.query(sql, funcs, function(err, result) {
			if (err) {
				callback(err);
			} else {
				callback();
			}
		});
	});
	params.forEach(function(param) {
		tasks.push(function(callback) {
			param.OBJECT_ID = objectId;
			param.SIGNAL_ID = signalId;
			var sql = 'INSERT INTO config.SIGNAL_TRANS_FUNC_PROP set ?';
			connection.query(sql, param, function(err, result) {
				if (err) {
					callback(err);
				} else {
					callback();
				}
			});
		});
	});

}
module.exports.createInsertTasks = function(connection, tasks, signal) {
	var conditions = signal.conditions;
	delete signal.conditions;
	var funcs = signal.funcs;
	delete signal.funcs;

	tasks.push(function(callback) {
		var sql = 'INSERT INTO config.SIGNAL set ?';
		connection.query(sql, signal, function(err, result) {
			callback(err);
		});
	});
	makeConditionCreateTasks(connection, tasks, signal.OBJECT_ID, signal.SIGNAL_ID, conditions);
	makeFuncsCreateTasks(connection, tasks, signal.OBJECT_ID, signal.SIGNAL_ID, funcs);
};
module.exports.createInsertSignalsTasks = function(connection, tasks, signals) {
	signals.forEach(function(signal) {
		module.exports.createInsertTasks(connection, tasks, signal);
	});
};

module.exports.createUpdateTasks = function(connection, tasks, signal) {
	var conditions = signal.conditions;
	delete signal.conditions;

	var funcs = signal.funcs;
	delete signal.funcs;

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

	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_TRANS_FUNC_PROP where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ signal.OBJECT_ID, signal.SIGNAL_ID ], function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_TRANS_FUNC where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ signal.OBJECT_ID, signal.SIGNAL_ID ], function(err, result) {
			callback(err);
		});
	});

	makeConditionCreateTasks(connection, tasks, signal.OBJECT_ID, signal.SIGNAL_ID, conditions);
	makeFuncsCreateTasks(connection, tasks, signal.OBJECT_ID, signal.SIGNAL_ID, funcs);
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
		var sql = 'delete from config.SIGNAL_TRANS_FUNC_PROP where OBJECT_ID=? and SIGNAL_ID=?';
		connection.query(sql, [ parentId, signalId ], function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_TRANS_FUNC where OBJECT_ID=? and SIGNAL_ID=?';
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
		var sql = 'delete from config.SIGNAL_TRANS_FUNC_PROP where OBJECT_ID=?';
		connection.query(sql, [ parentId ], function(err, result) {
			callback(err);
		});
	});
	tasks.push(function(callback) {
		var sql = 'delete from config.SIGNAL_TRANS_FUNC where OBJECT_ID=?';
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
