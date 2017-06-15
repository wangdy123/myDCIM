$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes';
			var floorUrl = "logicobject/floors";
			var $node = $('#floor-datagrid');
			var typeName = WUI.objectTypes[WUI.objectTypeDef.FLOOR].name;

			WUI.floor = WUI.floor || {};

			var currentObject = null;
			function reload(publish) {
				$node.datagrid("reload");
				if (publish) {
					WUI.publishEvent('reload_object', {
						publisher : "floor-configer",
						object : currentObject
					});
				}
			}

			function openObject(floorObject) {
				currentObject = floorObject;
				$node.datagrid({
					url : floorUrl,
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
							floorDialog(null, currentObject.ID);
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
											+ ' onclick="WUI.floor.editrow(this)"></div> ';
									var s = '<div class="separater"></div> ';
									var d = '<div class="icon-remove operator-tool" title="删除" '
											+ ' onclick="WUI.floor.deleterow(this)"></div>';
									return e + s + d;
								}
							}, {
								field : 'CODE',
								title : '编码',
								align : 'right',
								width : 80
							}, {
								field : 'NAME',
								title : '楼层',
								width : 150
							} ] ]
				});
			}
			window.WUI.publishEvent('request_current_object', {
				publisher : 'position-configer',
				cbk : function(object) {
					WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(floorObject) {
						openObject(floorObject);
					}, function() {
						$.messager.alert('失败', "读取" + typeName + "配置失败！");
					});
				}
			});

			WUI.floor.editrow = function(target) {
				var floor = WUI.getDatagridRow($node, target);
				floorDialog(floor, floor.PARENT_ID);
			}
			WUI.floor.deleterow = function(target) {
				var floor = WUI.getDatagridRow($node, target);
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + floor.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + floor.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除" + typeName + "失败！");
						});
					}
				});
			}
			function floorDialog(floor, parentId) {
				var cfg = {
					iconCls : floor ? "icon-edit" : "icon-add",
					title : (floor ? "修改" : "添加") + typeName,
					left : ($(window).width() - 500) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 500,
					closed : false,
					cache : false,
					href : WUI.getConfigerDialogPath(WUI.objectTypes[WUI.objectTypeDef.FLOOR].namespace),
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						for (var i = 1; i <= currentObject.FLOOR_GROUND; i++) {
							$('#floor-sel').append(
									'<option value="' + i + '">' + WUI.makeFloorName(i, false) + '</option>');
						}
						for (var j = 1; j <= currentObject.FLOOR_UNDERGROUND; j++) {
							$('#floor-sel').append(
									'<option value="' + (0 - j) + '">' + WUI.makeFloorName(j, true) + '</option>');
						}
						if (floor) {
							$('#floor-sel').val(floor.SEQUENCE);
							$('#floor-code-txt').val(floor.CODE);
							$('#floor-code-txt').validatebox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#floor-sel').val();
							isValid = isValid && $('#floor-code-txt').validatebox("isValid");
							if (!isValid) {
								return;
							}

							var newfloor = {
								NAME : $('#floor-sel option:selected').text(),
								CODE : $('#floor-code-txt').val(),
								SEQUENCE : $('#floor-sel').val(),
								OBJECT_TYPE : WUI.objectTypeDef.FLOOR,
								PARENT_ID : parentId,
								properties : []
							};

							if (floor) {
								newfloor.ID = floor.ID;
								WUI.ajax.put(objectNodeUrl + "/" + newfloor.ID, newfloor, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(objectNodeUrl, newfloor, function() {
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
