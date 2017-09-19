$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes';
			var rackModelUrl = "rack-model/rackModels";
			var rackUrl = "logicobject/racks";
			var $node = $('#rack-datagrid');
			var typeName = WUI.objectTypes[WUI.objectTypeDef.RACK].name;

			var rackModels = [];
			WUI.rack = WUI.rack || {};

			var currentObject = null;
			function reload(publish) {
				$node.datagrid("reload");
				if (publish) {
					WUI.publishEvent('reload_object', {
						publisher : "rack-configer",
						object : currentObject
					});
				}
			}

			function openObject(rackObject) {
				currentObject = rackObject;
				$node.datagrid({
					url : rackUrl,
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
						text : '添加【' + typeName + '】',
						handler : function() {
							rackDialog(null, currentObject.ID);
						}
					}, '-', {
						iconCls : 'icon-reload',
						text : '刷新',
						handler : function() {
							reload(true);
						}
					} ],
					columns : [ [
							{
								field : 'action',
								title : '操作',
								width : 100,
								align : 'center',
								formatter : function(value, row, index) {
									var e = '<div class="icon-edit operator-tool" title="修改" '
											+ ' onclick="WUI.rack.editrow(this)"></div> ';
									var s = '<div class="separater"></div> ';
									var d = '<div class="icon-remove operator-tool" title="删除" '
											+ ' onclick="WUI.rack.deleterow(this)"></div>';
									return e + s + d;
								}
							}, {
								field : 'CODE',
								title : '编码',
								align : 'right',
								width : 80
							}, {
								field : 'NAME',
								title : '名称',
								width : 150
							}, {
								field : 'SEQUENCE',
								title : '序号',
								align : 'right',
								width : 100
							}, {
								field : 'RACK_MODEL',
								title : '机柜型号',
								width : 100,
								formatter : function(value, row, index) {
									for (var i = 0; i < rackModels.length; i++) {
										if (rackModels[i].ID === row.RACK_MODEL) {
											return rackModels[i].NAME;
										}
									}
									return "";
								}
							}, {
								field : 'RACK_DEPTH',
								title : '机柜深度',
								align : 'right',
								formatter : function(value, row, index) {
									return row.RACK_DEPTH.toFixed(3) + " 米";
								}
							}, {
								field : 'START_USE_DATE',
								title : '投产日期',
								width : 100,
								formatter : function(value, row, index) {
									return WUI.dateFormat(row.START_USE_DATE);
								}
							}, {
								field : 'EXPECT_END_DATE',
								title : '预计报废日期',
								width : 100,
								formatter : function(value, row, index) {
									return WUI.dateFormat(row.EXPECT_END_DATE);
								}
							} ] ]
				});
			}
			WUI.ajax.get(rackModelUrl, {}, function(results) {
				rackModels = results;
				window.WUI.publishEvent('request_current_object', {
					publisher : 'position-configer',
					cbk : openObject
				});
			}, function() {
				$.messager.alert('失败', "读取机柜型号失败，请重试！");
			});
			WUI.rack.editrow = function(target) {
				var rack = WUI.getDatagridRow($node, target);
				rackDialog(rack, rack.PARENT_ID);
			}
			WUI.rack.deleterow = function(target) {
				var rack = WUI.getDatagridRow($node, target);
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + rack.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + rack.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除" + typeName + "失败！");
						});
					}
				});
			}
			function rackDialog(rack, parentId) {
				var dialogNode = $("#configer-dialog");
				var cfg = {
					iconCls : rack ? "icon-edit" : "icon-add",
					title : (rack ? "修改" : "添加") + typeName,
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 450,
					closed : false,
					cache : false,
					href : WUI.getConfigerDialogPath(WUI.objectTypes[WUI.objectTypeDef.RACK].namespace),
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						$('#rack-model-sel').combobox({
							editable : false,
							required : true,
							valueField : 'ID',
							textField : 'NAME',
							data : rackModels,
							onSelect : function(rec) {
								var startTime = $('#rack-start-use-date').datebox("getValue");
								updateTime(rec.ID, startTime);
							},
							keyHandler : {
								down : function(e) {
									$('#rack-model-sel').combobox("showPanel");
								}
							}
						});
						function updateTime(model, startTime) {
							if (!model || !startTime) {
								return;
							}
							var model = parseInt(model, 10);
							for (var i = 0; i < rackModels.length; i++) {
								if (rackModels[i].ID === model) {
									$('#rack-depth-txt').numberbox("setValue", rackModels[i].DEPTH);
									var endDate = new Date(startTime);
									endDate.setFullYear(endDate.getFullYear() + rackModels[i].MAX_USE_AGE);
									$('#rack-expect-end-date').datebox("setValue", WUI.dateFormat(endDate));
								}
							}
						}

						$('#rack-start-use-date').datebox({
							required : true,
							parser : WUI.date_parse,
							formatter : WUI.dateFormat,
							onSelect : function(date) {
								updateTime($('#rack-model-sel').combobox("getValue"), date);
							}
						});
						$('#rack-expect-end-date').datebox({
							required : true,
							parser : WUI.date_parse,
							formatter : WUI.dateFormat
						});
						$('#rack-start-use-date').datebox("setValue", WUI.dateFormat(new Date()));
						if (rack) {
							$('#rack-name-txt').textbox("setValue", rack.NAME);
							$('#rack-code-txt').textbox("setValue", rack.CODE);
							$('#rack-model-sel').combobox("setValue", rack.RACK_MODEL);
							$('#rack-sequence-txt').numberbox("setValue", rack.SEQUENCE);
							$('#rack-depth-txt').numberbox("setValue", rack.RACK_DEPTH);
							$('#rack-start-use-date').datebox("setValue", rack.START_USE_DATE);
							$('#rack-expect-end-date').datebox("setValue", rack.EXPECT_END_DATE);
							$('#rack-name-txt').textbox("isValid");
							$('#rack-code-txt').textbox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#rack-name-txt').textbox("isValid");
							isValid = isValid && $('#rack-code-txt').textbox("isValid");
							isValid = isValid && $('#rack-model-sel').combobox("isValid");
							isValid = isValid && $('#rack-sequence-txt').numberbox("isValid");
							isValid = isValid && $('#rack-depth-txt').numberbox("isValid");
							if (!isValid) {
								return;
							}

							var newrack = {
								NAME : $('#rack-name-txt').textbox("getValue"),
								CODE : $('#rack-code-txt').textbox("getValue"),
								RACK_MODEL : parseInt($('#rack-model-sel').combobox("getValue"), 10),
								SEQUENCE : parseInt($('#rack-sequence-txt').numberbox("getValue"), 10),
								RACK_DEPTH : parseFloat($('#rack-depth-txt').numberbox("getValue")),
								START_USE_DATE : WUI.timeformat_t($('#rack-start-use-date').datebox("getValue")),
								EXPECT_END_DATE : WUI.timeformat_t($('#rack-expect-end-date').datebox("getValue")),
								OBJECT_TYPE : WUI.objectTypeDef.RACK,
								PARENT_ID : parentId,
								params : {}
							};

							if (rack) {
								newrack.ID = rack.ID;
								WUI.ajax.put(objectNodeUrl + "/" + newrack.ID, newrack, function() {
									dialogNode.dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(objectNodeUrl, newrack, function() {
									dialogNode.dialog("close");
									reload(true);
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
