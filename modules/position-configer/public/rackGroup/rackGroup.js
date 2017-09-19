$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes';
			var rackGroupUrl = "logicobject/rackGroups";
			var $node = $('#rackGroup-datagrid');
			var typeName = WUI.objectTypes[WUI.objectTypeDef.RACK_GROUP].name;

			WUI.rackGroup = WUI.rackGroup || {};

			var currentObject = null;
			function reload(publish) {
				$node.datagrid("reload");
				if (publish) {
					WUI.publishEvent('reload_object', {
						publisher : "rackGroup-configer",
						object : currentObject
					});
				}
			}

			function openObject(rackGroupObject) {
				currentObject = rackGroupObject;
				$node.datagrid({
					url : rackGroupUrl,
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
							rackGroupDialog(null, currentObject.ID);
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
											+ ' onclick="WUI.rackGroup.editrow(this)"></div> ';
									var s = '<div class="separater"></div> ';
									var d = '<div class="icon-remove operator-tool" title="删除" '
											+ ' onclick="WUI.rackGroup.deleterow(this)"></div>';
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
								field : 'RACK_COUNT',
								title : '机柜数',
								align : 'right',
								width : 100
							}, {
								field : 'RACK_DEPTH',
								title : '机柜深度(米)',
								align : 'right',
								width : 100
							} ] ]
				});
			}
			window.WUI.publishEvent('request_current_object', {
				publisher : 'position-configer',
				cbk : openObject
			});

			WUI.rackGroup.editrow = function(target) {
				var rackGroup = WUI.getDatagridRow($node, target);
				rackGroupDialog(rackGroup, rackGroup.PARENT_ID);
			}
			WUI.rackGroup.deleterow = function(target) {
				var rackGroup = WUI.getDatagridRow($node, target);
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + rackGroup.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + rackGroup.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除" + typeName + "失败！");
						});
					}
				});
			}
			function rackGroupDialog(rackGroup, parentId) {
				$('#configer-dialog').dialog({
					iconCls : rackGroup ? "icon-edit" : "icon-add",
					title : (rackGroup ? "修改" : "添加") + typeName,
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 400,
					closed : false,
					cache : false,
					href : WUI.getConfigerDialogPath(WUI.objectTypes[WUI.objectTypeDef.RACK_GROUP].namespace),
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						if (rackGroup) {
							$('#rackGroup-name-txt').textbox("setValue", rackGroup.NAME);
							$('#rackGroup-code-txt').textbox("setValue", rackGroup.CODE);
							$('#rackGroup-count-txt').numberbox("setValue", rackGroup.RACK_COUNT);
							$('#rackGroup-depth-txt').numberbox("setValue", rackGroup.RACK_DEPTH);
							$('#rackGroup-name-txt').textbox("isValid");
							$('#rackGroup-code-txt').textbox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#rackGroup-name-txt').textbox("isValid");
							isValid = isValid && $('#rackGroup-code-txt').textbox("isValid");
							isValid = isValid && $('#rackGroup-count-txt').numberbox("isValid");
							isValid = isValid && $('#rackGroup-depth-txt').numberbox("isValid");
							if (!isValid) {
								return;
							}

							var newRackGroup = {
								NAME : $('#rackGroup-name-txt').textbox("getValue"),
								CODE : $('#rackGroup-code-txt').textbox("getValue"),
								RACK_COUNT : parseFloat($('#rackGroup-count-txt').numberbox("getValue")),
								RACK_DEPTH : parseFloat($('#rackGroup-depth-txt').numberbox("getValue")),
								OBJECT_TYPE : WUI.objectTypeDef.RACK_GROUP,
								PARENT_ID : parentId,
								params : {}
							};

							if (rackGroup) {
								newRackGroup.ID = rackGroup.ID;
								WUI.ajax.put(objectNodeUrl + "/" + newRackGroup.ID, newRackGroup, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(objectNodeUrl, newRackGroup, function() {
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
