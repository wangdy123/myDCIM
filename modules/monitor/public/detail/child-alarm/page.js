$(function() {
	var alarmUrl = 'monitor/alarms';

	function openObject(object) {
		WUI.ajax.get(alarmUrl, {
			id : regionObject.ID
		}, function(alarms) {

		});
	}

	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : openObject
	});
});
