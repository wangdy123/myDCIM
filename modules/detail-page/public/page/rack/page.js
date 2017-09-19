$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var rackModelUrl = "rack-model/rackModels";
	var statusUrl = 'monitor/status';
	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};

	function openObject(rackObject) {
		currentObject = rackObject;
		$('#rack-name-txt').text(currentObject.NAME);
		$('#rack-code-txt').text(currentObject.CODE);
		$('#rack-sequence-txt').text(currentObject.SEQUENCE);
		$('#rack-depth-txt').text(currentObject.RACK_DEPTH.toFixed(3) + " 米");
		$('#rack-start-use-date').text(WUI.dateFormat(currentObject.START_USE_DATE));
		$('#rack-expect-end-date').text(WUI.dateFormat(currentObject.EXPECT_END_DATE));

		WUI.ajax.get(rackModelUrl, {}, function(results) {
			for (var i = 0; i < results.length; i++) {
				if (results[i].ID === currentObject.RACK_MODEL) {
					var model = results[i];
					$('#rack-model-txt').html(model.NAME);
					$('#rack-u1_position-txt').html(model.U1_POSITION === 0 ? "顶部" : "底部");
					$('#rack-u-count-txt').html(model.U_COUNT);
					break;
				}
			}
		}, function() {
			$.messager.alert('失败', "读取机柜型号失败，请重试！");
		});
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
			$("#rack-alarm-count-txt").html('<label>' + status.alarmCount + '</label>');
			$("#rack-status-txt").html('<label class="alarmLevel' + status.maxAlarmLevel + '-icon"></label>');
		}, function() {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(rackObject) {
				openObject(rackObject);
			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.CABINNET].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});
