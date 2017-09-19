$(function() {
	var pageTamplateUrl = 'detail/pageTamplate/devicetype1012';
	var objectNodeUrl = 'logicobject/objectNodes';
	var deviceModelUrl = "device-model/deviceModels";
	var deviceVenderUrl = "device-vender/deviceVenders";
	var statusUrl = 'detail/deviceStatus';
	var pageConfigUrl = 'detail/pageConfig/';

	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};
	var signalObjects = [];
	var requestIds = [];
	function openObject(deviceObject) {
		currentObject = deviceObject;

		$('#device-code-txt').text(currentObject.CODE);
		for (var i = 0; i < WUI.deviceTypes.length; i++) {
			if (WUI.deviceTypes[i].type === currentObject.DEVICE_TYPE) {
				$('#device-type-txt').text(WUI.deviceTypes[i].name);
				break;
			}
		}

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

		$('#device-inputPower').text(WUI.getPropertyValue(currentObject.properties, "inputPower"));
		$('#device-coolingCapacity').text(WUI.getPropertyValue(currentObject.properties, "coolingCapacity"));

		WUI.ajax.get(pageConfigUrl + currentObject.ID, {}, function(config) {
			createPage(config.CONFIG);
		}, function() {
			WUI.ajax.get(pageTamplateUrl, {}, function(result) {
				createPage(result);
			}, function() {
				$.messager.alert('失败', "读取页面配置失败，请重试！");
			});
		});

	}
	function createPage(pageConfig) {
		createSystemPanel(pageConfig);
		requestStatus();
		WUI.detail.initImg($("#device-img"), pageConfig.img, currentObject);
	}

	function createSystemPanel(pageConfig) {
		//TODO 添加通讯状态显示
		$('#device-run-params').empty();
		pageConfig.defaults.sort(function(a, b) {
			return a.signalId > b.signalId;
		});

		pageConfig.defaults.forEach(function(item) {
			var config = {
				type : item.type,
				unit : item.unit,
				name : item.name,
				elementName : "p",
				fixedNum : item.fixedNum
			};
			signalObjects.push(WUI.detail.createSignalItem($('#device-run-params'), item.signalId, config, true));
			requestIds.push({
				objectId : currentObject.ID,
				signalId : item.signalId
			});
		});
	}

	function setAlarmCount(alarmCount) {
		if (alarmCount) {
			$("#device-alarmLevel1-count").text(alarmCount.alarmLevel1Count);
			$("#device-alarmLevel2-count").text(alarmCount.alarmLevel2Count);
			$("#device-alarmLevel3-count").text(alarmCount.alarmLevel3Count);
			$("#device-alarmLevel4-count").text(alarmCount.alarmLevel4Count);
		}
	}
	function setValue(values) {
		signalObjects.forEach(function(item) {
			var value = WUI.detail.findValue(currentObject.ID, item.signalId, values);
			if (value) {
				WUI.detail.setTableItemValue(item, value);
			}
		});
		var linkStatus = WUI.detail.findValue(currentObject.ID, 1, values);
		if (linkStatus) {
			item.$node.html('<span class="' + (linkStatus.value ? "detail-on-icon" : "detail-off-icon") + '"></span>');
		}
	}
	function requestStatus() {
		if (WUI.detail.realtimeValueTimer) {
			clearTimeout(WUI.detail.realtimeValueTimer);
			WUI.detail.realtimeValueTimer = null;
		}
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
