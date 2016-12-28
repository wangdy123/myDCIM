$(document).ready(
		function() {
			var regionUrl = WUI.urlPath + "/configer/regions";
			var $node = $('#lsc-datagrid');
			var currentObject = null;

			WUI.lsc = WUI.lsc || {};

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
						url : regionUrl,
						queryParams : {
							parentId : currentObject.ID
						},
						fit : true,
						border : false,
						method : "get",
						singleSelect : true,
						onLoadError : function(s) {
							$.messager.alert('失败', "加载失败");
						},
						toolbar : [ {
							iconCls : 'icon-add',
							handler : function() {
								regionDialog(null, currentObject.ID, WUI.objectTypeDef.LSC);
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
												+ ' onclick="WUI.lsc.editrow(this)"></div> ';
										var s = '<div class="separater"></div> ';
										var d = '<div class="icon-remove operator-tool" title="删除" '
												+ ' onclick="WUI.lsc.deleterow(this)"></div>';
										return e + s + d;
									}
								}, {
									field : 'ZIP_CODE',
									title : '行政编码',
									align : 'right',
									width : 80
								}, {
									field : 'NAME',
									title : '名称',
									width : 150
								}, {
									field : 'ABBREVIATION',
									title : '简称',
									width : 150
								}, {
									field : 'LONGITUDE',
									title : '经度(度)',
									width : 150
								}, {
									field : 'LATITUDE',
									title : '纬度(度)',
									width : 150
								} ] ]
					});
				}
			});
			function getRowIndex(target) {
				var tr = $(target).closest('tr.datagrid-row');
				return parseInt(tr.attr('datagrid-row-index'));
			}

			WUI.lsc.editrow = function(target) {
				var region = $node.datagrid("getRows")[getRowIndex(target)];
				regionDialog(region, region.PARENT_ID, region.OBJECT_TYPE);
			}
			WUI.lsc.deleterow = function(target) {
				var region = $node.datagrid("getRows")[getRowIndex(target)];
				$.messager.confirm('确认',
						'确定要删除' + WUI.objectTypes[region.OBJECT_TYPE].name + '【' + region.NAME + '】吗?', function(r) {
							if (r) {
								WUI.ajax.remove(regionUrl + "/" + region.ID, {}, function() {
									reload(true);
								}, function() {
									$.messager.alert('失败', "删除" + WUI.objectTypes[region.OBJECT_TYPE].name + "失败！");
								});
							}
						});
			}
			function regionDialog(region, parentId, objectType) {
				var regionTypeName = WUI.objectTypes[objectType].name;
				$('#configer-dialog').dialog({
					iconCls : region ? "icon-edit" : "icon-add",
					title : (region ? "修改" : "添加") + regionTypeName,
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 350,
					closed : false,
					cache : false,
					href : '/configer/object/lsc/lsc-dialog.html',
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						if (region) {
							$('#region-name-txt').val(region.NAME);
							$('#region-zip-code-txt').val(region.ZIP_CODE);
							$('#region-ABBREVIATION-txt').val(region.ABBREVIATION);
							$('#region-LONGITUDE-txt').val(region.LONGITUDE);
							$('#region-LATITUDE-txt').val(region.LATITUDE);
							$('#region-name-txt').validatebox("isValid");
							$('#region-zip-code-txt').validatebox("isValid");
							$('#region-ABBREVIATION-txt').validatebox("isValid");
							$('#region-LONGITUDE-txt').validatebox("isValid");
							$('#region-LATITUDE-txt').validatebox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#region-name-txt').validatebox("isValid");
							isValid = isValid && $('#region-zip-code-txt').validatebox("isValid");
							isValid = isValid && $('#region-ABBREVIATION-txt').validatebox("isValid");
							isValid = isValid && $('#region-LONGITUDE-txt').validatebox("isValid");
							isValid = isValid && $('#region-LATITUDE-txt').validatebox("isValid");
							if (!isValid) {
								return;
							}

							var newRegion = {
								NAME : $('#region-name-txt').val(),
								ABBREVIATION : $('#region-ABBREVIATION-txt').val(),
								ZIP_CODE : $('#region-zip-code-txt').val(),
								LONGITUDE : parseFloat($('#region-LONGITUDE-txt').val()),
								LATITUDE : parseFloat($('#region-LATITUDE-txt').val()),
								OBJECT_TYPE : objectType,
								PARENT_ID : parentId
							};

							if (region) {
								newRegion.ID = region.ID;
								WUI.ajax.put(regionUrl, newRegion, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + regionTypeName + "失败！");
								});
							} else {
								WUI.ajax.post(regionUrl, newRegion, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "添加" + regionTypeName + "失败！");
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