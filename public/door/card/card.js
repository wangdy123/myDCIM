$(document).ready(
		function() {
			var doorUrl = "/configer/doors";
			var $node = $('#door-datagrid');
			var currentObject = null;
			function getRowIndex(target) {
				var tr = $(target).closest('tr.datagrid-row');
				return parseInt(tr.attr('datagrid-row-index'));
			}
			function getRowData(target) {
				return $node.datagrid("getRows")[getRowIndex(target)];
			}

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
			WUI.subscribe('open_object', function(event) {
				object = event.object;
				if (currentObject && currentObject.ID === object.ID) {
					return;
				}
				if (object.OBJECT_TYPE !== WUI.objectTypeDef.ROOM) {
					return;
				}
				currentObject = object;
				$("#workspace-title").text(currentObject.NAME);

				$node.datagrid({
					toolbar : [ {
						iconCls : "icon-add",
						handler : function() {
							doorDialog(null, currentObject.ID);
						}
					}, '-', {
						iconCls : 'icon-reload',
						handler : function() {
							reload(true);
						}
					} ]
				});

				reload(false);
			});
			$node.datagrid({
				url : doorUrl,
				method : "get",
				singleSelect : true,
				onLoadError : function(s) {
					$.messager.alert('失败', "加载失败");
				},
				columns : [ [
						{
							field : 'action',
							title : '操作',
							width : 100,
							align : 'center',
							formatter : function(value, row, index) {
								var e = '<div class="icon-edit operator-tool" title="修改" '
										+ ' onclick="WUI.door.editrow(this)"></div> ';
								var s = '<div class="separater"></div> ';
								var d = '<div class="icon-remove operator-tool" title="删除" '
										+ ' onclick="WUI.door.deleterow(this)"></div>';
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
							width : 150
						} ] ]
			});
			WUI.door = {};
			WUI.door.editrow = function(target) {
				var door = getRowData(target);
				doorDialog(door, door.PARENT_ID);
			}
			WUI.door.deleterow = function(target) {
				var door = $node.datagrid("getRows")[getRowIndex(target)];
				$.messager.confirm('确认', '确定要删除机门禁【' + door.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(doorUrl + "/" + door.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除门禁失败！");
						});
					}
				});
			}

			function doorDialog(door, parentId) {
				var cfg = {
					iconCls : door ? "icon-edit" : "icon-add",
					title : (door ? "修改" : "添加") + "门禁",
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 350,
					closed : false,
					cache : false,
					href : '/door/door-dialog.html',
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						if (door) {
							$('#door-name-txt').val(door.NAME);
							$('#door-code-txt').val(door.CODE);
							$('#door-sequence-txt').val(door.SEQUENCE);
							$('#door-name-txt').validatebox("isValid");
							$('#door-code-txt').validatebox("isValid");
							$('#door-sequence-txt').validatebox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#door-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#door-name-txt').validatebox("isValid");
							isValid = isValid && $('#door-code-txt').val();
							isValid = isValid && $('#door-sequence-txt').validatebox("isValid");

							if (!isValid) {
								return;
							}

							var newdoor = {
								NAME : $('#door-name-txt').val(),
								CODE : $('#door-code-txt').val(),
								SEQUENCE : parseInt($('#door-sequence-txt').val(), 10),
								OBJECT_TYPE : WUI.objectTypeDef.DOOR,
								PARENT_ID : parentId
							};

							if (door) {
								newdoor.ID = door.ID;
								WUI.ajax.put(doorUrl, newdoor, function() {
									$('#door-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改门禁失败！");
								});
							} else {
								WUI.ajax.post(doorUrl, newdoor, function() {
									$('#door-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "添加门禁失败！");
								});
							}

						}
					}, {
						text : '取消',
						handler : function() {
							$('#door-dialog').dialog("close");
						}
					} ]
				};
				$('#door-dialog').dialog(cfg);
			}
		});