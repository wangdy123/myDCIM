$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes';
			var stationUrl = "logicobject/stations";
			var $node = $('#station-datagrid');
			var typeName = WUI.objectTypes[WUI.objectTypeDef.STATION_BASE].name;

			WUI.station = WUI.station || {};

			var currentObject = null;
			function reload(publish) {
				$node.datagrid("reload");
				if (publish) {
					WUI.publishEvent('reload_object', {
						publisher : "station-configer",
						object : currentObject
					});
				}
			}

			function openObject(stationObject) {
				currentObject = stationObject;
				$node.datagrid({
					url : stationUrl,
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
							stationDialog(null, currentObject);
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
											+ ' onclick="WUI.station.editrow(this)"></div> ';
									var s = '<div class="separater"></div> ';
									var d = '<div class="icon-remove operator-tool" title="删除" '
											+ ' onclick="WUI.station.deleterow(this)"></div>';
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
								field : 'STATION_TYPE',
								title : '园区类型',
								width : 100,
								formatter : function(value, row, index) {
									return WUI.stationTypes[row.STATION_TYPE];
								}
							}, {
								field : 'AREA',
								title : '占地面积(m²)',
								width : 100
							}, {
								field : 'LONGITUDE',
								title : '经度(度)',
								width : 100,
								formatter : function(value, row, index) {
									return row.LONGITUDE.toFixed(6);
								}
							}, {
								field : 'LATITUDE',
								title : '纬度(度)',
								width : 100,
								formatter : function(value, row, index) {
									return row.LATITUDE.toFixed(6);
								}
							}, {
								field : 'ADDRESS',
								title : '详细地址',
								width : 200
							} ] ]
				});
			}
			window.WUI.publishEvent('request_current_object', {
				publisher : 'station-configer',
				cbk : openObject
			});

			WUI.station.editrow = function(target) {
				var station = WUI.getDatagridRow($node, target);
				stationDialog(station, currentObject);
			}
			WUI.station.deleterow = function(target) {
				var station = WUI.getDatagridRow($node, target);
				$.messager.confirm('确认', '确定要删除' + typeName + '【' + station.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(objectNodeUrl + "/" + station.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', '删除' + typeName + '失败！');
						});
					}
				});
			}
			function stationDialog(station, parentObject) {
				var cfg = {
					iconCls : station ? "icon-edit" : "icon-add",
					title : (station ? "修改" : "添加") + typeName,
					left : ($(window).width() - 500) * 0.5,
					top : ($(window).height() - 400) * 0.5,
					width : 500,
					closed : false,
					cache : false,
					href : WUI.getConfigerDialogPath(WUI.objectTypes[WUI.objectTypeDef.STATION_BASE].namespace),
					onLoadError : function() {
						$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
					},
					onLoad : function() {
						for ( var key in WUI.stationTypes) {
							$('#station-type-txt').append(
									'<option value="' + key + '">' + WUI.stationTypes[key] + '</option>');
						}
						if (station) {
							$('#station-name-txt').val(station.NAME);
							$('#station-code-txt').val(station.CODE);
							$('#station-LONGITUDE-txt').numberbox("setValue", station.LONGITUDE);
							$('#station-LATITUDE-txt').numberbox("setValue", station.LATITUDE);
							$('#station-AREA-txt').numberbox("setValue", station.AREA);
							$('#station-address-txt').textbox("setValue", station.ADDRESS);
							$('#station-desc-txt').textbox("setValue", station.DESCRIPTION);
							$('#station-type-txt').val(station.STATION_TYPE);

							$('#station-name-txt').validatebox("isValid");
							$('#station-code-txt').validatebox("isValid");

						} else {
							$('#station-LONGITUDE-txt').numberbox("setValue", parentObject.LONGITUDE);
							$('#station-LATITUDE-txt').numberbox("setValue", parentObject.LATITUDE);
						}
					},
					modal : true,
					onClose : function() {
						$("#configer-dialog").empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#station-name-txt').validatebox("isValid");
							isValid = isValid && $('#station-code-txt').validatebox("isValid");
							isValid = isValid && $('#station-type-txt').val();
							if (!isValid) {
								return;
							}

							var newstation = {
								NAME : $('#station-name-txt').val(),
								CODE : $('#station-code-txt').val(),
								LONGITUDE : parseFloat($('#station-LONGITUDE-txt').val()),
								LATITUDE : parseFloat($('#station-LATITUDE-txt').val()),
								AREA : parseInt($('#station-AREA-txt').val(), 10),
								STATION_TYPE : parseInt($('#station-type-txt').val(), 10),
								OBJECT_TYPE : window.WUI.objectTypeDef.STATION_BASE,
								ADDRESS : $('#station-address-txt').val(),
								DESCRIPTION : $('#station-desc-txt').textbox("getValue"),
								PARENT_ID : parentObject.ID,
								properties : []
							};

							if (station) {
								newstation.ID = station.ID;
								WUI.ajax.put(objectNodeUrl + "/" + newstation.ID, newstation, function() {
									$('#configer-dialog').dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改" + typeName + "失败！");
								});
							} else {
								WUI.ajax.post(objectNodeUrl, newstation, function() {
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
