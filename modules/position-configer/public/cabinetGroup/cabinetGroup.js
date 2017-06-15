$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes';
			var cabinetGroupUrl = "logicobject/cabinetGroups";
			var $node = $('#cabinetGroup-datagrid');
			var typeName = WUI.objectTypes[WUI.objectTypeDef.CABINNET_GROUP].name;

			WUI.cabinetGroup = WUI.cabinetGroup || {};

			var currentObject = null;
			function reload(publish) {
				$node.datagrid("reload");
				if (publish) {
					WUI.publishEvent('reload_object', {
						publisher : "cabinetGroup-configer",
						object : currentObject
					});
				}
			}

			function openObject(cabinetGroupObject) {
				currentObject = cabinetGroupObject;
				$node.datagrid({
					url : cabinetGroupUrl,
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
							cabinetGroupDialog(null, currentObject.ID);
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
											+ ' onclick="WUI.cabinetGroup.editrow(this)"></div> ';
									var s = '<div class="separater"></div> ';
									var d = '<div class="icon-remove operator-tool" title="删除" '
											+ ' onclick="WUI.cabinetGroup.deleterow(this)"></div>';
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
			window.WUI.publishEvent('request_current_object', {
				publisher : 'position-configer',
				cbk : function(object) {
					WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(cabinetGroupObject) {
						openObject(cabinetGroupObject);
					}, function() {
						$.messager.alert('失败', "读取" + typeName + "配置失败！");
					});
				}
			});

			WUI.cabinetGroup.editrow = function(target) {
				var cabinetGroup = WUI.getDatagridRow($node, target);
				cabinetGroupDialog(cabinetGroup, cabinetGroup.PARENT_ID);
			}
			WUI.cabinetGroup.deleterow = function(target) {
				var cabinetGroup = WUI.getDatagridRow($node, target);
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + cabinetGroup.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + cabinetGroup.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除" + typeName + "失败！");
						});
					}
				});
			}
			function cabinetGroupDialog(cabinetGroup, parentId) {
				$('#configer-dialog').dialog({
					iconCls : cabinetGroup ? "icon-edit" : "icon-add",
					title : (cabinetGroup ? "修改" : "添加") + typeName,
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 450,
					closed : false,
					cache : false,
					href : WUI.getConfigerDialogPath(WUI.objectTypes[WUI.objectTypeDef.CABINNET_GROUP].namespace),
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						if (cabinetGroup) {
							$('#cabinetGroup-name-txt').val(cabinetGroup.NAME);
							$('#cabinetGroup-code-txt').val(cabinetGroup.CODE);
							$('#cabinetGroup-count-txt').numberbox("setValue", cabinetGroup.CABINET_COUNT);
							$('#cabinetGroup-depth-txt').numberbox("setValue", cabinetGroup.CABINET_DEPTH);
							$('#cabinetGroup-name-txt').validatebox("isValid");
							$('#cabinetGroup-code-txt').validatebox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#cabinetGroup-name-txt').validatebox("isValid");
							isValid = isValid && $('#cabinetGroup-code-txt').validatebox("isValid");
							isValid = isValid && $('#cabinetGroup-count-txt').val();
							isValid = isValid && $('#cabinetGroup-depth-txt').val();
							if (!isValid) {
								return;
							}

							var newcabinetGroup = {
								NAME : $('#cabinetGroup-name-txt').val(),
								CODE : $('#cabinetGroup-code-txt').val(),
								CABINET_COUNT : parseFloat($('#cabinetGroup-count-txt').val()),
								CABINET_DEPTH : parseFloat($('#cabinetGroup-depth-txt').val()),
								OBJECT_TYPE : WUI.objectTypeDef.CABINNET_GROUP,
								PARENT_ID : parentId,
								properties : []
							};

							if (cabinetGroup) {
								newcabinetGroup.ID = cabinetGroup.ID;
								WUI.ajax.put(objectNodeUrl + "/" + newcabinetGroup.ID, newcabinetGroup, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(objectNodeUrl, newcabinetGroup, function() {
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
				});
			}
		});
