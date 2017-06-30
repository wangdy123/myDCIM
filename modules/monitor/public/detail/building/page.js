$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};

	function openObject(buildingObject) {
		currentObject = buildingObject;
		$('#building-name-txt').text(currentObject.NAME);
		$('#building-code-txt').text(currentObject.CODE);
		$('#building-ground-txt').text(currentObject.FLOOR_GROUND + "层");
		$('#building-underground-txt').text(currentObject.FLOOR_UNDERGROUND + "层");
		WUI.detail.setHtml($('#building-desc-txt'), currentObject.DESCRIPTION);
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
			$("#building-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#building-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(buildingObject) {
				openObject(buildingObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.BUILDDING].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
