var config = require('dcim-config');
var request = require('request');
var qs = require('querystring');

function makeUrl(path) {
	return "http://" + config.scCluster.host + ":" + config.scCluster.httpPort + config.scCluster.rootPath + path;
}

module.exports.convertParams = function(params) {
	for (key in params) {
		params[key] = "" + params[key];
	}
	return params;
};
function isSuccess(statusCode) {
	return statusCode >= 200 && statusCode < 300;
}
module.exports.doPost = function(path, requestData, callback) {
	var jsbody = JSON.stringify(requestData, function(key, value) {
		if (typeof value === 'number') {
			return "" + value;
		}
		return value;
	},4);
	console.log(jsbody);
	request({
		url : makeUrl(path),
		method : "POST",
		json : true,
		headers : {
			"content-type" : 'application/json; charset=utf-8'
		},
		body : jsbody
	}, function(error, response, body) {
		if (error || !response) {
			callback(error);
		} else if (isSuccess(response.statusCode)) {
			callback(null, body);
		} else {
			callback(path + ":" + response.statusMessage + response.statusCode, body);
		}
	});
};

module.exports.doGet = function(path, callback) {
	request({
		url : makeUrl(path),
		method : "GET",
		json : true
	}, function(error, response, body) {
		if (error || !response) {
			callback(error);
		} else if (isSuccess(response.statusCode)) {
			callback(null, body);
		} else {
			callback(path + ":" + response.statusMessage + response.statusCode, body);
		}
	});
};