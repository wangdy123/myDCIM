$(function() {
	var signalUrl = 'logicobject/signals';
	var deviceModelUrl = "device-model/deviceModels";
	var deviceVenderUrl = "device-vender/deviceVenders";
	var statusUrl = 'detail/deviceStatus';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};
	var signals = [];

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

		WUI.ajax.get(signalUrl, {
			parentId : currentObject.ID
		}, function(objects) {
			signals = objects;
			for (var i = 0; i < signals.length; i++) {
				WUI.detail.createSignal($("#child-signal-panel"), signals[i]);
			}
			requestStatus();
		}, function() {
			$.messager.alert('失败', "读取配置失败！");
		});
	}

	function findsignal(objectId, signalId) {
		for (var i = 0; i < signals.length; i++) {
			if (signals[i].OBJECT_ID === objectId && signals[i].SIGNAL_ID === signalId) {
				return signals[i];
			}
		}
	}

	function setAlarmCount(alarmCount) {
		if (alarmCount) {
			$("#device-alarmLevel1-count").text(alarmCount.alarmLevel1Count);
			$("#device-alarmLevel2-count").text(alarmCount.alarmLevel2Count);
			$("#device-alarmLevel3-count").text(alarmCount.alarmLevel3Count);
			$("#device-alarmLevel4-count").text(alarmCount.alarmLevel4Count);
		}
	}
	function setValue(signalValues) {
		for (var i = 0; i < signalValues.length; i++) {
			var signal = findsignal(signalValues[i].objectId, signalValues[i].signalId);
			WUI.detail.setsignalValue(signal, signalValues[i]);
		}
	}
	function requestStatus() {
		if (WUI.detail.realtimeValueTimer) {
			clearTimeout(WUI.detail.realtimeValueTimer);
			WUI.detail.realtimeValueTimer = null;
		}
		if (signals.length <= 0) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			return;
		}
		var requestIds = [];
		signals.forEach(function(item) {
			requestIds.push({
				objectId : item.OBJECT_ID,
				signalId : item.SIGNAL_ID
			});
		});
		WUI.ajax.post(statusUrl, {
			objectId : currentObject.ID,
			requestIds : requestIds
		}, function(result) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			if (result.alarmCount) {
				setAlarmCount(result.alarmCount);
			}
			if (result.signalValues) {
				setValue(result.signalValues);
			}
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			openObject(object);
		}
	});

});
