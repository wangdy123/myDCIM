$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes';
			var cabinetModelUrl = "cabinet-model/cabinetModels";
			var cabinetUrl = "logicobject/cabinets";
			var $node = $('#cabinet-datagrid');
			var typeName = WUI.objectTypes[WUI.objectTypeDef.CABINNET].name;

			var cabinetModels = [];
			WUI.cabinet = WUI.cabinet || {};

			var currentObject = null;
			function reload(publish) {
				$node.datagrid("reload");
				if (publish) {
					WUI.publishEvent('reload_object', {
						publisher : "cabinet-configer",
						object : currentObject
					});
				}
			}

			function openObject(cabinetObject) {
				currentObject = cabinetObject;
				$node.datagrid({
					url : cabinetUrl,
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
							cabinetDialog(null, currentObject.ID);
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
											+ ' onclick="WUI.cabinet.editrow(this)"></div> ';
									var s = '<div class="separater"></div> ';
									var d = '<div class="icon-remove operator-tool" title="删除" '
											+ ' onclick="WUI.cabinet.deleterow(this)"></div>';
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
								field : 'CABINET_MODEL',
								title : '机柜型号',
								width : 100,
								formatter : function(value, row, index) {
									for (var i = 0; i < cabinetModels.length; i++) {
										if (cabinetModels[i].ID === row.CABINET_MODEL) {
											return cabinetModels[i].NAME;
										}
									}
									return "";
								}
							}, {
								field : 'CABINET_DEPTH',
								title : '机柜深度',
								align : 'right',
								formatter : function(value, row, index) {
									return row.CABINET_DEPTH.toFixed(3) + " 米";
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
			WUI.ajax.get(cabinetModelUrl, {}, function(results) {
				cabinetModels = results;
				window.WUI.publishEvent('request_current_object', {
					publisher : 'position-configer',
					cbk : function(object) {
						WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(cabinetObject) {
							openObject(cabinetObject);
						}, function() {
							$.messager.alert('失败', "读取" + typeName + "配置失败！");
						});
					}
				});
			}, function() {
				$.messager.alert('失败', "读取机柜型号失败，请重试！");
			});
			WUI.cabinet.editrow = function(target) {
				var cabinet = WUI.getDatagridRow($node, target);
				cabinetDialog(cabinet, cabinet.PARENT_ID);
			}
			WUI.cabinet.deleterow = function(target) {
				var cabinet = WUI.getDatagridRow($node, target);
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + cabinet.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + cabinet.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除" + typeName + "失败！");
						});
					}
				});
			}
			function cabinetDialog(cabinet, parentId) {
				var dialogNode = $("#configer-dialog");
				var cfg = {
					iconCls : cabinet ? "icon-edit" : "icon-add",
					title : (cabinet ? "修改" : "添加") + typeName,
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 450,
					closed : false,
					cache : false,
					href : WUI.getConfigerDialogPath(WUI.objectTypes[WUI.objectTypeDef.CABINNET].namespace),
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						$('#cabinet-start-use-date').datebox("setValue", WUI.dateFormat(new Date()));
						for (var i = 0; i < cabinetModels.length; i++) {
							$('#cabinet-model-sel').append(
									'<option value="' + cabinetModels[i].ID + '">' + cabinetModels[i].NAME
											+ '</option>');
						}
						function updateTime(model, startTime) {
							if (!model || !startTime) {
								return;
							}
							var model = parseInt(model, 10);
							for (var i = 0; i < cabinetModels.length; i++) {
								if (cabinetModels[i].ID === model) {
									$('#cabinet-depth-txt').numberbox("setValue", cabinetModels[i].DEPTH);
									var endDate = new Date(startTime);
									endDate.setFullYear(endDate.getFullYear() + cabinetModels[i].MAX_USE_AGE);
									$('#cabinet-expect-end-date').datebox("setValue", WUI.dateFormat(endDate));
								}
							}
						}

						$('#cabinet-model-sel').change(function() {
							var startTime = $('#cabinet-start-use-date').datebox("getValue");
							updateTime($('#cabinet-model-sel').val(), startTime);
						});
						$('#cabinet-start-use-date').datebox({
							parser:WUI.date_parse,
							formatter : WUI.dateFormat,
							onSelect : function(date) {
								updateTime($('#cabinet-model-sel').val(), date);
							}
						});
						$('#cabinet-expect-end-date').datebox({
							parser:WUI.date_parse,
							formatter : WUI.dateFormat
						});
						if (cabinet) {
							$('#cabinet-name-txt').val(cabinet.NAME);
							$('#cabinet-code-txt').val(cabinet.CODE);
							$('#cabinet-model-sel').val(cabinet.CABINET_MODEL);
							$('#cabinet-sequence-txt').numberbox("setValue", cabinet.SEQUENCE);
							$('#cabinet-depth-txt').numberbox("setValue", cabinet.CABINET_DEPTH);
							$('#cabinet-start-use-date').datebox("setValue", cabinet.START_USE_DATE);
							$('#cabinet-expect-end-date').datebox("setValue", cabinet.EXPECT_END_DATE);
							$('#cabinet-name-txt').validatebox("isValid");
							$('#cabinet-code-txt').validatebox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#cabinet-name-txt').validatebox("isValid");
							isValid = isValid && $('#cabinet-code-txt').validatebox("isValid");
							isValid = isValid && $('#cabinet-model-sel').val();
							isValid = isValid && $('#cabinet-sequence-txt').val();
							isValid = isValid && $('#cabinet-depth-txt').val();
							if (!isValid) {
								return;
							}

							var newcabinet = {
								NAME : $('#cabinet-name-txt').val(),
								CODE : $('#cabinet-code-txt').val(),
								CABINET_MODEL : parseInt($('#cabinet-model-sel').val(), 10),
								SEQUENCE : parseInt($('#cabinet-sequence-txt').val(), 10),
								CABINET_DEPTH : parseFloat($('#cabinet-depth-txt').val()),
								START_USE_DATE : WUI.timeformat_t($('#cabinet-start-use-date').datebox("getValue")),
								EXPECT_END_DATE : WUI.timeformat_t($('#cabinet-expect-end-date').datebox("getValue")),
								OBJECT_TYPE : WUI.objectTypeDef.CABINNET,
								PARENT_ID : parentId,
								properties : []
							};
							
							if (cabinet) {
								newcabinet.ID = cabinet.ID;
								WUI.ajax.put(objectNodeUrl + "/" + newcabinet.ID, newcabinet, function() {
									dialogNode.dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(objectNodeUrl, newcabinet, function() {
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
