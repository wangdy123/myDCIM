$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes';
			var roomUrl = "logicobject/rooms";
			var departmentUrl = "account/departments";
			var personnelUrl = "account/personnels";
			var $node = $('#room-datagrid');
			var typeName = WUI.objectTypes[WUI.objectTypeDef.ROOM].name;

			var departments = [];
			var personnels = [];
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
						text : '添加【' + typeName + '】',
						handler : function() {
							roomDialog(null, currentObject.ID);
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
								field : 'CABINET_COUNT',
								title : '机架数量',
								width : 80
							}, {
								field : 'SAFETY_PERSON',
								title : '安全负责人',
								width : 150,
								formatter : function(value, row, index) {
									var personnel = WUI.findFromArray(personnels, "ID", row.SAFETY_PERSON);
									if (personnel) {
										return personnel.NAME;
									}
								}
							}, {
								field : 'DEPARTMENT',
								title : '所属部门',
								width : 150,
								formatter : function(value, row, index) {
									var department = WUI.findFromArray(departments, "ID", row.DEPARTMENT);
									if (department) {
										return department.NAME;
									}
								}
							}, {
								field : 'DESCRIPTION',
								title : '描述',
								width : 200
							}, WUI.pageConfiger.createConfigerColumn() ] ]
				});
			}
			var tasks = [ function(finishedCbk) {
				WUI.ajax.get(departmentUrl, {}, function(results) {
					departments = results;
					finishedCbk();
				}, function(err) {
					finishedCbk(err);
				});
			}, function(finishedCbk) {
				WUI.ajax.get(personnelUrl, {}, function(results) {
					personnels = results;
					finishedCbk();
				}, function(err) {
					finishedCbk(err);
				});
			} ]
			WUI.parallel(tasks, function(errs) {
				window.WUI.publishEvent('request_current_object', {
					publisher : 'position-configer',
					cbk : openObject
				});
			});
			WUI.pageConfiger.editPage = function(target) {
				var nodeObject = WUI.getDatagridRow($node, target);
				WUI.pageConfiger.pageDialog(nodeObject);
			};
			WUI.room.editrow = function(target) {
				var room = WUI.getDatagridRow($node, target);
				roomDialog(room, room.PARENT_ID);
			};
			WUI.room.deleterow = function(target) {
				var room = WUI.getDatagridRow($node, target);
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + room.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + room.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除" + typeName + "失败！");
						});
					}
				});
			};
			function roomDialog(room, parentId) {
				var cfg = {
					iconCls : room ? "icon-edit" : "icon-add",
					title : (room ? "修改" : "添加") + typeName,
					left : ($(window).width() - 500) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 500,
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
						$('#room-type-txt').combobox({
							editable : false,
							required : true
						});
						$('#room-department').combobox({
							url : departmentUrl,
							editable : false,
							method : 'get',
							valueField : 'ID',
							textField : 'NAME',
							onSelect : function(rec) {
								var url = personnelUrl + '?departmentId=' + rec.ID;
								$('#room-safety-person').combobox('reload', url);
							},
							onLoadSuccess : function() {
								if (room) {
									$('#room-department').combobox("setValue", room.DEPARTMENT);
								} else {
									var departments = $('#room-department').combobox("getData");
									if (departments.length > 0) {
										$('#room-department').combobox("setValue", departments[0].ID);
									} else {
										$('#room-department').combobox("clear");
									}
								}
							},
							keyHandler : {
								down : function(e) {
									$('#room-department').combobox("showPanel");
								}
							}

						});
						$('#room-safety-person').combobox({
							editable : false,
							keyHandler : {
								down : function(e) {
									$('#room-safety-person').combobox("showPanel");
								}
							},
							method : 'get',
							valueField : 'ID',
							textField : 'NAME',
							onLoadSuccess : function() {
								if (room) {
									$('#room-safety-person').combobox("setValue", room.SAFETY_PERSON);
								} else {
									var personnels = $('#room-safety-person').combobox("getData");
									if (personnels.length > 0) {
										$('#room-safety-person').combobox("setValue", personnels[0].ID);
									} else {
										$('#room-safety-person').combobox("clear");
									}
								}
							}
						});
						if (room) {
							$('#room-name-txt').textbox("setValue", room.NAME);
							$('#room-code-txt').textbox("setValue", room.CODE);
							$('#room-type-txt').combobox("setValue", room.ROOM_TYPE);
							$('#room-cabinet-count').numberbox("setValue", room.CABINET_COUNT);
							$('#room-desc-txt').textbox("setValue", room.DESCRIPTION);
							$('#room-name-txt').textbox("isValid");
							$('#room-code-txt').textbox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#room-name-txt').textbox("isValid");
							isValid = isValid && $('#room-code-txt').textbox("isValid");
							isValid = isValid && $('#room-type-txt').combobox("getValue");
							if (!isValid) {
								return;
							}

							var newroom = {
								NAME : $('#room-name-txt').textbox("getValue"),
								ROOM_TYPE : parseInt($('#room-type-txt').combobox("getValue"), 10),
								CODE : $('#room-code-txt').textbox("getValue"),
								DESCRIPTION : $('#room-desc-txt').textbox("getValue"),
								CABINET_COUNT : parseInt($('#room-cabinet-count').numberbox("getValue"), 10),
								DEPARTMENT : $("#room-department").combobox("getValue"),
								SAFETY_PERSON : $("#room-safety-person").combobox("getValue"),
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
				};
				$('#configer-dialog').dialog(cfg);
			}
		});
