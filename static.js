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
	str = str + 'window.WUI.root_object_id=' + config.config.root_object_id + ';';
	str = str + 'window.WUI.mapCfg=' + JSON.stringify(config.config.map) + ';';
	str = str + 'window.WUI.menus=' + JSON.stringify(config.menus) + ';';
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
}