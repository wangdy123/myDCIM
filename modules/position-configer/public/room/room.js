$(document).ready(
		function() {
			var objectNodeUrl = 'position-configer/objectNodes';
			var roomUrl = "position-configer/rooms";
			var $node = $('#room-datagrid');

			WUI.room = WUI.room || {};

			var currentObject = null;
			function reload(publish) {
				$node.datagrid("reload");
				if (publish) {
					WUI.publishEvent('reload_object', {
						publisher : "room-configer",
						object : currentObject
					});
				}
			}

			function openObject(roomObject) {
				currentObject = roomObject;
				$node.datagrid({
					url : roomUrl,
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
						handler : function() {
							roomDialog(null, currentObject.ID);
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
											+ ' onclick="WUI.room.editrow(this)"></div> ';
									var s = '<div class="separater"></div> ';
									var d = '<div class="icon-remove operator-tool" title="删除" '
											+ ' onclick="WUI.room.deleterow(this)"></div>';
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
								field : 'ROOM_TYPE',
								title : '机房类型',
								width : 150,
								formatter : function(value, row, index) {
									return WUI.roomTypes[row.ROOM_TYPE];
								}
							}, {
								field : 'DESCRIPTION',
								title : '描述',
								width : 200
							} ] ]
				});
			}
			window.WUI.publishEvent('request_current_object', {
				publisher : 'position-configer',
				cbk : function(object) {
					WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(roomObject) {
						openObject(roomObject);
					}, function() {
						var typeName = WUI.objectTypes[WUI.objectTypeDef.ROOM].name;
						$.messager.alert('失败', "读取" + typeName + "配置失败！");
					});
				}
			});

			WUI.room.editrow = function(target) {
				var room = WUI.getDatagridRow($node, target);
				roomDialog(room, room.PARENT_ID);
			}
			WUI.room.deleterow = function(target) {
				var room = WUI.getDatagridRow($node, target);
				var typeName = WUI.objectTypes[WUI.objectTypeDef.ROOM].name;
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + room.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + room.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除" + typeName + "失败！");
						});
					}
				});
			}
			function roomDialog(room, parentId) {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.ROOM].name;
				$('#configer-dialog').dialog({
					iconCls : room ? "icon-edit" : "icon-add",
					title : (room ? "修改" : "添加") + typeName,
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 450,
					closed : false,
					cache : false,
					href : WUI.getConfigerDialogPath(WUI.objectTypes[WUI.objectTypeDef.ROOM].namespace),
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						for ( var key in WUI.roomTypes) {
							$('#room-type-txt').append(
									'<option value="' + key + '">' + WUI.roomTypes[key] + '</option>');
						}
						if (room) {
							$('#room-name-txt').val(room.NAME);
							$('#room-code-txt').val(room.CODE);
							$('#room-type-txt').val(room.ROOM_TYPE);
							$('#room-desc-txt').textbox("setValue", room.DESCRIPTION);
							$('#room-name-txt').validatebox("isValid");
							$('#room-code-txt').validatebox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#room-name-txt').validatebox("isValid");
							isValid = isValid && $('#room-code-txt').val();
							isValid = isValid && $('#room-type-txt').val();
							if (!isValid) {
								return;
							}

							var newroom = {
								NAME : $('#room-name-txt').val(),
								ROOM_TYPE : parseInt($('#room-type-txt').val(), 10),
								CODE : $('#room-code-txt').val(),
								DESCRIPTION : $('#room-desc-txt').textbox("getValue"),
								OBJECT_TYPE : WUI.objectTypeDef.ROOM,
								PARENT_ID : parentId,
								properties : []
							};

							if (room) {
								newroom.ID = room.ID;
								WUI.ajax.put(objectNodeUrl + "/" + newroom.ID, newroom, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(objectNodeUrl, newroom, function() {
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
