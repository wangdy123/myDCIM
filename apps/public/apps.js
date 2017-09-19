$(function() {
	var selfDiagnosisUrl = 'selfDiagnosis';
	var objectNodeUrl = 'logicobject/objectNodes/';

	var currentLogicObject = null;

	$("sys-workspace").panel({
		onLoadError : function(err) {
			location.reload();
		}
	});
	WUI.subscribe('request_current_object', function(event) {
		if (!currentLogicObject) {
			WUI.ajax.get(objectNodeUrl + WUI.root_object_id,{}, function(object) {
				event.cbk(object);
				currentLogicObject = object;
			});
		} else {
			event.cbk(currentLogicObject);
		}
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
			top : ($(window).height() - 400) * 0.5,
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
				left : ($(window).width() - 500) * 0.5,
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

	var $selfDiagnosisSoundBox = $(document.createElement("div"));
	$("body").append($selfDiagnosisSoundBox);

	function beginSelfDiagnosisSound() {
		var selfDiagnosisMuted = $.cookie('selfDiagnosisMuted');
		if (!selfDiagnosisMuted && $selfDiagnosisSoundBox.children().length < 1) {
			$selfDiagnosisSoundBox.html('<audio autoplay loop><source src="/sounds/off-line.wav'
					+ '" type="audio/wav" /></audio>');
		}
	}
	function endSelfDiagnosisSound() {
		$selfDiagnosisSoundBox.empty();
	}
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
				beginSelfDiagnosisSound();
			} else {
				$('#self-diagnosis-tooltip').dialog('close');
				endSelfDiagnosisSound();
			}
		}, function() {
			WUI.selfDiagnosisTimer = setTimeout(selfDiagnosis, WUI.requestInteval.selfDiagnosis);
			$("#self-diagnosis-content").html('web服务器通讯异常，请联系系统管理员。');
			$('#self-diagnosis-tooltip').dialog('open');
			beginSelfDiagnosisSound();
		});
	}

	selfDiagnosis();

	function requestLatestAlarm() {
		if (WUI.alarmStatusTimer) {
			clearTimeout(WUI.alarmStatusTimer);
			WUI.alarmStatusTimer = null;
		}
		WUI.ajax.get("alarmStatus", {}, function(status) {
			WUI.alarmStatusTimer = setTimeout(requestLatestAlarm, WUI.requestInteval.realtimeValue);
			setAlarmCount(status.activeAlarmCount);
			checkDialogActive(status.maxSequece);
			checkAlarmSound(status.unAckActiveAlarmCount);
		}, function() {
			WUI.alarmStatusTimer = setTimeout(requestLatestAlarm, WUI.requestInteval.realtimeValue);
		});
	}
	requestLatestAlarm();
	$('#alarm-tooltip').dialog({
		left : $(window).width() - 250,
		top : $(window).height() - 260,
		closed : true
	});
	function checkDialogActive(maxSequece) {
		var lastSeq = $.cookie('maxSequece');
		if (!lastSeq || maxSequece > parseInt(lastSeq, 10)) {
			$.cookie('maxSequece', maxSequece);
			$('#alarm-tooltip').dialog('open');
		}
	}
	$("#alarm-count-status").click(function() {
		$('#alarm-tooltip').dialog('open');
	});

	function setAlarmCount(activeAlarmCount) {
		var totalCount = 0;
		var level1 = 0;
		var level2 = 0;
		var level3 = 0;
		var level4 = 0;
		activeAlarmCount.forEach(function(item) {
			totalCount += item.alarmCount;
			switch (item.alarm_level) {
			case 1:
				level1 = item.alarmCount;
				break;
			case 2:
				level2 = item.alarmCount;
				break;
			case 3:
				level3 = item.alarmCount;
				break;
			case 4:
				level4 = item.alarmCount;
				break;
			}
		});
		$("#st_total_alarm").text(totalCount);
		$("#st_alarmLevel1").text(level1);
		$("#st_alarmLevel2").text(level2);
		$("#st_alarmLevel3").text(level3);
		$("#st_alarmLevel4").text(level4);
		$("#alarm-count-status").text("告警计数：" + totalCount);
	}

	var $alarmSoundBox = $(document.createElement("div"));
	$("body").append($alarmSoundBox);
	var g_alarmSoundFile = null;
	function checkAlarmSound(unAckActiveAlarmCount) {
		var maxLevel = 0;
		unAckActiveAlarmCount.forEach(function(item) {
			var muted = $.cookie('alarm-level-' + item.alarm_level + '-muted');
			if (!muted && item.alarmCount > 0 && item.alarm_level > maxLevel) {
				maxLevel = item.alarm_level;
			}
		});
		if (maxLevel <= 0) {
			$alarmSoundBox.empty();
			g_alarmSoundFile = null;
			return;
		}
		var shoundFile = "level" + maxLevel + ".wav";
		if (g_alarmSoundFile == shoundFile) {
			return;
		}
		g_alarmSoundFile = shoundFile;
		$alarmSoundBox
				.html('<audio autoplay loop><source src="/sounds/' + shoundFile + '" type="audio/wav" /></audio>');
	}

	function setMuted($node, muted, key) {
		if (muted) {
			$node.addClass("alarm_sound_off_icon");
			$node.removeClass("alarm_sound_on_icon");
			$.cookie(key, 1);
		} else {
			$node.addClass("alarm_sound_on_icon");
			$node.removeClass("alarm_sound_off_icon");
			$.removeCookie(key, null);
		}
	}
	setMuted($('#self-diagnosis-sound'), $.cookie('self-diagnosis-muted'), 'self-diagnosis-muted');
	setMuted($('#alarm-level-1-sound'), $.cookie('alarm-level-1-muted'), 'alarm-level-1-muted');
	setMuted($('#alarm-level-2-sound'), $.cookie('alarm-level-2-muted'), 'alarm-level-2-muted');
	setMuted($('#alarm-level-3-sound'), $.cookie('alarm-level-3-muted'), 'alarm-level-3-muted');
	setMuted($('#alarm-level-4-sound'), $.cookie('alarm-level-4-muted'), 'alarm-level-4-muted');

	$('#self-diagnosis-sound').click(function() {
		var muted = !$.cookie('self-diagnosis-muted');
		if (muted) {
			if ($selfDiagnosisSoundBox.children().length > 0) {
				$selfDiagnosisSoundBox.empty();
			}
		}
		setMuted($('#self-diagnosis-sound'), muted, 'self-diagnosis-muted');

	});
	$('#alarm-level-1-sound').click(function() {
		setMuted($('#alarm-level-1-sound'), !$.cookie('alarm-level-1-muted'), 'alarm-level-1-muted');

	});
	$('#alarm-level-2-sound').click(function() {
		setMuted($('#alarm-level-2-sound'), !$.cookie('alarm-level-2-muted'), 'alarm-level-2-muted');

	});
	$('#alarm-level-3-sound').click(function() {
		setMuted($('#alarm-level-3-sound'), !$.cookie('alarm-level-3-muted'), 'alarm-level-3-muted');
	});
	$('#alarm-level-4-sound').click(function() {
		setMuted($('#alarm-level-4-sound'), !$.cookie('alarm-level-4-muted'), 'alarm-level-4-muted');
	});
});
