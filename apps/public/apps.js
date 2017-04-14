$(document).ready(function() {
    $('#qrcode-panel').tooltip({
        content: '<div id="qrcode" ></div>',
        onShow: function(){
        	$('#qrcode').empty();
        	$('#qrcode').qrcode({ 
        	    render: "table", 
        	    width:100,
        	    height:100,
        	    text: window.location.href
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

	});
});
