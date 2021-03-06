$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes';
			var buildingUrl = "logicobject/buildings";
			var $node = $('#building-datagrid');
			var typeName = WUI.objectTypes[WUI.objectTypeDef.BUILDDING].name;
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
						text : '添加【' + typeName + '】',
						handler : function() {
							buildingDialog(null, currentObject.ID);
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
							}, WUI.pageConfiger.createConfigerColumn("building") ] ]
				});
			}
			window.WUI.publishEvent('request_current_object', {
				publisher : 'building-configer',
				cbk : openObject
			});

			WUI.building.editrow = function(target) {
				var building = WUI.getDatagridRow($node, target);
				buildingDialog(building, building.PARENT_ID);
			};
			WUI.building.editPage = function(target) {
				var nodeObject = WUI.getDatagridRow($node, target);
				WUI.pageConfiger.pageDialog(nodeObject);
			};
			WUI.building.deleterow = function(target) {
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
			};
			function buildingDialog(building, parentId) {
				$('#configer-dialog').dialog(
						{
							iconCls : building ? "icon-edit" : "icon-add",
							title : (building ? "修改" : "添加") + typeName,
							left : ($(window).width() - 400) * 0.5,
							top : ($(window).height() - 300) * 0.5,
							width : 500,
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
								$('#building-type-txt').combobox({
									editable : false,
									required : true
								});
								if (building) {
									$('#building-name-txt').textbox("setValue",building.NAME);
									$('#building-code-txt').textbox("setValue",building.CODE);
									$('#building-ground-txt').numberbox("setValue", building.FLOOR_GROUND);
									$('#building-underground-txt').numberbox("setValue", building.FLOOR_UNDERGROUND);
									$('#building-desc-txt').textbox("setValue", building.DESCRIPTION);

									$('#building-name-txt').textbox("isValid");
									$('#building-code-txt').textbox("isValid");

								}
							},
							modal : true,
							onClose : function() {
								$("#configer-dialog").empty();
							},
							buttons : [ {
								text : '保存',
								handler : function() {
									var isValid = $('#building-name-txt').textbox("isValid");
									isValid = isValid && $('#building-code-txt').textbox("isValid");
									isValid = isValid && $('#building-ground-txt').numberbox("isValid");
									isValid = isValid && $('#building-underground-txt').numberbox("isValid");
									if (!isValid) {
										return;
									}

									var newbuilding = {
										NAME : $('#building-name-txt').textbox("getValue"),
										CODE : $('#building-code-txt').textbox("getValue"),
										FLOOR_GROUND : parseInt($('#building-ground-txt').numberbox("getValue"), 10),
										FLOOR_UNDERGROUND : parseInt($('#building-underground-txt').numberbox("getValue"), 10),
										OBJECT_TYPE : window.WUI.objectTypeDef.BUILDDING,
										DESCRIPTION : $('#building-desc-txt').textbox("getValue"),
										PARENT_ID : parentId,
										params : {}
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
