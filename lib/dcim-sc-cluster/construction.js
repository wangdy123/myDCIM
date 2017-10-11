var request = require("./sc_request");
var async = require("async");
var util = require("dcim-util");
var signal = require("./signal");

function makeId(obj) {
	return "" + obj.ID;
}

module.exports.createObject = function(req, obj, signals, callback) {
	callback();
};

module.exports.updateObject = function(req, obj, old, callback) {
	callback();
};

module.exports.removeNode = function(req, old, callback) {
	callback();
};
