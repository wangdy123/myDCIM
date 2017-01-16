$(document).ready(
		function() {
			var roomUrl = WUI.urlPath + "/configer/rooms";
			var $node = $('#room-datagrid');
			var currentObject = null;
			WUI.room = WUI.room || {};

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
						url : roomUrl,
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
								regionDialog(null, currentObject.ID);
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
									field : 'SEQUENCE',
									title : '序号',
									width : 150
								} ] ]
					});
				}
			});

			function getRowIndex(target) {
				var tr = $(target).closest('tr.datagrid-row');
				return parseInt(tr.attr('datagrid-row-index'));
			}
			function getRowData(target) {
				return $node.datagrid("getRows")[getRowIndex(target)];
			}
			WUI.room.editrow = function(target) {
				var room = getRowData(target);
				roomDialog(room, room.PARENT_ID);
			}
			WUI.room.deleterow = function(target) {
				var room = $node.datagrid("getRows")[getRowIndex(target)];
				$.messager.confirm('确认', '确定要删除机机房【' + room.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(roomUrl + "/" + room.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除机房失败！");
						});
					}
				});
			}

			function roomDialog(room, parentId) {
				var cfg = {
					iconCls : room ? "icon-edit" : "icon-add",
					title : (room ? "修改" : "添加") + "机房",
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 350,
					closed : false,
					cache : false,
					href : '../configer/object/room/room-dialog.html',
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
							$('#room-sequence-txt').val(room.SEQUENCE);
							$('#room-name-txt').validatebox("isValid");
							$('#room-code-txt').validatebox("isValid");
							$('#room-sequence-txt').validatebox("isValid");
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
							isValid = isValid && $('#room-sequence-txt').validatebox("isValid");

							if (!isValid) {
								return;
							}

							var newroom = {
								NAME : $('#room-name-txt').val(),
								ROOM_TYPE : parseInt($('#room-type-txt').val(), 10),
								CODE : $('#room-code-txt').val(),
								SEQUENCE : parseInt($('#room-sequence-txt').val(), 10),
								OBJECT_TYPE : WUI.objectTypeDef.ROOM,
								PARENT_ID : parentId
							};

							if (room) {
								newroom.ID = room.ID;
								WUI.ajax.put(roomUrl, newroom, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改机房失败！");
								});
							} else {
								WUI.ajax.post(roomUrl, newroom, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "添加机房失败！");
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