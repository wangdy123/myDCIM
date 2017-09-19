$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};

	function openObject(rackGroupObject) {
		currentObject = rackGroupObject;
		$('#rackGroup-name-txt').text(currentObject.NAME);
		$('#rackGroup-code-txt').text(currentObject.CODE);
		$('#rackGroup-count-txt').text(currentObject.RACK_COUNT);
		$('#rackGroup-depth-txt').text(currentObject.RACK_DEPTH.toFixed(3)+" 米");
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
			$("#rackGroup-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#rackGroup-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
		requestStatus();
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(rackGroupObject) {
				openObject(rackGroupObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.RACK_GROUP].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
