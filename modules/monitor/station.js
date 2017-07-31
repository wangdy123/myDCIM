var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var config = require('dcim-config');

// TODO::获取对象实时状态
app.get('/stationStatus/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var status = {
		totolEnergy : 2,
		itEnergy : 3,
		temperature : 22,
		humidity : 54,
		maxPower : 2,
		minPower : 22,
		energyStructure : [ {
			type : 1,
			value : 158
		}, {
			type : 2,
			value : 24
		}, {
			type : 3,
			value : 45
		}, {
			type : 4,
			value : 5
		} ],
		pue : 1.5,
		alarmLevel1Count : 5,
		alarmLevel2Count : 2,
		alarmLevel3Count : 22,
		alarmLevel4Count : 1
	};
	res.send(status);
});

app.get('/stationProfile/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var profile = {
		BUILDING : 2,
		IDC_ROOM : 3,
		SUPPORT_ROOM : 100,
		CABINET : 5,
		img:'u240.jpg'
	};
	res.send(profile);
});

app.get('/stationEnergyTop/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var energys = [ {
		id : 1,
		name : "1栋",
		value : 13254
	}, {
		id : 2,
		name : "2栋",
		value : 1354
	}, {
		id : 3,
		name : "3栋",
		value : 1254
	}, {
		id : 4,
		name : "4栋",
		value : 1324
	}, {
		id : 5,
		name : "5栋",
		value : 14254
	}, {
		id : 6,
		name : "6栋",
		value : 13278
	}, {
		id : 7,
		name : "7栋",
		value : 1354
	} ];
	res.send(energys);
});

app.get('/stationEnergy/:id', function(req, res) {
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
