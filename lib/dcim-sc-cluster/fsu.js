var request = require("./sc_request");
var async = require("async");
var util = require("dcim-util");

module.exports.getModels = function(req, callback) {
	request.doGet("/fsu/get-supported-models", function(err, result) {
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
	request.doGet("/fsu/get-model-params/" + model, function(err, result) {
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

module.exports.restartFsu = function(req, fsuId, callback) {
	fsuId = "" + fsuId;
	request.doPost("/fsu/restart-fsu", {
		fsuId : fsuId,
		user : req.user.NAME
	}, function(err, result) {
		callback(err);
	});
};

module.exports.createFsu = function(req, obj, callback) {
	obj.ID = "" + obj.ID;
	obj.params = request.convertParams(obj.params);
	request.doPost("/fsu/create-fsu", {
		fsuId : obj.ID,
		user : req.user.NAME,
		name : obj.NAME,
		model : obj.MODEL,
		params : obj.params
	}, function(err, result) {
		callback(err);
	});
};

module.exports.updateFsu = function(req, obj, old, callback) {
	obj.ID = "" + obj.ID;
	var tasks = [];
	if (old.NAME !== obj.NAME) {
		tasks.push(function(cbk) {
			request.doPost("/fsu/rename-fsu", {
				fsuId : obj.ID,
				user : req.user.NAME,
				newName : obj.NAME
			}, cbk);
		});
	}
	if (old.MODEL !== obj.MODEL) {
		tasks.push(function(cbk) {
			request.doPost("/fsu/change-model", {
				fsuId : obj.ID,
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
				fsuId : obj.ID,
				user : req.user.NAME,
				params : request.convertParams(changedParams)
			}, cbk);
		});
	}
	if (!util.isEmptyObject(removedParams)) {
		tasks.push(function(cbk) {
			request.doPost("/fsu/remove-params", {
				fsuId : obj.ID,
				user : req.user.NAME,
				params : request.convertParams(removedParams)
			}, cbk);
		});
	}
	async.parallel(tasks, function(err, results) {
		callback(err);
	});
};