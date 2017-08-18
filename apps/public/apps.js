$(function() {
	var selfDiagnosisUrl = 'selfDiagnosis';

	var currentLogicObject = null;

	WUI.subscribe('request_current_object', function(event) {
		event.cbk(currentLogicObject);
	}, "apps");

	WUI.subscribe('open_object', function(event) {
		if (currentLogicObject && currentLogicObject.ID === event.object.ID) {
			return;
		}
		currentLogicObject = event.object;
		$.cookie('currentObjectId', event.object.ID);
	}, "apps");

	var isFullScreen = false;
	$("#fullscreem-btn").click(function() {
		var target = $("body");
		if (isFullScreen) {
			isFullScreen = false;
			WUI.exitFullscreen();
		} else {
			isFullScreen = true;
			WUI.fullscreen(target[0]);
		}
	});

	// $('#qrcode-panel').tooltip({
	// content : '<div id="qrcode" ></div>',
	// onShow : function() {
	// $('#qrcode').empty();
	// $('#qrcode').qrcode({
	// render : "table",
	// width : 100,
	// height : 100,
	// text : window.location.href
	// });
	// }
	// });
	var passwordUrl = "setPassword";
	$("#change-password-btn").click(function() {
		$('#change-password-dialog').dialog({
			iconCls : "icon-key",
			title : "修改当前用户口令",
			left : ($(window).width() - 300) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 350,
			closed : false,
			cache : false,
			href : 'paaasord-dialog.html',
			onLoad : function() {
				$('#account-password').textbox({
					required : true,
					validType : 'password'
				});
				$('#account-password-confirm').textbox({
					required : true,
					validType : "equalTo['#account-password']",
					invalidMessage : "两次输入密码不匹配"
				});
			},
			modal : true,
			onClose : function() {
				$("#change-password-dialog").empty();
			},
			buttons : [ {
				text : '保存',
				handler : function() {
					var isValid = $('#account-password').textbox("isValid");
					isValid = isValid && $('#account-password-confirm').textbox("isValid");
					if ($('#account-password').val() !== $('#account-password-confirm').val()) {
						isValid = false;
					}
					if (!isValid) {
						return;
					}

					var password = {
						OLD_PASSWORD : $('#old-password').val(),
						NEW_PASSWORD : $('#account-password').val()
					};
					WUI.ajax.put(passwordUrl, password, function() {
						$.messager.alert('成功', "修改密码成功！");
						$('#change-password-dialog').dialog("close");
					}, function() {
						$.messager.alert('失败', "修改密码失败！");
					});
				}
			}, {
				text : '取消',
				handler : function() {
					$('#change-password-dialog').dialog("close");
				}
			} ]
		});
	});
	$("#current-user-panel").click(function() {
		var currentAccountUrl = "currentAccount";
		var themesUrl = "account/themes";
		WUI.ajax.get(currentAccountUrl, {}, function(account) {
			$('#change-password-dialog').dialog({
				iconCls : "icon-man",
				title : "修改当前用户信息",
				left : ($(window).width() - 300) * 0.5,
				top : ($(window).height() - 300) * 0.5,
				width : 380,
				closed : false,
				cache : false,
				href : 'account-detal-dialog.html',
				onLoad : function() {
					var menus = [];
					for (var i = 0; i < WUI.menus.length; i++) {
						var childMenus = WUI.menus[i].childMenus;
						for (var j = 0; j < childMenus.length; j++) {
							childMenus[j].group = WUI.menus[i].name;
							menus.push(childMenus[j]);
						}
					}
					$('#account-home-page').combobox({
						valueField : 'id',
						textField : 'name',
						groupField : "group",
						singleSelect : true,
						editable : false,
						data : menus
					});
					$('#account-theme').combobox({
						url : themesUrl,
						method : 'get',
						valueField : 'type',
						textField : 'name',
						onLoadSuccess : function() {
							$('#account-theme').combobox("setValue", account.DEFAULT_THEME);
						}
					});
					$('#account-department-txt').text(account.DEPARTMENT_NAME);
					$('#account-personnel-txt').text(account.NAME);
					$('#account-txt').text(account.ACCOUNT);
					if (account.IS_GOD) {
						$('#account-role').text("超级用户");
					} else {
						roles
						var roles = [];
						account.roles.forEach(function(role) {
							roles.push(role.NAME);
						});
						$('#account-role').text(roles.join('，'));
					}
					$('#account-theme').combobox("setValue", account.DEFAULT_THEME);
					$('#account-home-page').combobox("setValue", account.HOME_PAGE);
					$('#personnel-number-txt').textbox("setValue", account.JOB_NUMBER);
					$('#personnel-email-txt').textbox("setValue", account.E_MAIL);
					$('#personnel-tel-txt').textbox("setValue", account.TEL);
					$('#personnel-number-txt').textbox("isValid");
					$('#personnel-email-txt').textbox("isValid");
					$('#personnel-tel-txt').textbox("isValid");
				},
				modal : true,
				onClose : function() {
					$("#change-password-dialog").empty();
				},
				buttons : [ {
					text : '保存',
					handler : function() {
						var isValid = $("#account-theme").combobox("isValid");
						isValid = isValid && $("#account-home-page").combobox("isValid");
						isValid = isValid && $("#personnel-email-txt").textbox("isValid");
						isValid = isValid && $("#personnel-tel-txt").textbox("isValid");
						isValid = isValid && $("#personnel-number-txt").textbox("isValid");
						if (!isValid) {
							return;
						}

						var currentAccount = {
							DEFAULT_THEME : $('#account-theme').combobox("getValue"),
							HOME_PAGE : $('#account-home-page').combobox("getValue"),
							JOB_NUMBER : $('#personnel-number-txt').textbox("getValue"),
							E_MAIL : $('#personnel-email-txt').textbox("getValue"),
							TEL : $('#personnel-tel-txt').textbox("getValue")
						};
						WUI.ajax.put(currentAccountUrl, currentAccount, function() {
							$.messager.alert('成功', "修改成功！");
							$('#change-password-dialog').dialog("close");
							location.reload();
						}, function() {
							$.messager.alert('失败', "修改失败！");
						});
					}
				}, {
					text : '取消',
					handler : function() {
						$('#change-password-dialog').dialog("close");
					}
				} ]
			});
		});
	});

	function selfDiagnosis() {
		if (WUI.selfDiagnosisTimer) {
			clearTimeout(WUI.selfDiagnosisTimer);
			WUI.selfDiagnosisTimer = null;
		}
		WUI.ajax.get(selfDiagnosisUrl, {}, function(status) {
			WUI.selfDiagnosisTimer = setTimeout(selfDiagnosis, WUI.requestInteval.selfDiagnosis);
			if (status.length > 0) {
				$("#self-diagnosis-content").html(status.join(',') + '，请联系系统管理员。');
				$('#self-diagnosis-tooltip').dialog('open');
			} else {
				$('#self-diagnosis-tooltip').dialog('close');
			}
		}, function() {
			WUI.selfDiagnosisTimer = setTimeout(selfDiagnosis, WUI.requestInteval.selfDiagnosis);
			$("#self-diagnosis-content").html('web服务器通讯异常，请联系系统管理员。');
			$('#self-diagnosis-tooltip').dialog('open');
		});
	}

	selfDiagnosis();

	function requestLatestAlarm() {
		if (WUI.alarmStatusTimer) {
			clearTimeout(WUI.alarmStatusTimer);
			WUI.alarmStatusTimer = null;
		}
		WUI.ajax.get("latestAlarm", {}, function(status) {
			WUI.alarmStatusTimer = setTimeout(selfDiagnosis, WUI.requestInteval.realtimeValue);
			if (status.length > 0) {
				$("#self-diagnosis-content").html(status.join(',') + '，请联系系统管理员。');
				$('#self-diagnosis-tooltip').dialog('open');
			} else {
				$('#self-diagnosis-tooltip').dialog('close');
			}
		}, function() {
			WUI.alarmStatusTimer = setTimeout(selfDiagnosis, WUI.requestInteval.realtimeValue);
			$("#self-diagnosis-content").html('web服务器通讯异常，请联系系统管理员。');
			$('#self-diagnosis-tooltip').dialog('open');
		});
	}
	
	$("#alarm-count-status").click(showAlarmTooltip);
	$('#sound-icon').click(function() {
		setShoundmuted(!isShoundmuted());
	});

	var $soundBox = $("#sound-box");
	var global_shoundFile = $.cookie('shoundFile');
	var shound_muted = isShoundmuted();

	if (!$soundBox) {
		$soundBox = $(document.createElement("div"));
		$("body").append($soundBox);
	}

	function setShoundmuted(muted) {
		shound_muted = muted;
		if (muted) {
			$('#sound-icon').attr("src", "/images/Sound_off.png");
			$.cookie('shoundmuted', 1);
		} else {
			$('#sound-icon').attr("src", "/images/Sound_on.png");
			$.removeCookie('shoundmuted', null);
		}
	}

	function isShoundmuted() {
		return $.cookie('shoundmuted');
	}

	setShoundmuted(isShoundmuted());

	function setSound(shoundFile) {
		if (global_shoundFile && !shound_muted) {
			$soundBox.html('<audio autoplay loop><source src="/image' + global_shoundFile
					+ '" type="audio/wav" /></audio>');
		} else {
			$soundBox.empty();
		}
	}

	var maxalarmLevel = 0;
	function setSoundFile() {
		var shoundFile = null;
		if (maxalarmLevel > 0) {
			shoundFile = "/level" + maxalarmLevel + ".wav";
		} else {
			shoundFile = null;
		}
		if (global_shoundFile === shoundFile) {
			return;
		}
		global_shoundFile = shoundFile;
		if (shoundFile) {
			$.cookie('shoundFile', shoundFile);
		} else {
			$.removeCookie('shoundFile', null);
		}
		setSound();
	}

	function showAlarmTooltip() {
		var $dialogNode = $('#alarm-tooltip');
		$dialogNode.dialog({
			iconCls : "icon-alarm",
			title : "告警统计",
			left : $(window).width() - 200,
			top : $(window).height() - 220,
			width : 200,
			closed : false,
			cache : false,
			href : 'alarm-status-dialog.html',
			onLoad : function() {

			},
			modal : false,
			onClose : function() {
				$dialogNode.empty();
			}
		});
	}
});
