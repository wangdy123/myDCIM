$(function() {
	var statusUrl = 'monitor/status/';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};

	function openObject(defaultObject) {
		currentObject = defaultObject;
		$('#default-name-txt').text(currentObject.NAME);
		$('#default-code-txt').text(currentObject.CODE);
		requestStatus();
	}

	function requestStatus() {
		if (WUI.detail.realtimeValueTimer) {
			clearTimeout(WUI.detail.realtimeValueTimer);
			WUI.detail.realtimeValueTimer = null;
		}
		WUI.ajax.get(statusUrl + currentObject.ID, {}, function(status) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			$("#default-alarmLevel1-count").text(status.alarmLevel1Count);
			$("#default-alarmLevel2-count").text(status.alarmLevel2Count);
			$("#default-alarmLevel3-count").text(status.alarmLevel3Count);
			$("#default-alarmLevel4-count").text(status.alarmLevel4Count);
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			if (!object) {
				return;
			}
			openObject(object);
		}
	});
});
