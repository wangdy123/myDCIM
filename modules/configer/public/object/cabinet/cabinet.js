$(document).ready(
		function() {
			var cabinetUrl = WUI.urlPath + "/configer/cabinets";
			var cabinetModelUrl = WUI.urlPath + "/configer/cabinetModels";
			var $node = $('#cabinet-datagrid');
			var currentObject = null;

			var typeName = WUI.objectTypes[window.WUI.objectTypeDef.CABINNET].name;
			function reload(publish) {
				if (currentObject) {
					$node.datagrid("reload", {
						parentId : currentObject.ID
					});
				} else {
					$node.datagrid({
						"data" : []
					});
				}
			}
			function getRowIndex(target) {
				var tr = $(target).closest('tr.datagrid-row');
				return parseInt(tr.attr('datagrid-row-index'));
			}
			function initDataGrid(models) {
				$node.datagrid({
					url : cabinetUrl,
					method : "get",
					singleSelect : true,
					onLoadError : function(s) {
						$.messager.alert('失败', "加载失败");
					},
					queryParams : {
						parentId : currentObject.ID
					},
					toolbar : [ {
						iconCls : 'icon-add',
						handler : function() {
							cabinetDialog(models, null, currentObject.ID);
						}
					}, '-', {
						iconCls : 'icon-reload',
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
									var model = findModel(models, row.CABINET_MODEL);
									return model ? model.NAME : "";
								}
							}, {
								field : 'CABINET_DEPTH',
								title : '机柜深度(米)',
								align : 'right',
								width : 100
							}, {
								field : 'START_USE_DATE',
								title : '投产日期',
								width : 100,
								formatter : function(value, row, index) {
									return WUI.date_reformat(row.START_USE_DATE);
								}
							}, {
								field : 'EXPECT_END_DATE',
								title : '可用期限',
								width : 100,
								formatter : function(value, row, index) {
									return WUI.date_reformat(row.EXPECT_END_DATE);
								}
							} ] ]
				});
			}

			function cabinetDialog(models, cabinet, parentId) {
				function initPowerPanel($powerPanelGrid) {
					function cabinetPowerPanelDialog(powerPanel, callback) {

					}
					WUI.cabinetPowerPanel = WUI.cabinetPowerPanel || {};
					WUI.cabinetPowerPanel.editrow = function(target) {
						var powerPanel = $powerPanelGrid.datagrid("getRows")[getRowIndex(target)];
						cabinetPowerPanelDialog(powerPanel, function(row) {
							$powerPanelGrid.datagrid('updateRow', {
								index : getRowIndex(target),
								row : row
							});
						});
					};
					WUI.cabinetPowerPanel.deleterow = function(target) {
						$powerPanelGrid.datagrid('deleteRow', getRowIndex(target));
					};
					$powerPanelGrid.datagrid({
						singleSelect : true,
						toolbar : [ {
							iconCls : 'icon-add',
							handler : function() {
								cabinetPowerPanelDialog(null, function(row) {
									$powerPanelGrid.datagrid('appendRow', row);
								});
							}
						} ],
						data : cabinet ? cabinet.powerPanels : [],
						columns : [ [
								{
									field : 'action',
									title : '操作',
									width : 60,
									align : 'center',
									formatter : function(value, row, index) {
										var e = '<div class="icon-edit operator-tool" title="修改" '
												+ ' onclick="WUI.cabinetPowerPanel.editrow(this)"></div> ';
										var s = '<div class="separater"></div> ';
										var d = '<div class="icon-remove operator-tool" title="删除" '
												+ ' onclick="WUI.cabinetPowerPanel.deleterow(this)"></div>';
										return e + s + d;
									}
								}, {
									field : 'SEQUENCE',
									title : '序号',
									align : 'right',
									width : 40
								}, {
									field : 'LABEL',
									title : '名称',
									width : 60
								}, {
									field : 'NUMBER_OF_PORT',
									title : '插座数量',
									width : 40,
								}, {
									field : 'MAX_LOAD',
									title : '额定功率(kw)',
									align : 'right',
									width : 100
								}, {
									field : 'POWER_STYLE',
									title : '供电类型',
									width : 100,
									formatter : function(value, row, index) {
										for (var i = 0; i < WUI.powerTypes.length; i++) {
											if (row.POWER_STYLE === WUI.powerTypes[i].type) {
												return WUI.powerTypes[i].name;
											}
										}
									}
								}, {
									field : 'POWER_SUPPORT_DEVICE',
									title : '动力来源',
									width : 100
								} ] ]
					});
				}

				function initNetPanel($netPanelGrid) {
					function netPanelDialog(netPanel, callback) {

					}
					WUI.cabinetNetPanel = WUI.cabinetNetPanel || {};
					WUI.cabinetNetPanel.editrow = function(target) {
						var netPanel = $netPanelGrid.datagrid("getRows")[getRowIndex(target)];
						netPanelDialog(netPanel, function(row) {
							$netPanelGrid.datagrid('updateRow', {
								index : getRowIndex(target),
								row : row
							});
						});
					};
					WUI.cabinetNetPanel.deleterow = function(target) {
						$netPanelGrid.datagrid('deleteRow', getRowIndex(target));
					};
					$netPanelGrid.datagrid({
						singleSelect : true,
						toolbar : [ {
							iconCls : 'icon-add',
							handler : function() {
								netPanelDialog(null, function(row) {
									$netPanelGrid.datagrid('appendRow', row);
								});
							}
						} ],
						data : cabinet ? cabinet.netPanels : [],
						columns : [ [
								{
									field : 'action',
									title : '操作',
									width : 60,
									align : 'center',
									formatter : function(value, row, index) {
										var e = '<div class="icon-edit operator-tool" title="修改" '
												+ ' onclick="WUI.cabinetNetPanel.editrow(this)"></div> ';
										var s = '<div class="separater"></div> ';
										var d = '<div class="icon-remove operator-tool" title="删除" '
												+ ' onclick="WUI.cabinetNetPanel.deleterow(this)"></div>';
										return e + s + d;
									}
								}, {
									field : 'SEQUENCE',
									title : '序号',
									align : 'right',
									width : 40
								}, {
									field : 'LABEL',
									title : '名称',
									width : 60
								}, {
									field : 'NUMBER_OF_PORT',
									title : '网口数量',
									width : 40,
								} ] ]
					});
				}
				function getPowerPanel($powerPanelGrid) {
					return $powerPanelGrid.datagrid('getData');
				}
				function getNetPanel($netPanelGrid) {
					return $netPanelGrid.datagrid('getData');
				}
				var cfg = {
					iconCls : cabinet ? "icon-edit" : "icon-add",
					title : (cabinet ? "修改" : "添加") + typeName,
					left : ($(window).width() - 600) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 650,
					closed : false,
					cache : false,
					href : '../configer/object/cabinet/dialog.html',
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						for (var index = 0; index < models.length; index++) {
							$('#cabinet-model-txt').append(
									'<option value="' + models[index].ID + '">' + models[index].NAME + '</option>');
						}
						function setEndDate() {
							var startDate = $('#start-use-date').datebox('getValue');
							var model = findModel($('#cabinet-model-txt').val());
							if (startDate && model) {
								var endDate = WUI.timeAddSecond(startDate, parseInt(model.MAX_USE_YEAR, 10) * 365);
								$('#expect-end-date').datebox('setValue', WUI.date_format(endDate));
							}
						}
						document.getElementById("cabinet-model-txt").onchange = setEndDate;
						$('#start-use-date').datebox({
							onSelect : setEndDate
						});
						$('#start-use-date').datebox('setValue', WUI.date_format(new Date()));
						setEndDate();
						initPowerPanel($("#cabinet-power-datagrid"));
						initNetPanel($("#cabinet-net-datagrid"));
						if (cabinet) {
							$('#cabinet-name-txt').val(cabinet.NAME);
							$('#cabinet-code-txt').val(cabinet.CODE);
							$('#cabinet-sequence-txt').val(cabinet.SEQUENCE);
							$('#cabinet-model-txt').val(cabinet.CABINET_MODEL);
							$('#cabinet-depth-txt').val(cabinet.CABINET_DEPTH);
							$('#start-use-date').datebox('setValue', cabinet.START_USE_DATE);
							$('#expect-end-date').datebox('setValue', cabinet.EXPECT_END_DATE);
							$('#cabinet-name-txt').validatebox("isValid");
							$('#cabinet-code-txt').validatebox("isValid");
							$('#cabinet-sequence-txt').validatebox("isValid");
							$('#cabinet-depth-txt').validatebox("isValid");
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
							isValid = isValid && $('#cabinet-sequence-txt').validatebox("isValid");
							isValid = isValid && $('#cabinet-model-txt').val();
							isValid = isValid && $('#cabinet-depth-txt').validatebox("isValid");
							isValid = isValid && $('#start-use-date').datebox('getValue');
							isValid = isValid && $('#expect-end-date').datebox('getValue');
							if (!isValid) {
								return;
							}
							var newObject = {
								NAME : $('#cabinet-name-txt').val(),
								CODE : $('#cabinet-code-txt').val(),
								SEQUENCE : $('#cabinet-sequence-txt').val(),
								CABINET_MODEL : $('#cabinet-model-txt').val(),
								CABINET_DEPTH : $('#cabinet-depth-txt').val(),
								START_USE_DATE : $('#start-use-date').datebox('getValue'),
								EXPECT_END_DATE : $('#expect-end-date').datebox('getValue'),
								OBJECT_TYPE : WUI.objectTypeDef.CABINNET,
								PARENT_ID : parentId,
								powerPanels : getPowerPanel($("#cabinet-power-datagrid")),
								netPanels : getNetPanel("#cabinet-net-datagrid")
							};

							if (cabinet) {
								newObject.ID = cabinet.ID;
								WUI.ajax.put(cabinetUrl, newObject, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(cabinetUrl, newObject, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "添加" + typeName + "失败！");
								});
							}
						}
					}, {
						text : '取消',
						handler : function() {
							$('#configer-dialog').dialog("close");
						}
					} ]
				};
				$('#configer-dialog').dialog(cfg);
			}
			function findModel(models, modelId) {
				for (var index = 0; index < models.length; index++) {
					if (models[index].ID == modelId) {
						return models[index];
					}
				}
			}
			WUI.ajax.get(cabinetModelUrl, {}, function(models) {
				WUI.publishEvent('current_object', {
					publisher : 'configer',
					cbk : function(object) {
						if (currentObject && currentObject.ID === object.ID) {
							return;
						}
						currentObject = object;
						initDataGrid(models);

						WUI.cabinet = WUI.cabinet || {};
						WUI.cabinet.editrow = function(target) {
							var cabinet = $node.datagrid("getRows")[getRowIndex(target)];
							cabinetDialog(models, cabinet, cabinet.PARENT_ID);
						}
						WUI.cabinet.deleterow = function(target) {
							var cabinet = $node.datagrid("getRows")[getRowIndex(target)];
							$.messager.confirm('确认', '确定要删除' + typeName + '【' + cabinet.NAME + '】吗?', function(r) {
								if (r) {
									WUI.ajax.remove(cabinetUrl + "/" + cabinet.ID, {}, function() {
										reload(true);
									}, function() {
										$.messager.alert('失败', "删除" + typeName + "失败！");
									});
								}
							});
						}
					}
				});

			}, function() {
				$.messager.alert('失败', "获取机柜型号失败！");
			});
		});