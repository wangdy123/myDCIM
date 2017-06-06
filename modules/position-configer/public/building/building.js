$(document).ready(
		function() {
			var objectNodeUrl = 'position-configer/objectNodes';
			var buildingUrl = "position-configer/buildings";
			var $node = $('#building-datagrid');
			var currentObject = null;
			WUI.building = {};

			function reload(publish) {
				$node.datagrid("reload");
				if (publish) {
					WUI.publishEvent('reload_object', {
						publisher : "building-configer",
						object : currentObject
					});
				}
			}

			function openObject(buildingObject) {
				currentObject = buildingObject;
				$node.datagrid({
					url : buildingUrl,
					queryParams : {
						parentId : buildingObject.ID
					},
					fit : true,
					border : false,
					method : "get",
					singleSelect : true,
					onLoadError : WUI.onLoadError,
					toolbar : [ {
						iconCls : 'icon-add',
						handler : function() {
							buildingDialog(null, currentObject.ID);
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
											+ ' onclick="WUI.building.editrow(this)"></div> ';
									var s = '<div class="separater"></div> ';
									var d = '<div class="icon-remove operator-tool" title="删除" '
											+ ' onclick="WUI.building.deleterow(this)"></div>';
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
								field : 'FLOOR_GROUND',
								title : '地上层数',
								width : 100
							}, {
								field : 'FLOOR_UNDERGROUND',
								title : '地下层数',
								width : 100
							} ] ]
				});
			}
			window.WUI.publishEvent('request_current_object', {
				publisher : 'building-configer',
				cbk : function(object) {
					WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(buildingObject) {
						openObject(buildingObject);
					}, function() {
						var typeName = WUI.objectTypes[WUI.objectTypeDef.BUILDDING].name;
						$.messager.alert('失败', "读取" + typeName + "配置失败！");
					});
				}
			});

			WUI.building.editrow = function(target) {
				var building = WUI.getDatagridRow($node, target);
				buildingDialog(building, building.PARENT_ID);
			}
			WUI.building.deleterow = function(target) {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.BUILDDING].name;
				var building = WUI.getDatagridRow($node, target);
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + building.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + building.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', '删除' + typeName + '失败！');
						});
					}
				});
			}
			function buildingDialog(building, parentId) {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.BUILDDING].name;
				$('#configer-dialog').dialog(
						{
							iconCls : building ? "icon-edit" : "icon-add",
							title : (building ? "修改" : "添加") + typeName,
							left : ($(window).width() - 400) * 0.5,
							top : ($(window).height() - 300) * 0.5,
							width : 400,
							closed : false,
							cache : false,
							href : WUI.getConfigerDialogPath(WUI.objectTypes[WUI.objectTypeDef.BUILDDING].namespace),
							onLoadError : function() {
								$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
							},
							onLoad : function() {
								for ( var key in WUI.buildingTypes) {
									$('#building-type-txt').append(
											'<option value="' + key + '">' + WUI.buildingTypes[key] + '</option>');
								}
								if (building) {
									$('#building-name-txt').val(building.NAME);
									$('#building-code-txt').val(building.CODE);
									$('#building-ground-txt').numberbox("setValue", building.FLOOR_GROUND);
									$('#building-underground-txt').numberbox("setValue", building.FLOOR_UNDERGROUND);
									$('#building-desc-txt').textbox("setValue", building.DESCRIPTION);

									$('#building-name-txt').validatebox("isValid");
									$('#building-code-txt').validatebox("isValid");

								}
							},
							modal : true,
							onClose : function() {
								$("#configer-dialog").empty();
							},
							buttons : [ {
								text : '保存',
								handler : function() {
									var isValid = $('#building-name-txt').validatebox("isValid");
									isValid = isValid && $('#building-code-txt').validatebox("isValid");
									isValid = isValid && $('#building-ground-txt').val();
									isValid = isValid && $('#building-underground-txt').val();
									if (!isValid) {
										return;
									}

									var newbuilding = {
										NAME : $('#building-name-txt').val(),
										CODE : $('#building-code-txt').val(),
										FLOOR_GROUND : parseInt($('#building-ground-txt').val(), 10),
										FLOOR_UNDERGROUND : parseInt($('#building-underground-txt').val(), 10),
										OBJECT_TYPE : window.WUI.objectTypeDef.BUILDDING,
										DESCRIPTION : $('#building-desc-txt').textbox("getValue"),
										PARENT_ID : parentId,
										properties : []
									};

									if (building) {
										newbuilding.ID = building.ID;
										WUI.ajax.put(objectNodeUrl + "/" + newbuilding.ID, newbuilding, function() {
											$('#configer-dialog').dialog("close");
											reload(true);
										}, function() {
											$.messager.alert('失败', "修改" + typeName + "失败！");
										});
									} else {
										WUI.ajax.post(objectNodeUrl, newbuilding, function() {
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