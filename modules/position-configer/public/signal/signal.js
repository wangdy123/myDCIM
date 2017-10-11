$(function() {
	var signalUrl = 'logicobject/signals/';
	var standardSignalUrl = 'position-configer/defaultSignals';
	var driverUrl = "driver-configer/drivers";
	var driverSignalUrl = "driver-configer/driverSignals";
	var funcsModelUrl = "position-configer/signalFuncModel";
	var funcsParamUrl = "position-configer/signalFuncParams/";
	var conditionModelUrl = "position-configer/signalConditionModel";
	var conditionParamUrl = "position-configer/signalConditionParams/";
	var $node = $('#signal-datagrid');

	WUI.signal = WUI.signal || {};

	var currentObject = null;
	function reload() {
		$node.datagrid("reload");
	}
	var valueSrcs = [ {
		type : 1,
		name : "固定值"
	}, {
		type : 2,
		name : "驱动采集"
	}, {
		type : 3,
		name : "其他信号"
	} ];
	function openObject(nodeObject) {
		currentObject = nodeObject;
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
			toolbar : [ {
				iconCls : 'icon-add',
				text : '添加信号',
				handler : function() {
					signalDialog(null, currentObject);
				}
			}, '-', {
				iconCls : 'icon-reload',
				text : '刷新',
				handler : function() {
					reload();
				}
			} ],
			columns : [ [
					{
						field : 'icon',
						align : 'center',
						width : 40,
						formatter : function(value, row, index) {
							var type = WUI.findFromArray(WUI.signalType, 'type', row.SIGNAL_TYPE);
							if (type) {
								return '<div class="' + type.iconCls + ' icon-tool" title="' + type.name + '"></div> ';
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
					}, {
						field : 'VALUE_SRC',
						title : '数值来源',
						width : 80,
						formatter : function(value, row, index) {
							var type = WUI.findFromArray(valueSrcs, 'type', row.VALUE_SRC);
							if (type) {
								return type.name;
							}
							return "";
						}
					}, {
						field : 'RECORD_RERIOD',
						title : '存储周期(S)',
						align : 'right',
						width : 80
					}, {
						field : 'UNIT',
						title : '测量单位',
						width : 60
					}, {
						field : 'NORMAL_DESC',
						title : '正常描述',
						width : 60
					}, {
						field : 'RECOVER_DELAY',
						title : '恢复延时(S)',
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
		if (signal) {
			signalDialog(signal, currentObject);
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

	function initConditionTable() {
		var cfg = {
			height : 150,
			border : true,
			singleSelect : true,
			data : [],
			toolbar : [ {
				iconCls : 'icon-add',
				text : '添加告警条件',
				handler : function() {
					conditionDialog(null, function(condition) {
						$("#condition-table").datagrid("appendRow", condition);
					});
				}
			} ],
			columns : [ [
					{
						field : 'action',
						title : '操作',
						width : 80,
						align : 'center',
						formatter : function(value, row, index) {
							var e = '<div class="icon-edit operator-tool" title="修改" '
									+ ' onclick="WUI.signal.editCondition(this)"></div> ';
							var s = '<div class="separater"></div> ';
							var d = '<div class="icon-remove operator-tool" title="删除" '
									+ ' onclick="WUI.signal.deleteCondition(this)"></div>';
							return e + s + d;
						}
					}, {
						field : 'ALARM_DESC',
						title : '告警描述'
					}, {
						field : 'ALARM_LEVEL',
						title : '告警级别',
						formatter : function(value, row, index) {
							var level = WUI.findFromArray(WUI.alarmLevels.levels, 'level', row.ALARM_LEVEL);
							if (level) {
								return level.name;
							}
						}
					}, {
						field : 'ALARM_DELAY',
						title : '告警延时(S)',
						align : 'right'
					}, {
						field : 'CONDITION_TYPE',
						title : '告警条件名称'
					}, {
						field : 'params',
						title : '告警条件描述',
						width : 150,
						formatter : function(value, row, index) {
							return JSON.stringify(row.params);
						}
					} ] ]
		};
		$("#condition-table").datagrid(cfg);
	}

	WUI.signal.editCondition = function(target) {
		var condition = WUI.getDatagridRow($("#condition-table"), target);
		if (condition) {
			conditionDialog(condition, function(newCondition) {
				$("#condition-table").datagrid("updateRow", {
					index : WUI.getDatagridRowIndex(target),
					row : newCondition
				});
			});
		}
	};
	WUI.signal.deleteCondition = function(target) {
		$("#condition-table").datagrid("deleteRow", WUI.getDatagridRowIndex(target));
	};

	function conditionDialog(condition, callback) {
		var dialogNode = $("#condition-dialog");
		var properties = [];

		var cfg = {
			iconCls : condition ? "icon-edit" : "icon-add",
			title : (condition ? "修改" : "添加") + "告警条件",
			left : ($(window).width() - 400) * 0.5,
			top : ($(window).height() - 400) * 0.5,
			width : 400,
			closed : false,
			cache : false,
			href : "position-configer/signal/condition-dialog.html",
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
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

				$('#signal-condition-sel').combobox({
					valueField : 'model',
					textField : 'name',
					editable : false,
					url : conditionModelUrl,
					method : 'get',
					onSelect : function(rec) {
						$('#signal-alarm-txt').textbox("setValue", rec.name);
						var $propTable = $("#condition-prop-table");
						$propTable.empty();
						properties = [];
						WUI.ajax.get(conditionParamUrl + rec.model, {}, function(results) {
							results.forEach(function(param) {
								var $tr = $(document.createElement("tr"));
								$propTable.append($tr);
								properties.push(WUI.createProperty($tr, param, 80, 150));
							});
							if (condition) {
								WUI.setPropertiesValue(properties, condition.params);
							}
						}, function() {
							$.messager.alert('失败', "读取门限参数失败，请重试！");
						});
					}
				});

				if (condition) {
					$('#signal-alarm-txt').textbox("setValue", condition.ALARM_DESC);
					$('#signal-alarm-level-sel').combobox("setValue", condition.ALARM_LEVEL);
					$('#signal-condition-sel').combobox("setValue", condition.CONDITION_TYPE);
					$('#signal-alarm-delay-txt').numberbox("setValue", condition.ALARM_DELAY);
					WUI.setPropertiesValue(properties, condition.params);
					$('#signal-alarm-txt').textbox("isValid");
				}
			},
			modal : true,
			onClose : function() {
				dialogNode.empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#signal-alarm-txt').textbox("isValid");
					isValid = isValid && $('#signal-alarm-level-sel').combobox("isValid");
					isValid = isValid && $('#signal-condition-sel').combobox("isValid");
					isValid = isValid && $('#signal-alarm-delay-txt').numberbox("isValid");
					isValid = isValid && WUI.isPropertiesValueValid(properties);
					if (!isValid) {
						return;
					}

					var newCondition = {
						ALARM_DESC : $('#signal-alarm-txt').textbox("getValue"),
						ALARM_LEVEL : parseInt($('#signal-alarm-level-sel').combobox("getValue"), 10),
						CONDITION_TYPE : $('#signal-condition-sel').combobox("getValue"),
						ALARM_DELAY : parseInt($('#signal-alarm-delay-txt').numberbox("getValue"), 10)
					};
					newCondition.params = WUI.getPropertiesValue(properties);
					callback(newCondition);
					dialogNode.dialog("close");
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
	function signalDialog(signal, nodeObject) {
		var dialogNode = $("#configer-dialog");
		var transProperties = [];
		var cfg = {
			iconCls : signal ? "icon-edit" : "icon-add",
			title : (signal ? "修改" : "添加") + "信号",
			left : ($(window).width() - 600) * 0.5,
			top : ($(window).height() - 600) * 0.5,
			width : 650,
			closed : false,
			cache : false,
			href : "position-configer/signal/dialog.html",
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				$('#signal-type-sel').combobox({
					valueField : 'type',
					textField : 'name',
					editable : false,
					disabled : signal ? true : false,
					data : WUI.signalType,
					onSelect : function(type) {
						$('#signal-standard-sel').combobox({
							url : standardSignalUrl,
							method : 'get',
							queryParams : {
								nodeType : nodeObject.OBJECT_TYPE,
								deviceType : nodeObject.DEVICE_TYPE
							},
							loadFilter : function(data) {
								var results = [];
								for (key in data) {
									data[key].forEach(function(item) {
										if (item.SIGNAL_TYPE == type.type) {
											results.push(item);
										}
									});
								}
								return results;
							}
						});
						if (type.enable_other_signal) {
							$('#signal-src-type-sel').combobox({
								data : [ {
									type : 1,
									name : "驱动"
								}, {
									type : 2,
									name : "其他信号"
								} ]
							});
						} else {
							$('#signal-src-type-sel').combobox({
								data : [ {
									type : 1,
									name : "驱动"
								} ]
							});
						}
						if (type.enable_condition) {
							$("#condition-panel").show();
						} else {
							$("#condition-panel").hide();
						}
					}
				});
				$('#signal-standard-sel').combobox({
					data : [],
					valueField : 'SIGNAL_ID',
					textField : 'SIGNAL_NAME',
					editable : false,
					disabled : signal ? true : false,
					onSelect : function(record) {
						if (!signal) {
							$('#signal-name-txt').textbox("setValue", record.SIGNAL_NAME);
							$('#signal-id-txt').numberbox("setValue", record.SIGNAL_ID);
							$('#signal-unit-txt').textbox("setValue", record.UNIT);
							$('#signal-recover-delay-txt').numberbox("setValue", record.RECOVER_DELAY);
							$('#signal-normal-txt').textbox("setValue", record.NORMAL_DESC);
							$('#signal-recordperiod-txt').numberbox("setValue", record.RECORD_RERIOD);
							$('#signal-discription-txt').textbox("setValue", record.DESCRIPTION);
							$('#signal-explanation-txt').textbox("setValue", record.EXPLANATION);

							$('#signal-name-txt').textbox("isValid");
							$('#signal-id-txt').numberbox("isValid");
							$('#signal-id-txt').numberbox({
								min : Math.floor(record.SIGNAL_ID / 1000) * 1000 + 1,
								max : Math.floor(record.SIGNAL_ID / 1000) * 1000 + 999
							});
							$("#condition-table").datagrid("loadData", record.conditions ? record.conditions : []);
							if (record.SRC_SIGNAL_ID) {
								$('#signal-src-type-sel').combobox("setValue", 2);
							} else {
								$('#signal-src-type-sel').combobox("setValue", 1);
							}
						}
					},
					onLoadSuccess : function() {
						if (signal) {
							var stdId = Math.floor(signal.SIGNAL_ID / 1000) * 1000 + 1;
							$('#signal-standard-sel').combobox("setValue", stdId);
						}
					}
				});
				$('#signal-src-type-sel').combobox({
					data : [ {
						type : 1,
						name : "驱动"
					} ],
					valueField : 'type',
					textField : 'name',
					editable : false,
					onSelect : function(record) {
						if (record.type == 1) {
							$("#from-driver-signal-panel").show();
							$("#from-other-signal-panel").hide();
							$('#signal-src-sel').combobox({
								required : true
							});
							$('#signal-name-of-driver-sel').combobox({
								required : true
							});
							$('#signal-src-sel').combobox({
								required : false
							});
						} else {
							$("#from-driver-signal-panel").hide();
							$("#from-other-signal-panel").show();
							$('#signal-src-sel').combobox({
								required : false
							});
							$('#signal-name-of-driver-sel').combobox({
								required : false
							});
							$('#signal-src-sel').combobox({
								required : true
							});
						}
					},
					onLoadSuccess : function() {
						if (signal) {
							if (signal.SRC_SIGNAL_ID) {
								$('#signal-src-type-sel').combobox("setValue", 2);
							} else {
								$('#signal-src-type-sel').combobox("setValue", 1);
							}
						}
					}
				});
				$('#signal-src-sel').combobox({
					data : $node.datagrid("getData").rows,
					valueField : 'SIGNAL_ID',
					textField : 'SIGNAL_NAME',
					editable : false,
					onLoadSuccess : function() {
						if (signal) {
							$('#signal-src-sel').combobox("setValue", signal.SRC_SIGNAL_ID);
						}
					}
				});
				var positionSel = new WUI.createLogicObjectCombotree({
					$node : $('#signal-driver-position'),
					onChange : function(newValue) {
						$('#signal-driver-sel').combobox({
							url : driverUrl,
							method : "get",
							queryParams : {
								position : newValue
							},
							required : true
						});
					}
				});

				$('#signal-driver-sel').combobox({
					data : [],
					valueField : 'ID',
					textField : 'NAME',
					editable : false,
					onSelect : function(driver) {
						$('#signal-name-of-driver-sel').combobox({
							url : driverSignalUrl,
							method : "get",
							queryParams : {
								driverId : driver.ID
							}
						});
					},
					onLoadSuccess : function() {
						if (signal) {
							$('#signal-driver-sel').combobox("setValue", signal.DRIVER_ID);
						}
					}
				});
				$('#signal-name-of-driver-sel').combobox({
					data : [],
					valueField : 'key',
					textField : 'name',//signalType
					editable : false,
					onLoadSuccess : function() {
						if (signal) {
							$('#signal-name-of-driver-sel').combobox("setValue", signal.DRIVER_KEY);
						}
					}
				});

				$('#signal-trans-func-sel').combobox({
					valueField : 'model',
					textField : 'name',
					editable : false,
					url : funcsModelUrl,
					method : 'get',
					onSelect : function(rec) {
						var $propTable = $("#signal-trans-func-params");
						$propTable.empty();
						transProperties = [];
						WUI.ajax.get(funcsParamUrl + rec.model, {}, function(results) {
							results.forEach(function(param, i) {
								if (i % 2 === 0) {
									$tr = $(document.createElement("tr"));
									$propTable.append($tr);
								}
								transProperties.push(WUI.createProperty($tr, param, 80, 150));
							});
							if (signal && signal.funcs) {
								WUI.setPropertiesValue(transProperties, signal.funcs.params);
							}
						}, function() {
							$.messager.alert('失败', "读取转换参数失败，请重试！");
						});
					},
					onLoadSuccess : function() {
						if (signal && signal.funcs) {
							$('#signal-trans-func-sel').combobox("setValue", signal.funcs.FUNC_NAME);
						}
					}
				});
				$('#signal-id-txt').numberbox({
					groupSeparator : ' ',
					onChange : function(newValue) {
						newValue = parseInt(newValue, 10);
						if (isNaN(newValue)) {
							return;
						}
						var seq = newValue % 1000;
						var data = $('#signal-standard-sel').combobox("getData");
						var defaultId = Math.floor(newValue / 1000) * 1000 + 1;
						data.forEach(function(signal) {
							if (signal.SIGNAL_ID == defaultId) {
								var newName = signal.SIGNAL_NAME.replace('XX', seq);
								$('#signal-name-txt').textbox("setValue", newName);
							}
						});
					}
				});

				initConditionTable();
				if (signal) {
					$('#signal-type-sel').combobox("setValue", signal.SIGNAL_TYPE);
					$('#signal-name-txt').textbox("setValue", signal.SIGNAL_NAME);
					$('#signal-id-txt').numberbox("setValue", signal.SIGNAL_ID);
					$('#signal-unit-txt').textbox("setValue", signal.UNIT);
					$('#signal-recover-delay-txt').numberbox("setValue", signal.RECOVER_DELAY);
					$('#signal-normal-txt').textbox("setValue", signal.NORMAL_DESC);
					$('#signal-recordperiod-txt').numberbox("setValue", signal.RECORD_RERIOD);
					$('#signal-discription-txt').textbox("setValue", signal.DESCRIPTION);
					$('#signal-explanation-txt').textbox("setValue", signal.EXPLANATION);
					$("#condition-table").datagrid("loadData", signal.conditions ? signal.conditions : []);
					$('#signal-name-txt').textbox("isValid");
					$('#signal-id-txt').numberbox("disable");
					if (!signal.SRC_SIGNAL_ID && signal.DRIVER_ID) {
						WUI.ajax.get(driverUrl + "/" + signal.DRIVER_ID, {}, function(driver) {
							positionSel.setValue(driver.POSTION);
						});
						$('#signal-driver-sel').combobox("setValue", signal.DRIVER_ID);
						$('#signal-name-of-driver-sel').combobox("setValue", signal.DRIVER_KEY);
						if (signal.funcs) {
							$('#signal-trans-func-sel').combobox("setValue", signal.funcs.FUNC_NAME);
						}
					}
				}
			},
			modal : true,
			onClose : function() {
				$("#configer-dialog").empty();
			},
			buttons : [
					{
						text : '保存',
						width : 100,
						handler : function() {
							var isValid = $('#signal-name-txt').textbox("isValid");
							isValid = isValid && $('#signal-type-sel').combobox("isValid");
							isValid = isValid && $('#signal-id-txt').numberbox("isValid");
							isValid = isValid && $('#signal-src-type-sel').combobox("isValid");
							isValid = isValid && $('#signal-id-txt').combobox("isValid");
							if (parseInt($('#signal-src-type-sel').combobox("getValue"), 10) === 1) {
								isValid = isValid && $('#signal-driver-sel').combobox("isValid");
								isValid = isValid && $('#signal-name-of-driver-sel').combobox("isValid");
								isValid = isValid && $('#signal-trans-func-sel').combobox("isValid");
								isValid = isValid && WUI.isPropertiesValueValid(transProperties);
							} else {
								isValid = isValid && $('#signal-src-sel').combobox("isValid");
							}

							if (!isValid) {
								return;
							}
							var newSignal = {
								SIGNAL_NAME : $('#signal-name-txt').textbox("getValue"),
								SIGNAL_ID : parseInt($('#signal-id-txt').numberbox("getValue"), 10),
								SIGNAL_TYPE : parseInt($('#signal-type-sel').combobox("getValue"), 10),
								UNIT : $('#signal-unit-txt').textbox("getValue"),
								RECOVER_DELAY : parseInt($('#signal-recover-delay-txt').numberbox("getValue"), 10),
								NORMAL_DESC : $('#signal-normal-txt').textbox("getValue"),
								RECORD_RERIOD : parseInt($('#signal-recordperiod-txt').numberbox("getValue"), 10),
								DESCRIPTION : $('#signal-discription-txt').textbox("getValue"),
								EXPLANATION : $('#signal-explanation-txt').textbox("getValue"),
								OBJECT_ID : nodeObject.ID,
								conditions : $("#condition-table").datagrid("getData").rows
							};
							newSignal.SIGNAL_TYPE = newSignal.SIGNAL_TYPE ? newSignal.SIGNAL_TYPE : 0;
							if (parseInt($('#signal-src-type-sel').combobox("getValue"), 10) === 1) {
								newSignal.DRIVER_ID = $('#signal-driver-sel').combobox("getValue");
								newSignal.DRIVER_KEY = $('#signal-name-of-driver-sel').combobox("getValue");
								var transName = $('#signal-trans-func-sel').combobox("getValue");
								if (transName) {
									newSignal.funcs = {
										FUNC_NAME : transName,
										params : WUI.getPropertiesValue(transProperties)
									}
								}
							} else {
								newSignal.SRC_SIGNAL_ID = $('#signal-src-sel').combobox("getValue");
							}
							var i = 1;
							newSignal.conditions.forEach(function(condition) {
								condition.CONDITION_NUM = i;
								i++;
							});
							if (signal) {
								newSignal.SIGNAL_TYPE = signal.SIGNAL_TYPE;
								newSignal.SIGNAL_ID = signal.SIGNAL_ID;
								newSignal.OBJECT_ID = signal.OBJECT_ID;
								WUI.ajax.put(signalUrl + newSignal.OBJECT_ID + "/" + newSignal.SIGNAL_ID, newSignal,
										function() {
											dialogNode.dialog("close");
											reload();
										}, function() {
											$.messager.alert('失败', "修改信号失败！");
										});
							} else {
								WUI.ajax.post(signalUrl, newSignal, function() {
									dialogNode.dialog("close");
									reload();
								}, function() {
									$.messager.alert('失败', "添加信号失败！");
								});
							}
						}
					}, {
						text : '取消',
						width : 100,
						handler : function() {
							dialogNode.dialog("close");
						}
					} ]
		};
		dialogNode.dialog(cfg);
	}
});
