$(document).ready(
		function() {
			var buildingUrl = WUI.urlPath + "/configer/buildings";
			var $node = $('#building-datagrid');
			var currentObject = null;
			WUI.building = {};

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
						} ]
					});

					$node.datagrid({
						url : buildingUrl,
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
									width : 150
								}, {
									field : 'FLOOR_UNDERGROUND',
									title : '地下层数',
									width : 150
								} ] ]
					});
				}
			});
			function getRowIndex(target) {
				var tr = $(target).closest('tr.datagrid-row');
				return parseInt(tr.attr('datagrid-row-index'));
			}

			WUI.building.editrow = function(target) {
				var building = $node.datagrid("getRows")[getRowIndex(target)];
				buildingDialog(building, building.PARENT_ID);
			}
			WUI.building.deleterow = function(target) {
				var building = $node.datagrid("getRows")[getRowIndex(target)];
				$.messager.confirm('确认', '确定要删除机楼【' + building.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(buildingUrl + "/" + building.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除机楼失败！");
						});
					}
				});
			}

			function buildingDialog(building, parentId) {
				$('#configer-dialog').dialog({
					iconCls : building ? "icon-edit" : "icon-add",
					title : (building ? "修改" : "添加") + "机楼",
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 350,
					closed : false,
					cache : false,
					href : '/configer/object/building/building-dialog.html',
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						if (building) {
							$('#building-name-txt').val(building.NAME);
							$('#building-code-txt').val(building.CODE);
							$('#building-ground-txt').val(building.FLOOR_GROUND);
							$('#building-underground-txt').val(building.FLOOR_UNDERGROUND);
							$('#building-name-txt').validatebox("isValid");
							$('#building-code-txt').validatebox("isValid");
							$('#building-ground-txt').validatebox("isValid");
							$('#building-underground-txt').validatebox("isValid");
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
							isValid = isValid && $('#building-ground-txt').validatebox("isValid");
							isValid = isValid && $('#building-underground-txt').validatebox("isValid");

							if (!isValid) {
								return;
							}

							var newbuilding = {
								NAME : $('#building-name-txt').val(),
								CODE : $('#building-code-txt').val(),
								FLOOR_GROUND : parseFloat($('#building-ground-txt').val()),
								FLOOR_UNDERGROUND : parseFloat($('#building-underground-txt').val()),
								OBJECT_TYPE : WUI.objectTypeDef.BUILDDING,
								PARENT_ID : parentId
							};

							if (building) {
								newbuilding.ID = building.ID;
								WUI.ajax.put(buildingUrl, newbuilding, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改机楼失败！");
								});
							} else {
								WUI.ajax.post(buildingUrl, newbuilding, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "添加机楼失败！");
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