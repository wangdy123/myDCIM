$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};

	function openObject(cabinetGroupObject) {
		currentObject = cabinetGroupObject;
		$('#cabinetGroup-name-txt').text(currentObject.NAME);
		$('#cabinetGroup-code-txt').text(currentObject.CODE);
		$('#cabinetGroup-count-txt').text(currentObject.CABINET_COUNT);
		$('#cabinetGroup-depth-txt').text(currentObject.CABINET_DEPTH.toFixed(3)+" 米");
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
			$("#cabinetGroup-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#cabinetGroup-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
		requestStatus();
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(cabinetGroupObject) {
				openObject(cabinetGroupObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.CABINNET_GROUP].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
