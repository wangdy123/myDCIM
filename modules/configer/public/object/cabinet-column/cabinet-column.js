$(document).ready(
		function() {
			var cabinetColumnUrl = WUI.urlPath + "/configer/cabinetColumns";
			var $node = $('#cabinetColumn-datagrid');
			var currentObject = null;

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

			window.WUI.publishEvent('current_object', {
				publisher : 'configer',
				cbk : function(object) {
					if (currentObject && currentObject.ID === object.ID) {
						return;
					}
					currentObject = object;
					$node.datagrid({
						url : cabinetColumnUrl,
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
								cabinetColumnDialog(null, currentObject.ID);
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
												+ ' onclick="WUI.cabinetColumn.editrow(this)"></div> ';
										var s = '<div class="separater"></div> ';
										var d = '<div class="icon-remove operator-tool" title="删除" '
												+ ' onclick="WUI.cabinetColumn.deleterow(this)"></div>';
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
									field : 'CABINET_COUNT',
									title : '机柜数',
									align : 'right',
									width : 100
								}, {
									field : 'CABINET_DEPTH',
									title : '机柜深度(米)',
									align : 'right',
									width : 100
								} ] ]
					});
				}
			});
			function getRowIndex(target) {
				var tr = $(target).closest('tr.datagrid-row');
				return parseInt(tr.attr('datagrid-row-index'));
			}
			WUI.cabinetColumn = WUI.cabinetColumn || {};
			var typeName = WUI.objectTypes[window.WUI.objectTypeDef.CABINNET_COLUMN].name;
			WUI.cabinetColumn.editrow = function(target) {
				var cabinetColumn =  $node.datagrid("getRows")[getRowIndex(target)];
				cabinetColumnDialog(cabinetColumn, cabinetColumn.PARENT_ID);
			}
			WUI.cabinetColumn.deleterow = function(target) {
				var cabinetColumn = $node.datagrid("getRows")[getRowIndex(target)];
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + cabinetColumn.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(cabinetColumnUrl + "/" + cabinetColumn.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除" + typeName + "失败！");
						});
					}
				});
			}

			function cabinetColumnDialog(cabinetColumn, parentId) {
				var cfg = {
					iconCls : cabinetColumn ? "icon-edit" : "icon-add",
					title : (cabinetColumn ? "修改" : "添加") + typeName,
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 350,
					closed : false,
					cache : false,
					href : '../configer/object/cabinet-column/dialog.html',
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						if (cabinetColumn) {
							$('#row-name-txt').val(cabinetColumn.NAME);
							$('#row-code-txt').val(cabinetColumn.CODE);
							$('#row-sequence-txt').val(cabinetColumn.SEQUENCE);
							$('#row-count-txt').val(cabinetColumn.CABINET_COUNT);
							$('#row-depth-txt').val(cabinetColumn.CABINET_DEPTH);
							$('#row-name-txt').validatebox("isValid");
							$('#row-code-txt').validatebox("isValid");
							$('#row-sequence-txt').validatebox("isValid");
							$('#row-count-txt').validatebox("isValid");
							$('#row-depth-txt').validatebox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#row-name-txt').validatebox("isValid");
							isValid = isValid && $('#row-code-txt').validatebox("isValid");
							isValid = isValid && $('#row-sequence-txt').validatebox("isValid");
							isValid = isValid && $('#row-count-txt').validatebox("isValid");
							isValid = isValid && $('#row-depth-txt').validatebox("isValid");
							if (!isValid) {
								return;
							}
							var newObject = {
								NAME : $('#row-name-txt').val(),
								CODE : $('#row-code-txt').val(),
								SEQUENCE : $('#row-sequence-txt').val(),
								CABINET_COUNT : $('#row-count-txt').val(),
								CABINET_DEPTH : $('#row-depth-txt').val(),
								OBJECT_TYPE : WUI.objectTypeDef.CABINNET_COLUMN,
								PARENT_ID : parentId
							};

							if (cabinetColumn) {
								newObject.ID = cabinetColumn.ID;
								WUI.ajax.put(cabinetColumnUrl, newObject, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(cabinetColumnUrl, newObject, function() {
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
		});