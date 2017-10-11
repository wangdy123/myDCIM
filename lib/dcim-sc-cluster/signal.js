var request = require("./sc_request");
var async = require("async");
var util = require("dcim-util");
var config = require('dcim-config');

module.exports.getFuncModels = function(req, callback) {
	request.doGet("/signal/get-supported-funcs", function(err, result) {
		if (err) {
			callback(err);
		} else {
			if (!result.funcNames) {
				result.funcNames = [];
			}
			callback(null, result.funcNames);
		}
	});
};

module.exports.getFuncParams = function(req, model, callback) {
	request.doGet("/signal/get-func-params/" + model, function(err, result) {
		if (err) {
			callback(err);
		} else {
			if (!result.paramOptions) {
				result.paramOptions = [];
			}
			callback(null, result.paramOptions);
		}
	});
};

module.exports.getConditionModels = function(req, callback) {
	request.doGet("/alarm/get-supported-funcs", function(err, result) {
		if (err) {
			callback(err);
		} else {
			if (!result.funcNames) {
				result.funcNames = [];
			}
			callback(null, result.funcNames);
		}
	});
};

module.exports.getConditionParams = function(req, model, callback) {
	request.doGet("/alarm/get-func-params/" + model, function(err, result) {
		if (err) {
			callback(err);
		} else {
			if (!result.paramOptions) {
				result.paramOptions = [];
			}
			callback(null, result.paramOptions);
		}
	});
};

function makeId(obj) {
	return obj.OBJECT_ID + "." + obj.SIGNAL_ID;
}

function makeFuncs(obj) {
	var funcs = [];
	if (obj.funcs) {
		funcs = [ {
			name : obj.funcs.FUNC_NAME,
			params : request.convertParams(obj.funcs.params)
		} ];
	}
	return funcs;
}

function makeConditions(obj) {
	if(!obj.conditions){
		return [];
	}
	var conditions = [];
	obj.conditions.forEach(function(item) {
		conditions.push({
			level : "LEVEL_" + item.ALARM_LEVEL,
			positiveDesc : item.ALARM_DESC,
			negativeDesc : obj.NORMAL_DESC,
			func : {
				name : item.CONDITION_TYPE,
				params : request.convertParams(item.params)
			}
		});
	});

	return conditions;
}

module.exports.makeSignals = function(signals) {
	var deviceSignals = [];
	signals.forEach(function(obj) {
		if (obj.DRIVER_ID && (obj.SIGNAL_TYPE !== config.signalTypeDef.ALARM)) {
			var signal = {
				signalId : makeId(obj),
				name : obj.SIGNAL_NAME,
				signalType : util.findFromArray(config.signalType, 'type', obj.SIGNAL_TYPE).namespace,
				driverId : obj.DRIVER_ID,
				key : obj.DRIVER_KEY ? obj.DRIVER_KEY : "",
				funcs : makeFuncs(obj)
			};
			deviceSignals.push(signal);
		}
	});

	return deviceSignals;
};

module.exports.makeAlarms = function(signals) {
	var alarms = [];
	signals.forEach(function(obj) {
		if (obj.SIGNAL_TYPE === config.signalTypeDef.ALARM) {
			var alarm = {
				alarmId : makeId(obj),
				name : obj.SIGNAL_NAME,
				conditions : makeConditions(obj)
			};
			if (obj.SRC_SIGNAL_ID) {
				alarm.signalId = obj.SRC_SIGNAL_ID;
			} else {
				alarm.driverId = obj.DRIVER_ID;
				alarm.alarmKey = obj.DRIVER_KEY?obj.DRIVER_KEY:"";
			}
			alarms.push(alarm);
		} else if (obj.conditions && obj.conditions.length > 0) {
			var alarm = {
				alarmId : makeId(obj),
				user : req.user.NAME,
				name : obj.SIGNAL_NAME,
				conditions : makeConditions(obj),
				signalId : makeId(obj)
			};
			if (obj.SRC_SIGNAL_ID) {
				alarm.signalId = obj.SRC_SIGNAL_ID;
			}
			alarms.push(alarm);
		}
	});
	return alarms;
};

module.exports.createSignal = function(req, obj, callback) {
	var tasks = [];
	if (obj.DRIVER_ID && (obj.SIGNAL_TYPE !== config.signalTypeDef.ALARM)) {
		tasks.push(function(cbk) {
			var signal = {
				signalId : makeId(obj),
				user : req.user.NAME,
				name : obj.SIGNAL_NAME,
				signalType : util.findFromArray(config.signalType, 'type', obj.SIGNAL_TYPE).namespace,
				driverId : obj.DRIVER_ID,
				key : obj.DRIVER_KEY,
				funcs : makeFuncs(obj)
			};
			request.doPost("/signal/create-signal", signal, function(err, result) {
				cbk(err);
			});
		});

		tasks.push(function(cbk) {
			request.doPost("/device/add-signal", {
				deviceId : "" + obj.OBJECT_ID,
				user : req.user.NAME,
				signalId : makeId(obj)
			}, function(err, result) {
				cbk(err);
			});
		});
	}
	if (obj.SIGNAL_TYPE === config.signalTypeDef.ALARM) {
		tasks.push(function(cbk) {
			var alarm = {
				alarmId : makeId(obj),
				user : req.user.NAME,
				name : obj.SIGNAL_NAME,
				conditions : makeConditions(obj)
			};
			if (obj.SRC_SIGNAL_ID) {
				alarm.signalId = obj.SRC_SIGNAL_ID;
			} else {
				alarm.driverId = obj.DRIVER_ID;
				alarm.alarmKey = obj.DRIVER_KEY;
			}
			request.doPost("/alarm/create-alarm", alarm, function(err, result) {
				cbk(err);
			});
		});
		tasks.push(function(cbk) {
			request.doPost("/device/add-alarm", {
				deviceId : "" + obj.OBJECT_ID,
				user : req.user.NAME,
				alarmId : makeId(obj)
			}, function(err, result) {
				cbk(err);
			});
		});
	} else if (obj.conditions && obj.conditions.length > 0) {
		tasks.push(function(cbk) {
			var alarm = {
				alarmId : makeId(obj),
				user : req.user.NAME,
				name : obj.SIGNAL_NAME,
				conditions : makeConditions(obj),
				signalId : makeId(obj)
			};
			if (obj.SRC_SIGNAL_ID) {
				alarm.signalId = obj.SRC_SIGNAL_ID;
			}
			request.doPost("/alarm/create-alarm", alarm, function(err, result) {
				cbk(err);
			});
		});
		tasks.push(function(cbk) {
			request.doPost("/device/add-alarm", {
				deviceId : "" + obj.OBJECT_ID,
				user : req.user.NAME,
				alarmId : makeId(obj)
			}, function(err, result) {
				cbk(err);
			});
		});
	}
	async.waterfall(tasks, function(err, results) {
		callback(err);
	});
};

module.exports.updateSignal = function(req, obj, old, callback) {
	obj.ID = "" + obj.ID;
	var tasks = [];
	if (old.NAME !== obj.NAME) {
		tasks.push(function(cbk) {
			request.doPost("/fsu/rename-fsu", {
				id : obj.ID,
				user : req.user.NAME,
				newName : obj.NAME
			}, cbk);
		});
	}
	if (old.MODEL !== obj.MODEL) {
		tasks.push(function(cbk) {
			request.doPost("/fsu/change-model", {
				id : obj.ID,
				user : req.user.NAME,
				newModel : obj.MODEL
			}, cbk);
		});
	}
	var changedParams = {};
	var removedParams = {};
	for (key in obj.params) {
		if (obj.params[key] != old.params[key]) {
			changedParams[key] = obj.params[key];
		}
	}
	for (key in old.params) {
		if (!obj.params[key]) {
			removedParams[key] = old.params[key];
		}
	}
	if (!util.isEmptyObject(changedParams)) {
		tasks.push(function(cbk) {
			request.doPost("/fsu/add-params", {
				id : obj.ID,
				user : req.user.NAME,
				params : request.convertParams(changedParams)
			}, cbk);
		});
	}
	if (!util.isEmptyObject(removedParams)) {
		tasks.push(function(cbk) {
			request.doPost("/fsu/remove-params", {
				id : obj.ID,
				user : req.user.NAME,
				params : request.convertParams(removedParams)
			}, cbk);
		});
	}
	async.parallel(tasks, function(err, results) {
		callback(err);
	});
};

module.exports.removeSignal = function(req, old, callback) {
	var tasks = [];
	if (old.DRIVER_ID) {
		tasks.push(function(cbk) {
			request.doPost("/device/remove-signal", {
				deviceId : "" + old.OBJECT_ID,
				user : req.user.NAME,
				signalId : makeId(old)
			}, function(err, result) {
				cbk(err);
			});
		});
	}
	if (old.conditions && old.conditions.length > 0) {
		tasks.push(function(cbk) {
			request.doPost("/device/remove-alarm", {
				deviceId : "" + old.OBJECT_ID,
				user : req.user.NAME,
				alarmId : makeId(old)
			}, function(err, result) {
				cbk(err);
			});
		});
	}
	async.parallel(tasks, function(err, results) {
		callback(err);
	});
};
