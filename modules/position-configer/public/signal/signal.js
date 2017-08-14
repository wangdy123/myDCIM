$(function() {
	var signalUrl = 'logicobject/signals/';
	var $node = $('#signal-datagrid');

	WUI.signal = WUI.signal || {};

	var currentObject = null;
	function reload() {
		$node.datagrid("reload");
	}

	function openObject(deviceObject) {
		currentObject = deviceObject;
		var toobar = [];
		function createAddTool(signalType) {
			toobar.push({
				iconCls : 'icon-add',
				text : '添加【' + signalType.name + '】',
				handler : function() {
					signalDialog(null, currentObject.ID, signalType);
				}
			});
		}
		for (var i = 0; i < WUI.signalType.length; i++) {
			createAddTool(WUI.signalType[i]);
		}
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
			columns : [ [
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
						width : 120
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
					}, {
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
						width : 60
					}, {
						field : 'DEAD_AREA',
						title : '告警回差',
						width : 60
					}, {
						field : 'ALARM_DELAY',
						title : '告警延时(S)',
						width : 80
					}, {
						field : 'RECOVER_DELAY',
						title : '恢复延时(S)',
						width : 80
					}, {
						field : 'RELATIVE_VAL',
						title : '百分比阀值',
						width : 80
					}, {
						field : 'ABSOLUTE_VAL',
						title : '绝对阀值',
						width : 60
					}, {
						field : 'RECORD_RERIOD',
						title : '存储周期(S)',
						width : 80
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
			signalDialog(signal, signal.OBJECT_ID, type);
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

	function signalDialog(signal, parentId, signalType) {
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
				$('#signal-alarm-level-sel').combobox({
					valueField : 'level',
					textField : 'name',
					editable:false,
					data : WUI.alarmLevels.levels
				});
				if (signal) {
					$('#signal-name-txt').textbox("setValue", signal.SIGNAL_NAME);
					$('#signal-id-txt').val(signal.SIGNAL_ID);
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

					$('#signal-name-txt').textbox("isValid");
					$('#signal-id-txt').textbox({
						disabled : true
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
							isValid = isValid && $('#signal-id-txt').textbox("isValid");
							isValid = isValid && WUI.signal[signalType.namespace].checkValid();
							if (!isValid) {
								return;
							}

							var newSignal = {
								SIGNAL_NAME : $('#signal-name-txt').val(),
								SIGNAL_ID : parseInt($('#signal-id-txt').val(), 10),
								SIGNAL_TYPE : signalType.type,
								UNIT : $('#signal-unit-txt').val(),
								ALARM_LEVEL : parseInt($('#signal-alarm-level-sel').combobox("getValue"), 10),
								THRESHOLD : parseFloat($('#signal-threshold-txt').val()),
								DEAD_AREA : parseFloat($('#signal-dead-area-txt').val()),
								ALARM_DELAY : parseInt($('#signal-alarm-delay-txt').val(), 10),
								RECOVER_DELAY : parseInt($('#signal-recover-delay-txt').val(), 10),
								ALARM_DESC : $('#signal-alarm-txt').val(),
								NORMAL_DESC : $('#signal-normal-txt').val(),
								RECORD_RERIOD : parseInt($('#signal-recordperiod-txt').val(), 10),
								RELATIVE_VAL : parseFloat($('#signal-relative-val-txt').val()),
								ABSOLUTE_VAL : parseFloat($('#signal-absolute-val-txt').val()),
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
