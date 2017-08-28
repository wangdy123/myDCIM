var xlsx = require('node-xlsx');
var fs = require('fs');
// 读取文件内容

var obj = xlsx.parse(__dirname + '/广东盈嘉DCIM信号字典表.xlsx');
var excelObj = obj[2].data;

var deviceType = null;
var signals = {
	"defaults" : []
};

function changeDeviceType(newType) {
	var type = deviceType;
	if (deviceType) {
		fs.writeFile(__dirname + '/signal/' + type + '.json', JSON.stringify(signals, null, 4), function(err) {
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
excelObj.forEach(function(item) {
	if (item.length < 11) {
		return;
	}
	var signalNo = parseInt(item[10], 10);
	if (isNaN(signalNo)) {
		console.log(item[10]);
		return;
	}
	var currentDeviceType = Math.floor(signalNo / 1000000);
	var signalType = Math.floor(signalNo / 100000) % 10;
	var group = item[2] ? item[2] : "defaults";
	if (currentDeviceType !== deviceType) {
		changeDeviceType(currentDeviceType);
	}
	var signal = {
		SIGNAL_ID : signalNo,
		SIGNAL_TYPE : signalType,
		SIGNAL_NAME : item[1]
	};
	setString(item, 4, signal, "UNIT");
	setString(item, 5, signal, "ALARM_DESC");
	setString(item, 6, signal, "NORMAL_DESC");
	setString(item, 7, signal, "DESCRIPTION");
	setString(item, 8, signal, "EXPLANATION");
	setValue(item, 11, parseInt, signal, 'ALARM_LEVEL');
	setValue(item, 12, parseFloat, signal, 'RECORD_RERIOD');
	setValue(item, 13, parseInt, signal, 'ALARM_DELAY');
	setValue(item, 14, parseInt, signal, 'RECOVER_DELAY');
	setValue(item, 15, parseInt, signal, 'RECORD_RERIOD');
	setValue(item, 16, parseFloat, signal, 'ABSOLUTE_VAL');
	setValue(item, 17, parseFloat, signal, 'RELATIVE_VAL');
	if (signals[group]) {
		signals[group].push(signal);
	} else {
		signals[group] = [ signal ];
	}
});
changeDeviceType(100);