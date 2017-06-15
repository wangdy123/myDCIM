$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var deviceModelUrl = "device-model/deviceModels";
	var deviceVenderUrl = "device-vender/deviceVenders";
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};
	var childObjects = [];

	function openObject(deviceObject) {
		currentObject = deviceObject;
		$('#device-name-txt').text(currentObject.NAME);
		$('#device-code-txt').text(currentObject.CODE);
		for (var i = 0; i < WUI.businessTypes.length; i++) {
			if (WUI.businessTypes[i].type === currentObject.BUSINESS_TYPE) {
				$('#device-business-type-txt').text(WUI.businessTypes[i].name);
				break;
			}
		}
		for (var i = 0; i < WUI.deviceTypes.length; i++) {
			if (WUI.deviceTypes[i].type === currentObject.DEVICE_TYPE) {
				$('#device-type-txt').text(WUI.deviceTypes[i].name);
				break;
			}
		}

		$('#device-start-use-date').text(WUI.dateFormat(currentObject.START_USE_DATE));
		$('#device-expect-end-date').text(WUI.dateFormat(currentObject.EXPECT_END_DATE));

		WUI.ajax.get(deviceModelUrl, {}, function(results) {
			for (var i = 0; i < results.length; i++) {
				if (results[i].ID === currentObject.MODEL) {
					var model = results[i];
					$('#device-model-txt').text(model.NAME);
					break;
				}
			}
		}, function() {
			$.messager.alert('失败', "读取设备型号失败，请重试！");
		});
		WUI.ajax.get(deviceVenderUrl, {}, function(results) {
			for (var i = 0; i < results.length; i++) {
				if (results[i].ID === currentObject.VENDER) {
					var model = results[i];
					$('#device-vender-txt').text(model.NAME);
					break;
				}
			}
		}, function() {
			$.messager.alert('失败', "读取设备厂家失败，请重试！");
		});

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
			$("#device-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#device-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
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
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(deviceObject) {
				openObject(deviceObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.CABINNET].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
