$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};

	function openObject(roomObject) {
		currentObject = roomObject;
		$('#room-name-txt').text(currentObject.NAME);
		$('#room-code-txt').text(currentObject.CODE);
		$('#room-desc-txt').text(currentObject.DESCRIPTION);
		if (currentObject.ROOM_TYPE in WUI.roomTypes) {
			$('#room-type-txt').text(WUI.roomTypes[currentObject.ROOM_TYPE]);
		}
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
			$("#room-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#room-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(roomObject) {
				openObject(roomObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.ROOM].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
