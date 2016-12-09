$(function() {
	var regionUrl = "/configer/regions";
	$node = $('#region-datagrid');
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
			if(publish){
				WUI.publishEvent('reload_object',currentObject);
			}
		} else {
			$node.datagrid({
				"data" : []
			});
		}
	}
	WUI.subscribe('open_object', function(object) {
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}
		currentObject = object;
		$("workspace-title").text(currentObject.NAME);
		var toolbar = [];
		var childTypes = WUI.objectTypes[currentObject.OBJECT_TYPE].childTypes;
		for (var index = 0; index < childTypes.length; index++) {
			(function(type) {
				toolbar.push({
					iconCls : WUI.objectTypes[type].iconCls,
					handler : function() {
						regionDialog(null, currentObject.ID, type);
					}
				});
			})(childTypes[index]);
		}
		toolbar.push('-');
		toolbar.push({
			iconCls : 'icon-reload',
			handler : function() {
				reload(true);
			}
		});
		$node.datagrid({
			toolbar : toolbar
		});
	});
	$node.datagrid({
		url : regionUrl,
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
								+ ' onclick="WUI.region.editrow(this)"></div> ';
						var s = '<div class="separater"></div> ';
						var d = '<div class="icon-remove operator-tool" title="删除" '
								+ ' onclick="WUI.region.deleterow(this)"></div>';
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
					title : '维度(度)',
					width : 150
				} ] ]
	});
	WUI.region = {};
	WUI.region.editrow = function(target) {
		var region = getRowData(target);
		regionDialog(region, region.PARENT_ID, region.OBJECT_TYPE);
	}
	WUI.region.deleterow = function(target) {
		var region = $node.datagrid("getRows")[getRowIndex(target)];
		$.messager.confirm('确认', '确定要删除' + WUI.objectTypes[region.OBJECT_TYPE].name + '【' + region.NAME + '】吗?',
				function(r) {
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
		$('#region-dialog').dialog({
			iconCls : region ? "icon-edit" : "icon-add",
			title : (region ? "修改" : "添加") + regionTypeName,
			left : ($(window).width() - 300) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 350,
			closed : false,
			cache : false,
			href : '/configer/region/region-dialog.html',
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
				}
			},
			modal : true,
			onClose : function() {
				$("#region-dialog").empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#region-name-txt').validatebox("isValid");
					isValid = isValid && $('#region-zip-code-txt').validatebox("isValid");
					isValid = isValid && $('#region-ABBREVIATION-txt').validatebox("isValid");
					isValid = isValid && $('#region-LONGITUDE-txt').validatebox("isValid");
					isValid = isValid && $('#region-LATITUDE-txt').validatebox("isValid");
					var LONGITUDE = parseFloat($('#region-LONGITUDE-txt').val());
					if (LONGITUDE > 180) {
						$('#region-LONGITUDE-txt').val(180.0)
						isValid=false;
					}
					if (LONGITUDE < -180) {
						$('#region-LONGITUDE-txt').val(-180.0)
						isValid=false;
					}
					var LATITUDE = parseFloat($('#region-LATITUDE-txt').val());
					if (LATITUDE > 90) {
						$('#region-LATITUDE-txt').val(90.0)
						isValid=false;
					}
					if (LATITUDE < -90) {
						$('#region-LATITUDE-txt').val(-90.0)
						isValid=false;
					}
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
							reload(true);
						}, function() {
							$.messager.alert('失败', "修改" + regionTypeName + "失败！");
						});
					} else {
						WUI.ajax.post(regionUrl, newRegion, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "添加" + regionTypeName + "失败！");
						});
					}
					$('#region-dialog').dialog("close");
				}
			}, {
				text : '取消',
				handler : function() {
					$('#region-dialog').dialog("close");
				}
			} ]
		});
	}
});