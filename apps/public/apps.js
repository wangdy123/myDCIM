$(document).ready(function() {
	$(".theme-item").click(function() {
		$.cookie("theme", $(this).attr("value"));
		$(this).parent().hide();
		location.reload();
	});
	$("#change-password-btn").click(function() {

	});
	$("#user-logout-btn").click(function() {

	});
	$("#current-user-panel").click(function() {

	});
});
