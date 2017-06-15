$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var cabinetModelUrl = "cabinet-model/cabinetModels";
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};
	var childObjects = [];

	function openObject(cabinetObject) {
		currentObject = cabinetObject;
		$('#cabinet-name-txt').text(currentObject.NAME);
		$('#cabinet-code-txt').text(currentObject.CODE);
		$('#cabinet-sequence-txt').text(currentObject.SEQUENCE);
		$('#cabinet-depth-txt').text(currentObject.CABINET_DEPTH.toFixed(3) + " 米");
		$('#cabinet-start-use-date').text(WUI.dateFormat(currentObject.START_USE_DATE));
		$('#cabinet-expect-end-date').text(WUI.dateFormat(currentObject.EXPECT_END_DATE));

		WUI.ajax.get(cabinetModelUrl, {}, function(results) {
			for (var i = 0; i < results.length; i++) {
				if (results[i].ID === currentObject.CABINET_MODEL) {
					var model = results[i];
					$('#cabinet-model-txt').html(model.NAME);
					$('#cabinet-u1_position-txt').html(model.U1_POSITION === 0 ? "顶部" : "底部");
					$('#cabinet-u-count-txt').html(model.U_COUNT);
					break;
				}
			}
		}, function() {
			$.messager.alert('失败', "读取机柜型号失败，请重试！");
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
			$("#cabinet-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#cabinet-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
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
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(cabinetObject) {
				openObject(cabinetObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.CABINNET].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
