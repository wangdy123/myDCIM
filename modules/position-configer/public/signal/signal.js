$(function() {
	var signalUrl = 'logicobject/signals/';
	var standardSignalUrl = 'position-configer/defaultSignals';
	var $node = $('#signal-datagrid');

	WUI.signal = WUI.signal || {};

	var currentObject = null;
	function reload() {
		$node.datagrid("reload");
	}

	function openObject(deviceObject) {
		currentObject = deviceObject;
		var toobar = [];
		WUI.signalType.forEach(function(type) {
			toobar.push({
				iconCls : 'icon-add',
				text : '添加【' + type.name + '】',
				handler : function() {
					signalDialog(null, currentObject.ID, currentObject.DEVICE_TYPE, type);
				}
			});
		});

		toobar.push('-');
		toobar.push({
			iconCls : 'icon-reload',
			text : '刷新',
			handler : function() {
				reload();
			}
		});
		$node.datagrid({
			url : signalUrl,
			queryParams : {
				parentId : currentObject.ID
			},
			fit : true,
			border : false,
			method : "get",
			singleSelect : true,
			onLoadError : WUI.onLoadError,
			toolbar : toobar,
			frozenColumns : [ [
					{
						field : 'icon',
						align : 'center',
						width : 40,
						formatter : function(value, row, index) {
							var type = WUI.findFromArray(WUI.signalType, 'type', row.SIGNAL_TYPE);
							if (type) {
								return '<div class="' + type.iconCls + '" title="' + type.name + '" '
										+ ' onclick="WUI.signal.editrow(this)"></div> ';
							}
						}
					},
					{
						field : 'action',
						title : '操作',
						width : 80,
						align : 'center',
						formatter : function(value, row, index) {
							var e = '<div class="icon-edit operator-tool" title="修改" '
									+ ' onclick="WUI.signal.editrow(this)"></div> ';
							var s = '<div class="separater"></div> ';
							var d = '<div class="icon-remove operator-tool" title="删除" '
									+ ' onclick="WUI.signal.deleterow(this)"></div>';
							return e + s + d;
						}
					}, {
						field : 'SIGNAL_ID',
						title : '信号编码',
						align : 'right',
						width : 80
					}, {
						field : 'SIGNAL_NAME',
						title : '名称',
						width : 200
					}, {
						field : 'SIGNAL_TYPE',
						title : '信号类型',
						width : 60,
						formatter : function(value, row, index) {
							var type = WUI.findFromArray(WUI.signalType, 'type', row.SIGNAL_TYPE);
							if (type) {
								return type.name;
							}
							return "";
						}
					} ] ],
			columns : [ [ {
				field : 'UNIT',
				title : '测量单位',
				width : 60
			}, {
				field : 'ALARM_DESC',
				title : '告警描述',
				width : 60
			}, {
				field : 'NORMAL_DESC',
				title : '正常描述',
				width : 60
			}, {
				field : 'ALARM_LEVEL',
				title : '告警级别',
				width : 60,
				formatter : function(value, row, index) {
					var level = WUI.findFromArray(WUI.alarmLevels.levels, 'level', row.ALARM_LEVEL);
					if (level) {
						return level.name;
					}
				}
			}, {
				field : 'THRESHOLD',
				title : '告警门限',
				align : 'right',
				width : 60
			}, {
				field : 'DEAD_AREA',
				title : '告警回差',
				align : 'right',
				width : 60
			}, {
				field : 'ALARM_DELAY',
				title : '告警延时(S)',
				align : 'right',
				width : 80
			}, {
				field : 'RECOVER_DELAY',
				title : '恢复延时(S)',
				align : 'right',
				width : 80
			}, {
				field : 'RELATIVE_VAL',
				title : '百分比阀值',
				align : 'right',
				width : 80
			}, {
				field : 'ABSOLUTE_VAL',
				title : '绝对阀值',
				align : 'right',
				width : 60
			}, {
				field : 'RECORD_RERIOD',
				title : '存储周期(S)',
				align : 'right',
				width : 80
			}, {
				field : 'DESCRIPTION',
				title : '信号说明',
				width : 200
			}, {
				field : 'EXPLANATION',
				title : '信号解释',
				width : 200
			} ] ]
		});
	}

	window.WUI.publishEvent('request_current_object', {
		publisher : 'signal-configer',
		cbk : openObject
	});

	WUI.signal.editrow = function(target) {
		var signal = WUI.getDatagridRow($node, target);
		var type = WUI.findFromArray(WUI.signalType, 'type', signal.SIGNAL_TYPE);
		if (type) {
			signalDialog(signal, signal.OBJECT_ID, currentObject.DEVICE_TYPE, type);
		}
	};
	WUI.signal.deleterow = function(target) {
		var signal = WUI.getDatagridRow($node, target);
		$.messager.confirm('确认', '确定要删除监控信号【' + signal.NAME + '】吗?', function(r) {
			if (r) {
				WUI.ajax.remove(signalUrl + signal.OBJECT_ID + "/" + signal.SIGNAL_ID, {}, function() {
					reload();
				}, function() {
					$.messager.alert('失败', "删除监控信号失败！");
				});
			}
		});
	};

	function signalDialog(signal, parentId, deviceType, signalType) {
		var typeName = signalType.name;
		var dialogNode = $("#configer-dialog");
		var cfg = {
			iconCls : signal ? "icon-edit" : "icon-add",
			title : (signal ? "修改" : "添加") + typeName,
			left : ($(window).width() - 600) * 0.5,
			top : ($(window).height() - 400) * 0.5,
			width : 650,
			closed : false,
			cache : false,
			href : "position-configer/signal/" + signalType.namespace + ".html",
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				$('#signal-standard-sel').combobox({
					url : standardSignalUrl,
					method : 'get',
					queryParams : {
						deviceType : deviceType
					},
					valueField : 'SIGNAL_ID',
					textField : 'SIGNAL_NAME',
					editable : false,
					loadFilter : function(data) {
						var results = [];
						for (key in data) {
							data[key].forEach(function(item) {
								if (item.SIGNAL_TYPE == signalType.type) {
									results.push(item);
								}
							});
						}
						return results;
					},
					onSelect : function(record) {
						if (!signal) {
							$('#signal-id-txt').numberbox({
								readonly : false
							});
							$('#signal-name-txt').textbox("setValue", record.SIGNAL_NAME);
							$('#signal-id-txt').numberbox("setValue", record.SIGNAL_ID);
							$('#signal-unit-txt').textbox("setValue", record.UNIT);
							$('#signal-alarm-level-sel').combobox("setValue", record.ALARM_LEVEL);
							$('#signal-threshold-txt').numberbox("setValue", record.THRESHOLD);
							$('#signal-dead-area-txt').numberbox("setValue", record.DEAD_AREA);
							$('#signal-alarm-delay-txt').numberbox("setValue", record.ALARM_DELAY);
							$('#signal-recover-delay-txt').numberbox("setValue", record.RECOVER_DELAY);
							$('#signal-alarm-txt').textbox("setValue", record.ALARM_DESC);
							$('#signal-normal-txt').textbox("setValue", record.NORMAL_DESC);
							$('#signal-recordperiod-txt').numberbox("setValue", record.RECORD_RERIOD);
							$('#signal-relative-val-txt').numberbox("setValue", record.RELATIVE_VAL);
							$('#signal-absolute-val-txt').numberbox("setValue", record.ABSOLUTE_VAL);
							$('#signal-discription-txt').textbox("setValue", record.DESCRIPTION);
							$('#signal-explanation-txt').textbox("setValue", record.EXPLANATION);

							$('#signal-name-txt').textbox("isValid");
							$('#signal-id-txt').numberbox("isValid");
							$('#signal-id-txt').numberbox({
								min : Math.floor(record.SIGNAL_ID / 1000) * 1000 + 1,
								max : Math.floor(record.SIGNAL_ID / 1000) * 1000 + 999
							});
						}
					},
					onLoadSuccess : function() {
						if (signal) {
							var stdId = Math.floor(signal.SIGNAL_ID / 1000) * 1000 + 1;
							$('#signal-standard-sel').combobox("setValue", stdId);
						}
					}
				});
				$('#signal-alarm-level-sel').combobox({
					valueField : 'level',
					textField : 'name',
					editable : false,
					data : WUI.alarmLevels.levels,
					iconWidth : 22,
					icons : [ {
						iconCls : 'icon-delete',
						handler : function() {
							$('#signal-alarm-level-sel').combobox("clear");
						}
					} ]
				});
				if (signal) {
					$('#signal-name-txt').textbox("setValue", signal.SIGNAL_NAME);
					$('#signal-id-txt').numberbox("setValue", signal.SIGNAL_ID);
					$('#signal-unit-txt').textbox("setValue", signal.UNIT);
					$('#signal-alarm-level-sel').combobox("setValue", signal.ALARM_LEVEL);
					$('#signal-threshold-txt').numberbox("setValue", signal.THRESHOLD);
					$('#signal-dead-area-txt').numberbox("setValue", signal.DEAD_AREA);
					$('#signal-alarm-delay-txt').numberbox("setValue", signal.ALARM_DELAY);
					$('#signal-recover-delay-txt').numberbox("setValue", signal.RECOVER_DELAY);
					$('#signal-alarm-txt').textbox("setValue", signal.ALARM_DESC);
					$('#signal-normal-txt').textbox("setValue", signal.NORMAL_DESC);
					$('#signal-recordperiod-txt').numberbox("setValue", signal.RECORD_RERIOD);
					$('#signal-relative-val-txt').numberbox("setValue", signal.RELATIVE_VAL);
					$('#signal-absolute-val-txt').numberbox("setValue", signal.ABSOLUTE_VAL);
					$('#signal-discription-txt').textbox("setValue", signal.DESCRIPTION);
					$('#signal-explanation-txt').textbox("setValue", signal.EXPLANATION);

					$('#signal-name-txt').textbox("isValid");
					$('#signal-standard-sel').combobox({
						readonly : true
					});
				}
				WUI.signal[signalType.namespace].init(signal, parentId, signalType);
			},
			modal : true,
			onClose : function() {
				$("#configer-dialog").empty();
			},
			buttons : [
					{
						text : '保存',
						handler : function() {
							var isValid = $('#signal-name-txt').textbox("isValid");
							isValid = isValid && $('#signal-id-txt').numberbox("isValid");
							isValid = isValid && WUI.signal[signalType.namespace].checkValid();
							if (!isValid) {
								return;
							}

							var newSignal = {
								SIGNAL_NAME : $('#signal-name-txt').textbox("getValue"),
								SIGNAL_ID : parseInt($('#signal-id-txt').numberbox("getValue"), 10),
								SIGNAL_TYPE : signalType.type,
								UNIT : $('#signal-unit-txt').textbox("getValue"),
								ALARM_LEVEL : parseInt($('#signal-alarm-level-sel').combobox("getValue"), 10),
								THRESHOLD : parseFloat($('#signal-threshold-txt').numberbox("getValue")),
								DEAD_AREA : parseFloat($('#signal-dead-area-txt').numberbox("getValue")),
								ALARM_DELAY : parseInt($('#signal-alarm-delay-txt').numberbox("getValue"), 10),
								RECOVER_DELAY : parseInt($('#signal-recover-delay-txt').numberbox("getValue"), 10),
								ALARM_DESC : $('#signal-alarm-txt').textbox("getValue"),
								NORMAL_DESC : $('#signal-normal-txt').textbox("getValue"),
								RECORD_RERIOD : parseInt($('#signal-recordperiod-txt').numberbox("getValue"), 10),
								RELATIVE_VAL : parseFloat($('#signal-relative-val-txt').numberbox("getValue")),
								ABSOLUTE_VAL : parseFloat($('#signal-absolute-val-txt').numberbox("getValue")),
								DESCRIPTION : $('#signal-discription-txt').textbox("getValue"),
								EXPLANATION : $('#signal-explanation-txt').textbox("getValue"),
								OBJECT_ID : parentId,
							};
							WUI.signal[signalType.namespace].getValue(newSignal);
							if (signal) {
								WUI.ajax.put(signalUrl + newSignal.OBJECT_ID + "/" + newSignal.SIGNAL_ID, newSignal,
										function() {
											dialogNode.dialog("close");
											reload();
										}, function() {
											$.messager.alert('失败', "修改" + typeName + "失败！");
										});
							} else {
								WUI.ajax.post(signalUrl, newSignal, function() {
									dialogNode.dialog("close");
									reload();
								}, function() {
									$.messager.alert('失败', "添加" + typeName + "失败！");
								});
							}
						}
					}, {
						text : '取消',
						handler : function() {
							dialogNode.dialog("close");
						}
					} ]
		};
		dialogNode.dialog(cfg);
	}
});
