$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var deviceModelUrl = "device-model/deviceModels";
	var deviceVenderUrl = "device-vender/deviceVenders";
	var realtimeValueUrl = 'monitor/realtimeValue';
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

		$('#device-rated-power').text(WUI.getPropertyValue(currentObject.properties, "ratedPower"));
		$("#device-server-ip").text(WUI.getPropertyValue(currentObject.properties, "ip"));
		$('#device-server-bmc').text(WUI.getPropertyValue(currentObject.properties, "bmc"));

		WUI.ajax.get(pageConfigUrl + currentObject.ID, {}, createPage, function() {
			createPage({
				img : 'u1258.png',
				cpuStatus : [ {
					name : 'CPU温度',
					type : 1,
					fixedNum : 1,
					signalId : 121001,
					unit : '℃'
				}, {
					name : '电源功率',
					type : 1,
					fixedNum : 1,
					signalId : 122001,
					unit : 'W'
				}, {
					name : '风扇转数',
					type : 1,
					fixedNum : 2,
					signalId : 123001,
					unit : 'RPM'
				} ],
				temperatures : [ {
					name : 'CPU温度',
					signalId : 122001
				}, {
					name : 'CPU温度',
					signalId : 122001
				} ],
				gauges : [ {
					name : 'CPU温度',
					signalId : 122001
				}, {
					name : 'CPU温度',
					signalId : 122001
				} ],
				lines : [ {
					name : 'CPU温度',
					signalId : 122001
				}, {
					name : 'CPU温度',
					signalId : 122001
				} ]
			});
		});

	}
	function createPage(pageConfig) {
		createRunningStatusPanel(pageConfig);
		createCoreIndicators(pageConfig);
		requestStatus();
		WUI.detail.initImg($("#rack-server-img"), pageConfig.img);
	}

	function createValueItem($tr, signalId, loadNum, config) {
		signalId = parseInt(signalId, 10) + loadNum;
		signalObjects.push(WUI.detail.createTableItem($tr, signalId, config));
		requestIds.push({
			objectId : currentObject.ID,
			signalId : signalId
		});
	}

	function createRunningStatusPanel(pageConfig) {
		$('#server-running-status').empty();
		var cpu = WUI.getPropertyValue(currentObject.properties, "cpu");
		if (!cpu) {
			cpu = 0;
		}
		cpu = parseInt(cpu, 10);
		var $table = $(document.createElement("table"));
		$table.addClass("table");
		$table.attr("cellspacing", "0");
		$table.css("margin", "5px");
		$table.css("display", "inline-block");
		$('#server-running-status').append($table);
		var $head = $(document.createElement("tr"));
		function createRowHead() {
			pageConfig.cpuStatus.forEach(function(item) {
				item.$tr = $(document.createElement("tr"));
				$table.append(item.$tr);
				item.$tr.append('<th class="detail-table-head">' + item.name + '</th>');
			});
		}

		for (var i = 0; i < cpu; i++) {
			if ((i % WUI.maxRowItem) === 0) {
				createRowHead();
			}
			pageConfig.cpuStatus.forEach(function(item) {
				var config = {
					className : "detail-table-cell",
					type : item.type,
					unit : item.unit,
					fixedNum : item.fixedNum
				};
				createValueItem(item.$tr, item.signalId, i, config);
			});
		}
	}

	function createCoreIndicators(pageConfig) {

	}
	function setValue(values) {
		signalObjects.forEach(function(item) {
			var value = WUI.detail.findValue(currentObject.ID, item.signalId, values);
			if (value) {
				WUI.detail.setTableItemValue(item, value);
			}
		});
	}
	function requestStatus() {
		if (WUI.detail.realtimeValueTimer) {
			clearTimeout(WUI.detail.realtimeValueTimer);
			WUI.detail.realtimeValueTimer = null;
		}
		WUI.ajax.post(realtimeValueUrl, requestIds, function(signalValues) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			setValue(signalValues);
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
