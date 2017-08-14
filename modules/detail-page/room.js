var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var config = require('dcim-config');
var objectDao = require('dcim-object-dao');

// TODO::获取对象实时状态
app.post('/roomStatus/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var status = {
		totolEnergy : 2,
		itEnergy : 3,
		maxPower : 2,
		minPower : 22,
		pue : 1.5,
		alarmLevel1Count : 5,
		alarmLevel2Count : 2,
		alarmLevel3Count : 22,
		alarmLevel4Count : 1
	};
	res.send(status);
});

app.get('/roomProfile/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var profile = {
		safetyPerson : '张上',
		department : '运维部'
	};
	res.send(profile);
});

app.get('/roomEnergy/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var energys = [ {
		type : 1,
		time : '2017-11-15T12:11:10',
		value : 158
	}, {
		type : 2,
		time : '2017-11-15T12:11:10',
		value : 24
	}, {
		type : 3,
		time : '2017-11-15T12:11:10',
		value : 45
	}, {
		type : 4,
		time : '2017-11-15T12:11:10',
		value : 5
	}, {
		type : 1,
		time : '2017-11-15T13:11:10',
		value : 158
	}, {
		type : 2,
		time : '2017-11-15T13:11:10',
		value : 24
	}, {
		type : 3,
		time : '2017-11-15T13:11:10',
		value : 45
	}, {
		type : 4,
		time : '2017-11-15T13:11:10',
		value : 5
	}, {
		type : 1,
		time : '2017-11-15T14:11:10',
		value : 158
	}, {
		type : 2,
		time : '2017-11-15T14:11:10',
		value : 24
	}, {
		type : 3,
		time : '2017-11-15T14:11:10',
		value : 45
	}, {
		type : 4,
		time : '2017-11-15T14:11:10',
		value : 5
	}, {
		type : 1,
		time : '2017-11-15T15:11:10',
		value : 158
	}, {
		type : 2,
		time : '2017-11-15T15:11:10',
		value : 24
	}, {
		type : 3,
		time : '2017-11-15T15:11:10',
		value : 45
	}, {
		type : 4,
		time : '2017-11-15T15:11:10',
		value : 5
	}, {
		type : 1,
		time : '2017-11-15T16:11:10',
		value : 158
	}, {
		type : 2,
		time : '2017-11-15T16:11:10',
		value : 24
	}, {
		type : 3,
		time : '2017-11-15T16:11:10',
		value : 45
	}, {
		type : 4,
		time : '2017-11-15T17:11:10',
		value : 5
	} ];
	res.send(energys);
});
