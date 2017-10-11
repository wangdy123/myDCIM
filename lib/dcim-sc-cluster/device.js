var request = require("./sc_request");
var async = require("async");
var util = require("dcim-util");
var signal = require("./signal");

function makeId(obj) {
	return "" + obj.ID;
}

module.exports.createObject = function(req, obj, signals, callback) {
	var tasks = [];
	tasks.push(function(cbk) {
		request.doPost("/device/create-device", {
			deviceId : makeId(obj),
			user : req.user.NAME,
			name : obj.NAME,
			deviceType : "" + obj.DEVICE_TYPE,
			vendorModel : "" + obj.MODEL,
			propertyTagCode : obj.CODE,
			signals : signal.makeSignals(signals),
			alarms : signal.makeAlarms(signals),
			children : []
		}, function(err, result) {
			cbk(err);
		});
	});
	tasks.push(function(cbk) {
		request.doPost("/device/add-child", {
			deviceId : "" + obj.PARENT_ID,
			childId : makeId(obj),
			user : req.user.NAME
		}, cbk);
	});
	async.waterfall(tasks, function(err, results) {
		callback(err);
	});
};

module.exports.updateObject = function(req, obj, old, callback) {
	var tasks = [];
	if (old.NAME !== obj.NAME) {
		tasks.push(function(cbk) {
			request.doPost("/device/rename-device", {
				deviceId : makeId(obj),
				user : req.user.NAME,
				name : obj.NAME
			}, cbk);
		});
	}
	if (old.DEVICE_TYPE !== obj.DEVICE_TYPE) {
		tasks.push(function(cbk) {
			request.doPost("/device/change-device-type", {
				deviceId : makeId(obj),
				user : req.user.NAME,
				newType : obj.DEVICE_TYPE
			}, cbk);
		});
	}
	if (old.MODEL !== obj.MODEL) {
		tasks.push(function(cbk) {
			request.doPost("/device/change-vendor-model", {
				deviceId : makeId(obj),
				user : req.user.NAME,
				newModel : obj.MODEL
			}, cbk);
		});
	}
	if (old.CODE !== obj.CODE) {
		tasks.push(function(cbk) {
			request.doPost("/device/change-property-tag-code", {
				deviceId : makeId(obj),
				user : req.user.NAME,
				newPropertyCode : obj.CODE
			}, cbk);
		});
	}
	async.parallel(tasks, function(err, results) {
		callback(err);
	});
};

module.exports.removeNode = function(req, old, callback) {
	request.doPost("/device/remove-child", {
		deviceId : "" + old.PARENT_ID,
		childId : makeId(old),
		user : req.user.NAME
	}, callback);
};
