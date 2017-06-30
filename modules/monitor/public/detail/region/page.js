$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var statusUrl = 'monitor/status';
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
			if (status.ID !== currentObject.ID) {
				return;
			}
			$("#region-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#region-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(regionObject) {
				openObject(regionObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.REGION].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
