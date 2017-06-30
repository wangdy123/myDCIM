$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;

	WUI.detail = WUI.detail || {};

	function openObject(stationObject) {
		currentObject = stationObject;
		$('#station-name-txt').text(currentObject.NAME);
		$('#station-code-txt').text(currentObject.CODE);
		$('#station-LONGITUDE-txt').text(currentObject.LONGITUDE.toFixed(6));
		$('#station-LATITUDE-txt').text(currentObject.LATITUDE.toFixed(6));
		if (currentObject.STATION_TYPE in WUI.stationTypes) {
			$('#station-type-txt').text(WUI.stationTypes[currentObject.STATION_TYPE]);
		}
		$('#station-address-txt').text(currentObject.ADDRESS);
		WUI.detail.setHtml($('#station-desc-txt'), currentObject.DESCRIPTION);
		requestStatus();
	}

	function requestStatus() {
		if (WUI.detail.realtimeValueTimer) {
			clearTimeout(WUI.detail.realtimeValueTimer);
			WUI.detail.realtimeValueTimer = null;
		}
		WUI.ajax.get(statusUrl + "/" + currentObject.ID, {}, function(status) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			if (status.ID !== currentObject.ID) {
				return;
			}
			$("#station-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#station-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(stationObject) {
				openObject(stationObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.STATION_BASE].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
