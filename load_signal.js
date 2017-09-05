var xlsx = require('node-xlsx');
var fs = require('fs');
// 读取文件内容

var obj = xlsx.parse(__dirname + '/doc/广东盈嘉DCIM信号字典表.xlsx');
var excelObj = obj[2].data;

var deviceType = null;
var signals = {
	"defaults" : []
};

function changeDeviceType(newType) {
	var type = deviceType;
	if (deviceType) {
		fs.writeFile(__dirname + '/conf/signal/' + type + '.json', JSON.stringify(signals, null, 4), function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log("设备类型：" + type);
			}
		});
	}
	deviceType = newType;
	signals = {
		"defaults" : []
	};
}
function setValue(row, index, parse, signal, key) {
	if (row.length < (index + 1)) {
		return;
	}
	var value = parse(row[index]);
	if (isNaN(value)) {
		return;
	} else {
		signal[key] = value;
	}
}

function setString(row, index, signal, key) {
	if (row[index]) {
		signal[key] = row[index];
	}
}

function setAlarmLevel(row, index, signal) {
	switch (row[index]) {
	case '四级告警':
		signal.ALARM_LEVEL = 4;
		break;
	case '三级告警':
		signal.ALARM_LEVEL = 3;
		break;
	case '二级告警':
		signal.ALARM_LEVEL = 2;
		break;
	case '一级告警':
		signal.ALARM_LEVEL = 1;
		break;
	}
}
var lastSignal = null;
function createCondition(item) {
	if (item[5] || item[11]) {
	var condition = {};
	setString(item, 5, condition, "ALARM_DESC");
	setAlarmLevel(item, 11, condition);
	setValue(item, 13, parseInt, condition, 'ALARM_DELAY');
	setValue(item, 16, parseFloat, condition, 'ABSOLUTE_VAL');
	setValue(item, 17, parseFloat, condition, 'RELATIVE_VAL');
	if (lastSignal.conditions) {
		lastSignal.conditions.push(condition);
	}
	}
}
excelObj.forEach(function(item) {
	if (item.length < 11) {
		return;
	}
	var signalNo = parseInt(item[10], 10);
	if (isNaN(signalNo)) {
		if (!lastSignal) {
			console.log(item[10]);
			return;
		}
		createCondition(item);
	}
	if (lastSignal && lastSignal.SIGNAL_ID === signalNo) {
		createCondition(item);
	} else {
		var currentDeviceType = Math.floor(signalNo / 1000000);
		var signalType = Math.floor(signalNo / 100000) % 10;
		var group = item[2] ? item[2] : "defaults";
		if (currentDeviceType !== deviceType) {
			changeDeviceType(currentDeviceType);
		}
		var signal = {
			SIGNAL_ID : signalNo,
			SIGNAL_TYPE : signalType,
			SIGNAL_NAME : item[1],
			conditions : []
		};
		lastSignal = signal;
		setString(item, 4, signal, "UNIT");
		setString(item, 6, signal, "NORMAL_DESC");
		setString(item, 7, signal, "DESCRIPTION");
		setString(item, 8, signal, "EXPLANATION");
		setValue(item, 12, parseFloat, signal, 'RECORD_RERIOD');
		setValue(item, 14, parseInt, signal, 'RECOVER_DELAY');
		setValue(item, 15, parseInt, signal, 'RECORD_RERIOD');
		if (signals[group]) {
			signals[group].push(signal);
		} else {
			signals[group] = [ signal ];
		}
		createCondition(item);
	}
});
changeDeviceType(100);