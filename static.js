var config = require('dcim-config');
var permissions = require('dcim-permissions');

module.exports = function(req, res) {
	var str = 'window.WUI = window.WUI || {};';
	str = str + 'window.WUI.objectTypeDef=' + JSON.stringify(config.objectTypeDef) + ';';
	str = str + 'window.WUI.objectTypes=' + JSON.stringify(config.objectTypes) + ';';
	str = str + 'window.WUI.accountRights=' + JSON.stringify(config.accountRights) + ';';
	str = str + 'window.WUI.themes=' + JSON.stringify(config.themes) + ';';
	str = str + 'window.WUI.stationTypes=' + JSON.stringify(config.stationTypes) + ';';
	str = str + 'window.WUI.roomTypes=' + JSON.stringify(config.roomTypes) + ';';
	str = str + 'window.WUI.powerTypes=' + JSON.stringify(config.powerTypes) + ';';
	str = str + 'window.WUI.deviceTypes=' + JSON.stringify(config.deviceTypes) + ';';
	str = str + 'window.WUI.regionTypes=' + JSON.stringify(config.regionTypes) + ';';
	str = str + 'window.WUI.businessTypes=' + JSON.stringify(config.businessTypes) + ';';
	str = str + 'window.WUI.mapCfg=' + JSON.stringify(config.map) + ';';
	str = str + 'window.WUI.menus=' + JSON.stringify(config.menus) + ';';
	str = str + 'window.WUI.root_object_id=' + config.root_object_id + ';';
	str = str + 'window.WUI.requestInteval=' + JSON.stringify(config.requestInteval) + ';';
	str = str + 'window.WUI.alarmLevels=' + JSON.stringify(config.alarmLevels) + ';';
	str = str + 'window.WUI.alarmTypes=' + JSON.stringify(config.alarmTypes) + ';';
	str = str + 'window.WUI.signalType=' + JSON.stringify(config.signalType) + ';';
	str = str + 'window.WUI.signalTypeDef=' + JSON.stringify(config.signalTypeDef) + ';';	
	str = str + 'window.WUI.object_ex=' + JSON.stringify(config.object_ex) + ';';
	str = str + 'window.WUI.energyConsumptionType=' + JSON.stringify(config.energyConsumptionType) + ';';
	str = str + 'window.WUI.conditionTypes=' + JSON.stringify(config.conditionTypes) + ';';
	str = str + 'window.WUI.maxRowItem=12;';

	permissions.getCurrentUser(req, res, function(err, account) {
		if (err) {
			res.send(str);
			return;
		} else {
			if (account.right) {
				str = str + 'window.WUI.userRights=' + JSON.stringify(account.right.rights) + ';';
			}
			res.send(str);
		}
	});
};