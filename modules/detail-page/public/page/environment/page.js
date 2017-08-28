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
	function createSignalNode($tr, signalId) {
		if (signalId) {
			signalObjects.push(WUI.detail.createTableItem($tr, signalId, {
				className : "detail-table-cell",
				type : 1,
				fixedNum : 1
			}));
		} else {
			$tr.append('<td class="detail-table-cell"></td>');
		}
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
		var trs = {};
		function createRowHead() {
			var trs = {};
			trs.$head = $(document.createElement("tr"));
			$table.append(trs.$head);
			trs.$head.append('<td class="detail-table-head"></td>');
			trs.$temperature = $(document.createElement("tr"));
			$table.append(trs.$temperature);
			trs.$temperature.append('<td class="detail-table-head">温度(℃)</td>');
			trs.$humidity = $(document.createElement("tr"));
			$table.append(trs.$humidity);
			trs.$humidity.append('<td class="detail-table-head">湿度(%RH)</td>');
			return trs;
		}

		for (var i = 0; i < temperatures.length; i++) {
			var item = temperatures[i];
			if ((i % WUI.maxRowItem) === 0) {
				trs = createRowHead();
			}
			trs.$head.append('<td class="detail-table-head">温湿度' + item.seq + '</td>');
			createSignalNode(trs.$temperature, item.temperature);
			createSignalNode(trs.$humidity, item.humidity);
		}
	}
	function createCabinet(signals) {
		$('#cabinet-temperature-table').empty();
		var cabinets = [];
		function addSignal(cabinet, key, signalId, cabinetSeq) {
			if (cabinet) {
				cabinet[key] = signalId;
			} else {
				cabinet = {
					cabinetSeq : cabinetSeq
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
			var cabinet = WUI.findFromArray(cabinets, 'cabinetSeq', cabinetSeq);

			switch (seq % 10) {
			case 1:
				addSignal(cabinet, "ft", item.SIGNAL_ID, cabinetSeq);
				break;
			case 2:
				addSignal(cabinet, "fm", item.SIGNAL_ID, cabinetSeq);
				break;
			case 3:
				addSignal(cabinet, "fb", item.SIGNAL_ID, cabinetSeq);
				break;
			case 4:
				addSignal(cabinet, "bt", item.SIGNAL_ID, cabinetSeq);
				break;
			case 5:
				addSignal(cabinet, "bm", item.SIGNAL_ID, cabinetSeq);
				break;
			case 5:
				addSignal(cabinet, "bb", item.SIGNAL_ID, cabinetSeq);
				break;
			}
		});
		if (cabinets.length === 0) {
			$('#cabinet-temperature-panel').hide();
			return;
		}
		$('#cabinet-temperature-panel').show();
		cabinets.sort(function(a, b) {
			return a.cabinetSeq > b.cabinetSeq;
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
			trs.$head.append('<td class="detail-table-head"></td>');
			trs.$position = $(document.createElement("tr"));
			$table.append(trs.$position);
			trs.$position.append('<td class="detail-table-head"></td>');
			trs.$top = $(document.createElement("tr"));
			$table.append(trs.$top);
			trs.$top.append('<td class="detail-table-head">上(℃)</td>');
			trs.$mid = $(document.createElement("tr"));
			$table.append(trs.$mid);
			trs.$mid.append('<td class="detail-table-head">中(℃)</td>');
			trs.$bottom = $(document.createElement("tr"));
			$table.append(trs.$bottom);
			trs.$bottom.append('<td class="detail-table-head">下(℃)</td>');
			return trs;
		}

		for (var i = 0; i < cabinets.length; i++) {
			var item = cabinets[i];
			if ((i % parseInt(WUI.maxRowItem / 2, 10)) === 0) {
				trs = createRowHead();
			}
			trs.$head.append('<td class="detail-table-head" colspan="2">柜' + item.cabinetSeq + '</td>');
			trs.$position.append('<td class="detail-table-head">前</td>');
			trs.$position.append('<td class="detail-table-head">后</td>');
			createSignalNode(trs.$top, item.ft);
			createSignalNode(trs.$top, item.bt);
			createSignalNode(trs.$mid, item.fm);
			createSignalNode(trs.$mid, item.bm);
			createSignalNode(trs.$bottom, item.fb);
			createSignalNode(trs.$bottom, item.bb);
		}
	}

	function createDITable(signals, $panel, $tableNode, id, name) {
		$tableNode.empty();
		var results = [];
		signals.forEach(function(item) {
			item.SIGNAL_ID = parseInt(item.SIGNAL_ID, 10);
			if (Math.floor(item.SIGNAL_ID / 1000) !== id) {
				return;
			}
			var seq = item.SIGNAL_ID % 1000;
			results.push({
				seq : seq,
				ID : item.SIGNAL_ID
			});
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
		$tableNode.append($table);
		var $tr = $(document.createElement("tr"));
		for (var i = 0; i < results.length; i++) {
			var item = results[i];
			if ((i % 4) === 0) {
				$tr = $(document.createElement("tr"));
				$table.append($tr);
			}
			var $td = $(document.createElement("td"));
			$td.addClass("detail-table-cell");
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
		}
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
