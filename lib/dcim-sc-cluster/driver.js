var request = require("./sc_request");
var async = require("async");
var util = require("dcim-util");

module.exports.getModels = function(req, callback) {
	request.doGet("/driver/get-supported-models", function(err, result) {
		if (err) {
			callback(err);
		} else {
			if (!result.modelNames) {
				result.modelNames = [];
			}
			callback(null, result.modelNames);
		}
	});
};

module.exports.getModelParams = function(req, model, callback) {
	request.doGet("/driver/get-model-params/" + model, function(err, result) {
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

module.exports.getDriverKey = function(req, driverId, callback) {
	driverId = "" + driverId;
	request.doPost("/driver/get-provided-signals", {
		driverId : driverId,
		user : req.user.NAME
	}, function(err, result) {
		if(err){
			callback(err);
		}else{
			callback(null, result.signals);
		}
	});
};

module.exports.restartDriver = function(req, driverId, callback) {
	driverId = "" + driverId;
	request.doPost("/driver/restart-driver", {
		driverId : driverId,
		user : req.user.NAME
	}, function(err, result) {
		callback(err);
	});
};

module.exports.createDriver = function(req, obj, callback) {
	obj.ID = "" + obj.ID;
	obj.params = request.convertParams(obj.params);
	request.doPost("/driver/create-driver", {
		driverId : obj.ID,
		user : req.user.NAME,
		name : obj.NAME,
		model : obj.MODEL,
		fsuId : "" + obj.FSU,
		initParams : obj.params
	}, function(err, result) {
		callback(err);
	});
};

module.exports.updateDriver = function(req, obj, old, callback) {
	obj.ID = "" + obj.ID;
	var tasks = [];
	if (old.NAME !== obj.NAME) {
		tasks.push(function(cbk) {
			request.doPost("/driver/rename-driver", {
				driverId : obj.ID,
				user : req.user.NAME,
				newName : obj.NAME
			}, cbk);
		});
	}
	if (old.MODEL !== obj.MODEL) {
		tasks.push(function(cbk) {
			request.doPost("/driver/change-model", {
				driverId : obj.ID,
				user : req.user.NAME,
				newModel : obj.MODEL
			}, cbk);
		});
	}
	if (old.FSU !== obj.FSU) {
		tasks.push(function(cbk) {
			request.doPost("/driver/select-fsu", {
				driverId : obj.ID,
				user : req.user.NAME,
				fsuId : "" + obj.FSU
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
			request.doPost("/driver/add-params", {
				driverId : obj.ID,
				user : req.user.NAME,
				params : request.convertParams(changedParams)
			}, cbk);
		});
	}
	if (!util.isEmptyObject(removedParams)) {
		tasks.push(function(cbk) {
			request.doPost("/driver/remove-params", {
				driverId : obj.ID,
				user : req.user.NAME,
				params : request.convertParams(removedParams)
			}, cbk);
		});
	}
	async.parallel(tasks, function(err, results) {
		callback(err);
	});
};

module.exports.removeDriver = function(req, old, callback) {
	obj.ID = "" + obj.ID;
	callback();
};
