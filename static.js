var config = require('dcim-config')

module.exports=function(req, res) {
	var str='window.WUI = window.WUI || {};';
	str=str+'window.WUI.objectTypeDef='+ JSON.stringify(config.objectTypeDef)+';';
	str=str+'window.WUI.objectTypes='+ JSON.stringify(config.objectTypes)+';';
	str=str+'window.WUI.accountRights='+ JSON.stringify(config.accountRights)+';';
	str=str+'window.WUI.themes='+ JSON.stringify(config.themes)+';';
	str=str+'window.WUI.stationTypes='+ JSON.stringify(config.stationTypes)+';';
	str=str+'window.WUI.roomTypes='+ JSON.stringify(config.roomTypes)+';';
	str=str+'window.WUI.powerTypes='+ JSON.stringify(config.powerTypes)+';';
	str=str+'window.WUI.deviceTypes='+ JSON.stringify(config.deviceTypes)+';';
	res.send(str);
}