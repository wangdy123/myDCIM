$(function() {
	var statusUrl = 'detail/regionStatus';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};

	function openObject(regionObject) {
		currentObject = regionObject;
		$('#region-name-txt').text(currentObject.NAME);
		$('#region-zip-code-txt').text(currentObject.CODE);
		$('#region-ABBREVIATION-txt').text(currentObject.ABBREVIATION);
		$('#region-LONGITUDE-txt').text(currentObject.LONGITUDE.toFixed(6));
		$('#region-LATITUDE-txt').text(currentObject.LATITUDE.toFixed(6));
		requestStatus();
	}

	function requestStatus() {
		if (WUI.detail.realtimeValueTimer) {
			clearTimeout(WUI.detail.realtimeValueTimer);
			WUI.detail.realtimeValueTimer = null;
		}
		WUI.ajax.get(statusUrl + "/" + currentObject.ID, {}, function(status) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			$("#region-building-count").text(status.buildingCount);
			$("#region-room-count").text(status.roomCount);
			$("#region-cabinet-count").text(status.cabinetCount);
			$("#region-alarmLevel1-count").text(status.alarmLevel1Count);
			$("#region-alarmLevel2-count").text(status.alarmLevel2Count);
			$("#region-alarmLevel3-count").text(status.alarmLevel3Count);
			$("#region-alarmLevel4-count").text(status.alarmLevel4Count);
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			if(!object){
				return;
			}
			openObject(object);
		}
	});
});
