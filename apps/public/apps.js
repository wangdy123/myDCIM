$(function() {
	var selfDiagnosisUrl = 'alarm/selfDiagnosis';

	var currentLogicObject = null;

	WUI.subscribe('request_current_object', function(event) {
		event.cbk(currentLogicObject);
	},"apps");

	WUI.subscribe('open_object', function(event) {
		if (currentLogicObject && currentLogicObject.ID === event.object.ID) {
			return;
		}
		currentLogicObject = event.object;
		$.cookie('currentObjectId', event.object.ID);
	},"apps");

	var isFullScreen=false;
	$("#fullscreem-btn").click(function() {
		var target = $("body");
		if (isFullScreen) {
			isFullScreen=false;
			WUI.exitFullscreen();
		} else {
			isFullScreen=true;
			WUI.fullscreen(target[0]);
		}
	});
	
	$('#qrcode-panel').tooltip({
		content : '<div id="qrcode" ></div>',
		onShow : function() {
			$('#qrcode').empty();
			$('#qrcode').qrcode({
				render : "table",
				width : 100,
				height : 100,
				text : window.location.href
			});
		}
	});
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
				$('#account-password').validatebox({
					required : true,
					validType : 'password'
				});
				$('#account-password-confirm').validatebox({
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
					var isValid = $('#account-password').validatebox("isValid");
					isValid = isValid && $('#account-password-confirm').validatebox("isValid");
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
		// TODO::显示当前用户
	});

	function selfDiagnosis() {
		if (WUI.selfDiagnosisTimer) {
			clearTimeout(WUI.selfDiagnosisTimer);
			WUI.selfDiagnosisTimer = null;
		}
		WUI.ajax.get(selfDiagnosisUrl, {}, function(status) {
			WUI.selfDiagnosisTimer = setTimeout(selfDiagnosis, WUI.requestInteval.selfDiagnosis);
			// TODO
		}, function() {
			WUI.selfDiagnosisTimer = setTimeout(selfDiagnosis, WUI.requestInteval.selfDiagnosis);
		});
	}

	function showSelfDiagnosis() {
		var $dialogNode = $('#self-diagnosis-tooltip');
		$dialogNode.dialog({
			iconCls : "icon-self-diagnosis",
			title : "自诊断状态",
			left : $(window).width() - 400,
			top : $(window).height() - 220,
			width : 200,
			closed : false,
			cache : false,
			href : 'self-diagnosis-status-dialog.html',
			onLoad : function() {
				// TODO 显示自诊断
			},
			modal : false,
			onClose : function() {
				$dialogNode.empty();
			}
		});
	}
	selfDiagnosis();
	$("#selfDiagnosis-status").click(showSelfDiagnosis);

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
