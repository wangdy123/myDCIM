WUI.pageConfiger = WUI.pageConfiger || {};
WUI.pageConfiger.pageDialog = function(nodeObject) {
	var pageConfigUrl = 'detail/pageConfig/';
	var pageTamplateUrl = 'detail/pageTamplate/';
	var $dialog = $('#page-configer-dialog');
	var oldConfig = null;
	var top = ($(window).height() - 600) * 0.5;
	var cfg = {
		title : "显示页面配置",
		left : ($(window).width() - 400) * 0.5,
		top : top > 0 ? top : 100,
		width : 650,
		closed : false,
		cache : false,
		href : "detail/page-configer-dialog.html",
		onLoadError : function() {
			$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
		},
		onLoad : function() {
			$('#node-page-sel').combobox({
				url : "detail/detailPage",
				queryParams : {
					objectType : nodeObject.OBJECT_TYPE,
					deviceType : nodeObject.DEVICE_TYPE
				},
				editable : false,
				keyHandler : {
					down : function(e) {
						$('#node-page-sel').combobox("showPanel");
					}
				},
				method : 'get',
				valueField : 'pageName',
				textField : 'name',
				onLoadSuccess : function() {
					if (oldConfig) {
						$('#node-page-sel').combobox("setValue", oldConfig.PAGE_NAME);
					}
				},
				onSelect : function(rec) {
					$('#page-configer-panel').panel({
						href : 'detail/page/' + rec.pageName + '/configer.html',
						onLoad : function() {
							function loadPageConfiger(pageConfig) {
								WUI.pageConfiger.init(nodeObject, pageConfig);
								$dialog.dialog("resize", {
									width : 650,
									height : $('#page-configer-panel').parent().height() + 120
								});
							}
							if (!oldConfig || !oldConfig.CONFIG) {
								WUI.ajax.get(pageTamplateUrl + rec.pageName, {}, function(result) {
									loadPageConfiger(result);
								}, function() {
									loadPageConfiger(null);
								});
							} else {
								loadPageConfiger(oldConfig.CONFIG);
							}
						}
					});
				}
			});
		},
		modal : true,
		onClose : function() {
			$dialog.empty();
		},
		buttons : [ {
			text : '设为模板',
			handler : function() {
				var isValid = $('#node-page-sel').combobox("getValue");
				isValid = isValid && WUI.pageConfiger.pageConfigIsValid();
				if (!isValid) {
					return;
				}

				var config = {
					PAGE_NAME : $('#node-page-sel').combobox("getValue"),
					CONFIG : WUI.pageConfiger.getConfiger()
				};

				WUI.ajax.put(pageTamplateUrl + config.PAGE_NAME, config.CONFIG, function() {
					$.messager.alert('成功', "模板保存成功！");
				}, function() {
					$.messager.alert('失败', "模板保存失败！");
				});
			}
		}, {
			text : '保存',
			handler : function() {
				var isValid = $('#node-page-sel').combobox("getValue");
				isValid = isValid && WUI.pageConfiger.pageConfigIsValid();
				if (!isValid) {
					return;
				}

				var config = {
					PAGE_NAME : $('#node-page-sel').combobox("getValue"),
					CONFIG : JSON.stringify(WUI.pageConfiger.getConfiger())
				};

				WUI.ajax.put(pageConfigUrl + nodeObject.ID, config, function() {
					$dialog.dialog("close");
					$.messager.alert('成功', "页面配置保存成功！");
				}, function() {
					$.messager.alert('失败', "修改页面配置失败！");
				});
			}
		}, {
			text : '取消',
			handler : function() {
				$dialog.dialog("close");
			}
		} ]
	};
	WUI.ajax.get(pageConfigUrl + nodeObject.ID, {}, function(result) {
		oldConfig = result;
		$dialog.dialog(cfg);
	}, function() {
		$dialog.dialog(cfg);
	});
};

WUI.pageConfiger.createConfigerColumn = function(namespace) {
	return {
		field : 'edit-page',
		title : '配置页面',
		width : 100,
		align : 'center',
		formatter : function(value, row, index) {
			var e = '<a id="btn" href="#" class="easyui-linkbutton" onclick="WUI.' + namespace
					+ '.editPage(this)">配置</a>';
			return e;
		}
	};
};

WUI.pageConfiger.selectImg = function($node, objectType, deviceType, callback) {
	var imgUrl = 'detail/resources';
	var cfg = {
		title : "选择图片",
		left : ($(window).width() - 700) * 0.5,
		top : ($(window).height() - 400) * 0.5,
		width : 680,
		height : 450,
		closed : false,
		cache : false,
		href : 'detail/img-select-dialog.html',
		onLoadError : function() {
			$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
		},
		onLoad : function() {
			var uploader = WebUploader.create({
				auto : true,
				formData : {
					objectType : objectType,
					deviceType : deviceType
				},
				server : imgUrl,
				pick : "#upload-img-btn",
				accept : {
					title : 'Images',
					extensions : 'gif,jpg,jpeg,bmp,png',
					mimeTypes : 'image/*'
				},
				method : 'POST',
			});

			uploader.on('uploadProgress', function(file, percentage) {
				var $li = $('#' + file.id), $percent = $li.find('.progress span');
				if (!$percent.length) {
					$percent = $('<p class="progress"><span></span></p>').appendTo($li).find('span');
				}
				$percent.css('width', percentage * 100 + '%');
			});

			uploader.on('uploadComplete', function(file) {
				uploader.reset();
				$('#' + file.id).find('.progress').remove();
				reloadImgs();
			});
			function reloadImgs() {
				$("#img-list-panel").empty();
				WUI.ajax.get(imgUrl, {
					objectType : objectType,
					deviceType : deviceType
				}, function(imgs) {
					imgs.forEach(addImg);
				}, function(s) {
					$.messager.alert('失败', "查询图片资源失败！");
				});
			}
			function addImg(fileName) {
				var $div = $(document.createElement("div"));
				$("#img-list-panel").append($div);
				$div.css("display", "inline-block");
				$div.css("margin", "5px");
				// $div.css("text-align", "center");
				var $div1 = $(document.createElement("div"));
				var $img = $(document.createElement("img"));
				$div.append($div1);
				$div1.append($img);
				$img.css("width", "150px");
				$img.css("height", "120px");
				$img.attr("src", imgUrl + "/" + fileName);
				$img.addClass("img-items");
				$img.click(function() {
					$(".img-items").removeClass("img-selected");
					$img.addClass("img-selected");
				});
				$img.dblclick(function() {
					callback(fileName);
					$node.dialog("close");
				});
				var $deleteBtn = $(document.createElement("div"));
				$deleteBtn.addClass("icon-delete");
				$deleteBtn.addClass("operator-tool");
				$deleteBtn.css("position", "relative");
				$deleteBtn.css("top", "-120px");
				$deleteBtn.css("left", "125px");
				$div.append($deleteBtn);

				$deleteBtn.click(function() {
					WUI.ajax.remove(imgUrl + "/" + fileName, {}, function() {
						reloadImgs();
					}, function() {
						$.messager.alert('失败', "删除图片失败！");
					});
				});
			}
			reloadImgs();
		},
		modal : true,
		onClose : function() {
			$node.empty();
		},
		buttons : [ {
			text : '确定',
			handler : function() {
				var $selected = $("#img-list-panel").find(".img-selected");
				if ($selected.length !== 1) {
					$.messager.alert('失败', "请选择图片！");
					return;
				}
				var fileName = $selected.attr("src").substr((imgUrl + "/").length);
				callback(fileName);
				$node.dialog("close");
			}
		}, {
			text : '取消',
			handler : function() {
				$node.dialog("close");
			}
		} ]
	};
	$node.dialog(cfg);
};
