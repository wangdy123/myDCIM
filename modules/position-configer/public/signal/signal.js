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
		$node
				.datagrid({
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
							signalDialog(null, currentObject.ID, currentObject.DEVICE_TYPE);
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
										return '<div class="' + type.iconCls + ' icon-tool " title="' + type.name
												+ '"></div> ';
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
			signalDialog(signal, signal.OBJECT_ID, currentObject.DEVICE_TYPE);
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
			fit : true,
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
						title : '告警条件名称',
						formatter : function(value, row, index) {
							var condition = WUI.findFromArray(WUI.conditionTypes, 'type', row.CONDITION_TYPE);
							if (!condition) {
								return "";
							}
							return condition.name;
						}
					}, {
						field : 'ext_desc',
						title : '告警条件描述',
						width : 200,
						formatter : function(value, row, index) {
							var desc = [];
							var condition = WUI.findFromArray(WUI.conditionTypes, 'type', row.CONDITION_TYPE);
							if (!condition) {
								return "";
							}
							condition.params.forEach(function(param) {
								desc.push(param["label"] + ":" + row[param["key"]]);
							});
							return desc.join(",");
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

	function createProperty($parentNode, param) {
		var $tr = $(document.createElement("tr"));
		$parentNode.append($tr);
		var $td = $(document.createElement("td"));
		$tr.append('<td align="right">' + param.label + ':</td>', $td);
		var property = {
			key : param.key
		};

		switch (param.type) {
		case "Float": {
			property.$node = $(document.createElement("input"));
			property.$node.addClass("easyui-numberbox");
			$td.append(property.$node);
			property.$node.css("width", "100%");
			property.$node.numberbox({
				precision : 2,
				required : param.required
			});
			property.setValue = function(value) {
				property.$node.numberbox('setValue', value);
			};
			property.isValid = function() {
				return property.$node.numberbox('isValid');
			};
			property.getValue = function() {
				return parseFloat(property.$node.numberbox('getValue'));
			};
		}
			break;
		case "Intger": {
			property.$node = $(document.createElement("input"));
			property.$node.addClass("easyui-numberbox");
			$td.append(property.$node);
			property.$node.css("width", "100%");
			property.$node.numberbox({
				precision : 0,
				required : param.required
			});
			property.setValue = function(value) {
				property.$node.numberbox('setValue', value);
			};
			property.isValid = function() {
				return property.$node.numberbox('isValid');
			};
			property.getValue = function() {
				return parseInt(property.$node.numberbox('getValue'), 10);
			};
		}
			break;
		case "Option": {
			property.$node = $(document.createElement("input"));
			property.$node.addClass("easyui-combobox");
			$td.append(property.$node);
			property.$node.css("width", "100%");
			property.$node.combobox({
				valueField : param.valueField,
				textField : param.textField,
				editable : false,
				data : param.options,
				required : param.required
			});

			property.setValue = function(value) {
				property.$node.combobox('setValue', value);
			};
			property.isValid = function() {
				return property.$node.combobox('isValid');
			};
			property.getValue = function() {
				return property.$node.combobox('getValue');
			};
		}
			break;
		case "Date": {
			property.$node = $(document.createElement("input"));
			property.$node.addClass("easyui-datebox");
			$td.append(property.$node);
			property.$node.css("width", "100%");
			property.$node.datebox({
				parser : WUI.date_parse,
				formatter : WUI.dateFormat,
				required : param.required
			});
			property.setValue = function(value) {
				property.$node.datebox('setValue', value);
			};
			property.isValid = function() {
				return property.$node.datebox('isValid');
			};
			property.getValue = function() {
				return property.$node.datebox('getValue');
			};
		}
			break;
		case "Datetime": {
			property.$node = $(document.createElement("input"));
			property.$node.addClass("easyui-datetimebox");
			$td.append(property.$node);
			property.$node.css("width", "100%");
			property.$node.datetimebox({
				parser : WUI.date_parse,
				formatter : WUI.timeformat,
				required : param.required
			});
			property.setValue = function(value) {
				property.$node.datetimebox('setValue', value);
			};
			property.isValid = function() {
				return property.$node.datetimebox('isValid');
			};
			property.getValue = function() {
				return property.$node.datetimebox('getValue');
			};
		}
			break;
		default: {
			property.$node = $(document.createElement("input"));
			property.$node.addClass("easyui-textbox");
			$td.append(property.$node);
			property.$node.css("width", "100%");
			property.$node.textbox({
				required : param.required
			});
			property.setValue = function(value) {
				property.$node.textbox('setValue', value);
			};
			property.isValid = function() {
				return property.$node.textbox('isValid');
			};
			property.getValue = function() {
				return property.$node.textbox('getValue');
			};
		}
			break;
		}
		return property;
	}
	function conditionDialog(condition, callback) {
		var dialogNode = $("#condition-dialog");
		var properties = [];
		function setPropertiesValue(condition) {
			properties.forEach(function(property) {
				property.setValue(condition[property.key]);
			});
		}
		function isPropertiesValueValid() {
			var isValid = true;
			properties.forEach(function(property) {
				isValid = isValid && property.isValid();
			});
			return isValid;
		}
		function getPropertiesValue(condition) {
			properties.forEach(function(property) {
				condition[property.key] = property.getValue();
			});
		}
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
					valueField : 'type',
					textField : 'name',
					editable : false,
					data : WUI.conditionTypes,
					onSelect : function(conditionType) {
						$('#signal-alarm-txt').textbox("setValue", conditionType.name);
						$("#condition-prop-table").empty();
						properties = [];
						conditionType.params.forEach(function(param) {
							properties.push(createProperty($("#condition-prop-table"), param));
						});
						if (condition) {
							setPropertiesValue(condition);
						}
					}
				});

				if (condition) {
					$('#signal-alarm-txt').textbox("setValue", condition.ALARM_DESC);
					$('#signal-alarm-level-sel').combobox("setValue", condition.ALARM_LEVEL);
					$('#signal-condition-sel').combobox("setValue", condition.CONDITION_TYPE);
					$('#signal-alarm-delay-txt').numberbox("setValue", condition.ALARM_DELAY);
					setPropertiesValue(condition);
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
					isValid = isValid && isPropertiesValueValid();
					if (!isValid) {
						return;
					}

					var newCondition = {
						ALARM_DESC : $('#signal-alarm-txt').textbox("getValue"),
						ALARM_LEVEL : parseInt($('#signal-alarm-level-sel').combobox("getValue"), 10),
						CONDITION_TYPE : $('#signal-condition-sel').combobox("getValue"),
						ALARM_DELAY : parseInt($('#signal-alarm-delay-txt').numberbox("getValue"), 10)
					};
					getPropertiesValue(newCondition);
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
	function signalDialog(signal, parentId, deviceType) {
		var dialogNode = $("#configer-dialog");
		var cfg = {
			iconCls : signal ? "icon-edit" : "icon-add",
			title : (signal ? "修改" : "添加") + "信号",
			left : ($(window).width() - 600) * 0.5,
			top : ($(window).height() - 400) * 0.5,
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
								deviceType : deviceType
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
							$('#signal-id-txt').numberbox({
								readonly : false
							});
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
						}
					},
					onLoadSuccess : function() {
						if (signal) {
							var stdId = Math.floor(signal.SIGNAL_ID / 1000) * 1000 + 1;
							$('#signal-standard-sel').combobox("setValue", stdId);
						}
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
					$('#signal-id-txt').numberbox({
						disabled : true
					});
				}
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
							isValid = isValid && $('#signal-type-sel').combobox("isValid");
							isValid = isValid && $('#signal-id-txt').numberbox("isValid");
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
								OBJECT_ID : parentId,
								conditions : $("#condition-table").datagrid("getData").rows
							};
							newSignal.SIGNAL_TYPE = newSignal.SIGNAL_TYPE ? newSignal.SIGNAL_TYPE : 0;

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
						handler : function() {
							dialogNode.dialog("close");
						}
					} ]
		};
		dialogNode.dialog(cfg);
	}
});
