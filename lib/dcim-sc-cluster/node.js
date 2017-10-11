var request = require("./sc_request");
var async = require("async");
var util = require("dcim-util");

var objectModule = {
	1 : require("./adminregion"),
	2 : require("./construction"),
	3 : require("./construction"),
	4 : require("./construction"),
	5 : require("./construction"),
	6 : require("./construction"),
	11 : require("./device"),
	21 : require("./device")
};
function makeId(obj) {
	return "" + obj.ID;
}

module.exports.createNode = function(req, obj, signals, callback) {
	objectModule[obj.OBJECT_TYPE].createObject(req, obj, signals, callback);
};

module.exports.updateNode = function(req, obj, old, callback) {
	objectModule[obj.OBJECT_TYPE].updateObject(req, obj, old, callback);
};

module.exports.removeNode = function(req, old, parent, callback) {
	callback();
//	if (parent) {
//		objectModule[parent.OBJECT_TYPE].removeNode(req, old, callback);
//	}
};