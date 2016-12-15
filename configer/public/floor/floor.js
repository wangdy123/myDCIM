$(document).ready(
		function() {
			var floorUrl = "/configer/floors";
			var buildingUrl = "/configer/buildings";

			var $node = $('#floor-datagrid');
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
					if (publish) {
						WUI.publishEvent('reload_object', currentObject);
					}
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
				if (object.OBJECT_TYPE !== WUI.objectTypeDef.BUILDDING) {
					return;
				}
				currentObject = object;
				$("#workspace-title").text(currentObject.NAME);

				$node.datagrid({
					toolbar : [ {
						iconCls : WUI.objectTypes[window.WUI.objectTypeDef.FLOOR].iconCls,
						handler : function() {
							floorDialog(null, currentObject.ID);
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
				url : floorUrl,
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
							title : '名称',
							width : 150
						}, {
							field : 'IS_ROOFTOP',
							title : '是否天台',
							width : 150,
							formatter : function(value, row, index) {
								return row.IS_ROOFTOP ? "是" : "否";
							}
						} ] ]
			});
			WUI.floor = {};
			WUI.floor.editrow = function(target) {
				var floor = getRowData(target);
				floorDialog(floor, floor.PARENT_ID);
			}
			WUI.floor.deleterow = function(target) {
				var floor = $node.datagrid("getRows")[getRowIndex(target)];
				$.messager.confirm('确认', '确定要删除楼层【' + floor.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(floorUrl + "/" + floor.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除楼层失败！");
						});
					}
				});
			}

			function floorDialog(floor, parentId) {
				WUI.ajax.get(buildingUrl + "/" + parentId, {}, function(building) {
					var cfg = {
						iconCls : floor ? "icon-edit" : "icon-add",
						title : (floor ? "修改" : "添加") + "楼层",
						left : ($(window).width() - 300) * 0.5,
						top : ($(window).height() - 300) * 0.5,
						width : 350,
						closed : false,
						cache : false,
						href : '/configer/floor/floor-dialog.html',
						onLoadError : function() {
							$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
						},
						onLoad : function() {
							for (var i = 1; i <= building.FLOOR_GROUND; i++) {
								$('#floor-sel').append(
										'<option value="' + i + '">' + WUI.makeFloorName(i, false) + '</option>');
							}
							for (var j = 1; j <= building.FLOOR_UNDERGROUND; j++) {
								$('#floor-sel').append(
										'<option value="' + (0 - j) + '">' + WUI.makeFloorName(j, true) + '</option>');
							}
							if (floor) {
								$('#floor-sel').val(floor.CODE);
								$('#is-rooftop-ck').prop('checked', floor.IS_ROOFTOP);
							}
						},
						modal : true,
						onClose : function() {
							$("#floor-dialog").empty();
						},
						buttons : [ {
							text : '保存',
							handler : function() {
								var isValid = $('#floor-sel').val();
								if (!isValid) {
									return;
								}
								var checked = $('#is-rooftop-ck').prop('checked');
								var newfloor = {
									NAME : $('#floor-sel option:selected').text(),
									CODE : $('#floor-sel').val(),
									IS_ROOFTOP : $('#is-rooftop-ck').prop('checked') ? true : false,
									OBJECT_TYPE : WUI.objectTypeDef.FLOOR,
									PARENT_ID : parentId
								};

								if (floor) {
									newfloor.ID = floor.ID;
									WUI.ajax.put(floorUrl, newfloor, function() {
										$('#floor-dialog').dialog("close");
										reload(true);
									}, function() {
										$.messager.alert('失败', "修改楼层失败！");
									});
								} else {
									WUI.ajax.post(floorUrl, newfloor, function() {
										$('#floor-dialog').dialog("close");
										reload(true);
									}, function() {
										$.messager.alert('失败', "添加楼层失败！");
									});
								}

							}
						}, {
							text : '取消',
							handler : function() {
								$('#floor-dialog').dialog("close");
							}
						} ]
					};
					$('#floor-dialog').dialog(cfg);
				}, function() {
					$.messager.alert('失败', "获取机楼失败！");
				});
			}
		});