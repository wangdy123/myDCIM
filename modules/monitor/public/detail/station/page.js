$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;

	WUI.detail = WUI.detail || {};
	var childObjects = [];

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

		WUI.ajax.get(objectNodeUrl, {
			id : currentObject.ID
		}, function(objects) {
			childObjects = objects;
			for (var i = 0; i < childObjects.length; i++) {
				WUI.detail.createObjectIcon($("#child-object-panel"), childObjects[i]);
			}
			requestStatus();
		}, function() {
			$.messager.alert('失败', "读取配置失败！");
		});
	}

	function findObject(objectId) {
		for (var i = 0; i < childObjects.length; i++) {
			if (childObjects[i].ID === objectId) {
				return childObjects[i];
			}
		}
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
			for (var i = 0; i < status.childObject.length; i++) {
				var object = findObject(status.childObject[i].ID);
				WUI.detail.setObjectStatus(object, status.childObject[i]);
			}
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
