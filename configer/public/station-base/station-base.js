$(document).ready(
		function() {
			var stationUrl = "/configer/stations";
			$node = $('#station-base-datagrid');
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
				currentObject = object;
				$("#workspace-title").text(currentObject.NAME);
				var toolbar = [];
				var base_parentTypes = [ WUI.objectTypeDef.LSC, WUI.objectTypeDef.REGION ];
				if (base_parentTypes.indexOf(currentObject.OBJECT_TYPE) >= 0) {
					toolbar.push({
						iconCls : WUI.objectTypes[WUI.objectTypeDef.STATION_BASE].iconCls,
						handler : function() {
							stationDialog(null, currentObject.ID);
						}
					});
					toolbar.push('-');
				}
				toolbar.push({
					iconCls : 'icon-reload',
					handler : function() {
						reload(true);
					}
				});
				$node.datagrid({
					toolbar : toolbar
				});
				reload(false);
			});
			$node.datagrid({
				url : stationUrl,
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
							width : 150,
							formatter : function(value, row, index) {
								return WUI.stationTypes[row.STATION_TYPE];
							}
						}, {
							field : 'SEQUENCE',
							title : '序号',
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
			WUI.station = {};
			WUI.station.editrow = function(target) {
				var station = getRowData(target);
				stationDialog(station, station.PARENT_ID);
			}
			WUI.station.deleterow = function(target) {
				var station = $node.datagrid("getRows")[getRowIndex(target)];
				$.messager.confirm('确认', '确定要删除园区【' + station.NAME + '】吗?', function(r) {
					if (r) {
						WUI.ajax.remove(stationUrl + "/" + station.ID, {}, function() {
							reload(true);
						}, function() {
							$.messager.alert('失败', "删除园区失败！");
						});
					}
				});
			}

			function stationDialog(station, parentId) {
				var dialogNode = $('#station-base-dialog');
				dialogNode.dialog({
					iconCls : station ? "icon-edit" : "icon-add",
					title : (station ? "修改" : "添加") + "园区",
					left : ($(window).width() - 300) * 0.5,
					top : ($(window).height() - 300) * 0.5,
					width : 350,
					closed : false,
					cache : false,
					href : '/configer/station-base/station-base-dialog.html',
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
							$('#station-type-txt').val(station.STATION_TYPE);
							$('#station-sequence-txt').val(station.SEQUENCE);
							$('#station-LONGITUDE-txt').val(station.LONGITUDE);
							$('#station-LATITUDE-txt').val(station.LATITUDE);

							$('#station-name-txt').validatebox("isValid");
							$('#station-code-txt').validatebox("isValid");
							$('#station-sequence-txt').validatebox("isValid");
							$('#station-LONGITUDE-txt').validatebox("isValid");
							$('#station-LATITUDE-txt').validatebox("isValid");
						}
					},
					modal : true,
					onClose : function() {
						$('#station-base-dialog').empty();
					},
					buttons : [ {
						text : '保存',
						handler : function() {
							var isValid = $('#station-name-txt').validatebox("isValid");
							isValid = isValid && $('#station-LONGITUDE-txt').validatebox("isValid");
							isValid = isValid && $('#station-LATITUDE-txt').validatebox("isValid");
							isValid = isValid && $('#station-sequence-txt').validatebox("isValid");
							isValid = isValid && $('#station-type-txt').val();
							if (!isValid) {
								return;
							}

							var newStation = {
								NAME : $('#station-name-txt').val(),
								CODE : $('#station-code-txt').val(),
								LONGITUDE : parseFloat($('#station-LONGITUDE-txt').val()),
								STATION_TYPE : parseInt($('#station-type-txt').val(), 10),
								SEQUENCE : parseInt($('#station-sequence-txt').val(), 10),
								LATITUDE : parseFloat($('#station-LATITUDE-txt').val()),
								OBJECT_TYPE : window.WUI.objectTypeDef.STATION_BASE,
								PARENT_ID : parentId
							};

							if (station) {
								newStation.ID = station.ID;
								WUI.ajax.put(stationUrl, newStation, function() {
									dialogNode.dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "修改园区失败！");
								});
							} else {
								WUI.ajax.post(stationUrl, newStation, function() {
									dialogNode.dialog("close");
									reload(true);
								}, function() {
									$.messager.alert('失败', "添加园区失败！");
								});
							}
						}
					}, {
						text : '取消',
						handler : function() {
							dialogNode.dialog("close");
						}
					} ]
				});
			}
		});