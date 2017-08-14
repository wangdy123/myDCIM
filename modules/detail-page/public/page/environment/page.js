$(function() {
	var signalUrl = 'logicobject/signals';
	var objectNodeUrl = 'logicobject/objectNodes';
	var realtimeValueUrl = 'monitor/realtimeValue';
	var pageConfigUrl = 'detail/pageConfig/';

	var publisherName = "detail";
	var currentObject = null;
	WUI.detail = WUI.detail || {};
	var signalObjects = [];
	var requestIds = [];
	function openObject(deviceObject) {
		currentObject = deviceObject;
		WUI.ajax.get(signalUrl, {
			parentId : currentObject.ID
		}, function(objects) {
			objects.forEach(function(item) {
				requestIds.push({
					objectId : item.OBJECT_ID,
					signalId : item.SIGNAL_ID
				});
			});
			createEnvironment(objects);
			createCabinet(objects);
			createFireAlarm(objects);
			createDoorStatus(objects);
			createFlooding(objects);

			requestStatus();
		}, function() {
			$.messager.alert('失败', "读取配置失败！");
		});
	}

	function createEnvironment(signals) {
		$('#environment-temperature-table').empty();
		var temperatures = [];
		signals.forEach(function(item) {
			item.SIGNAL_ID = parseInt(item.SIGNAL_ID, 10);
			var num = Math.floor(item.SIGNAL_ID / 1000);
			var seq = item.SIGNAL_ID % 1000;
			if (num !== 101 && num !== 102) {
				return;
			}
			var temperature = WUI.findFromArray(temperatures, 'seq', seq);
			if (num === 101) {
				if (temperature) {
					temperature.temperature = item.SIGNAL_ID;
				} else {
					temperatures.push({
						seq : seq,
						temperature : item.SIGNAL_ID
					});
				}
			}
			if (num === 102) {
				if (temperature) {
					temperature.humidity = item.SIGNAL_ID;
				} else {
					temperatures.push({
						seq : seq,
						humidity : item.SIGNAL_ID
					});
				}
			}
		});
		if (temperatures.length === 0) {
			$('#environment-temperature-panel').hide();
			return;
		}
		$('#environment-temperature-panel').show();
		temperatures.sort(function(a, b) {
			return a.seq > b.seq;
		});
		var $table = $(document.createElement("table"));
		$table.addClass("table");
		$('#environment-temperature-table').append($table);
		$table.attr("cellspacing", "0");
		$table.css("margin", "5px");
		var $tr = $(document.createElement("tr"));
		$table.append($tr);
		$tr.append('<td class="environment-item"></td>');
		temperatures.forEach(function(item) {
			$tr.append('<td class="environment-item">温湿度' + item.seq + '</td>');
		});
		$tr = $(document.createElement("tr"));
		$table.append($tr);
		$tr.append('<td class="environment-item">温度(℃)</td>');
		var config = {
			className : "environment-value",
			type : 1,
			fixedNum : 1
		};
		temperatures.forEach(function(item) {
			if (item.temperature) {
				signalObjects.push(WUI.detail.createTableItem($tr, item.temperature, config));
			} else {
				$tr.append('<td></td>');
			}
		});
		$tr = $(document.createElement("tr"));
		$table.append($tr);
		$tr.append('<td class="environment-item">湿度(%RH)</td>');
		temperatures.forEach(function(item) {
			if (item.humidity) {
				signalObjects.push(WUI.detail.createTableItem($tr, item.humidity, config));
			} else {
				$tr.append('<td></td>');
			}
		});
	}
	function createCabinet(signals) {
		$('#cabinet-temperature-table').empty();
		var cabinets = [];
		function addSignal(cabinet, key, signalId) {
			if (cabinet) {
				cabinet[key] = signalId;
			} else {
				cabinet = {
					cabineSeq : cabineSeq
				};
				cabinet[key] = signalId;
				cabinets.push(cabinet);
			}
		}
		signals.forEach(function(item) {
			item.SIGNAL_ID = parseInt(item.SIGNAL_ID, 10);
			if (Math.floor(item.SIGNAL_ID / 1000) !== 103) {
				return;
			}
			var seq = item.SIGNAL_ID % 1000;
			var cabinetSeq = Math.floor(seq / 10);
			var cabinet = WUI.findFromArray(cabinets, 'cabineSeq', cabineSeq);

			switch (seq % 10) {
			case 1:
				addSignal(cabinet, "ft", item.SIGNAL_ID);
				break;
			case 2:
				addSignal(cabinet, "fm", item.SIGNAL_ID);
				break;
			case 3:
				addSignal(cabinet, "fb", item.SIGNAL_ID);
				break;
			case 4:
				addSignal(cabinet, "bt", item.SIGNAL_ID);
				break;
			case 5:
				addSignal(cabinet, "bm", item.SIGNAL_ID);
				break;
			case 5:
				addSignal(cabinet, "bb", item.SIGNAL_ID);
				break;
			}
		});
		if (cabinets.length === 0) {
			$('#cabinet-temperature-panel').hide();
			return;
		}
		$('#cabinet-temperature-panel').show();
		cabinets.sort(function(a, b) {
			return a.cabineSeq > b.cabineSeq;
		});
		var $table = $(document.createElement("table"));
		$table.addClass("table");
		$('#cabinet-temperature-table').append($table);
		$table.attr("cellspacing", "0");
		$table.css("margin", "5px");
		var trs = {};
		function createRowHead() {
			var trs = {};
			trs.$head = $(document.createElement("tr"));
			$table.append(trs.$head);
			trs.$head.append('<td class="environment-item"></td>');
			trs.$position = $(document.createElement("tr"));
			$table.append(trs.$position);
			trs.$position.append('<td class="environment-item"></td>');
			trs.$top = $(document.createElement("tr"));
			$table.append(trs.$top);
			trs.$top.append('<td class="environment-item">上(℃)</td>');
			trs.$mid = $(document.createElement("tr"));
			$table.append(trs.$mid);
			trs.$mid.append('<td class="environment-item">中(℃)</td>');
			trs.$bottom = $(document.createElement("tr"));
			$table.append(trs.$bottom);
			trs.$bottom.append('<td class="environment-item">下(℃)</td>');
			return trs;
		}
		var config = {
			className : "environment-value",
			type : 1,
			fixedNum : 1
		};
		for (var i = 0; i < cabinets.length; i++) {
			var item = cabinets[i];
			if ((i % 6) === 0) {
				trs = createRowHead();
			}
			trs.$head.append('<td class="environment-item" colspan="2">柜' + item.cabineSeq + '</td>');
			trs.$position.append('<td class="environment-item">前</td>');
			trs.$position.append('<td class="environment-item">后</td>');
			if (item.ft) {
				signalObjects.push(WUI.detail.createTableItem(trs.$top, item.ft, config));
			} else {
				trs.$top.append('<td></td>');
			}
			if (item.bt) {
				signalObjects.push(WUI.detail.createTableItem(trs.$top, item.bt, config));
			} else {
				trs.$top.append('<td></td>');
			}
			if (item.fm) {
				signalObjects.push(WUI.detail.createTableItem(trs.$mid, item.fm, config));
			} else {
				trs.$mid.append('<td></td>');
			}
			if (item.bm) {
				signalObjects.push(WUI.detail.createTableItem(trs.$mid, item.bm, config));
			} else {
				trs.$mid.append('<td></td>');
			}
			if (item.fb) {
				signalObjects.push(WUI.detail.createTableItem(trs.$bottom, item.fb, config));
			} else {
				trs.$bottom.append('<td></td>');
			}
			if (item.bb) {
				signalObjects.push(WUI.detail.createTableItem(trs.$bottom, item.bb, config));
			} else {
				trs.$bottom.append('<td></td>');
			}
		}
	}

	function createDITable(signals, $panel, $table, id, name) {
		$table.empty();
		var results = [];
		signals.forEach(function(item) {
			item.SIGNAL_ID = parseInt(item.SIGNAL_ID, 10);
			if (Math.floor(item.SIGNAL_ID / 1000) !== id) {
				return;
			}
			var seq = item.SIGNAL_ID % 1000;
			var result = WUI.findFromArray(results, 'seq', seq);
			if (result) {
				result.ID = item.SIGNAL_ID;
			} else {
				results.push({
					seq : seq,
					ID : item.SIGNAL_ID
				});
			}
		});
		if (results.length === 0) {
			$panel.hide();
			return;
		}
		$panel.show();
		results.sort(function(a, b) {
			return a.seq > b.seq;
		});
		var $table = $(document.createElement("table"));
		$table.append($table);
		$tr = $(document.createElement("tr"));
		$table.append($tr);
		results.forEach(function(item) {
			var $td = $(document.createElement("td"));
			$td.addClass("environment-value");
			$tr.append($td);
			var $div = $(document.createElement("div"));
			$td.append($div);
			var panel = {
				$node : $('<div class="detail-statusInvalid-icon"></div>'),
				signalId : item.ID,
				type : 0
			};
			$div.append(panel.$node);
			$div.append('<div>' + name + item.seq + '</div>');

			signalObjects.push(panel);
		});
	}
	function createFireAlarm(signals) {
		createDITable(signals, $('#fire-alarm-panel'), $('#fire-alarm-table'), 2, '烟感');
	}
	function createDoorStatus(signals) {
		createDITable(signals, $('#door-status-panel'), $('#door-status-table'), 11, '门磁');
	}
	function createFlooding(signals) {
		createDITable(signals, $('#flooding-panel'), $('#flooding-table'), 1, '水浸');
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
		if (requestIds.length === 0) {
			WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
			return;
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
