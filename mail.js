const
nodemailer = require("nodemailer");
var wellknown = require('nodemailer-wellknown');
console.log("smtpTransport");

var transporter = nodemailer.createTransport({
	// https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
	service : '163',
	port : 465, // SMTP 端口
	secureConnection : true, // 使用 SSL
	auth : {
		user : "s_x_wang@163.com", // 账号
		pass : "wangDY@JR" // 密码
	}
});
var mailOptions = {
	from : "s_x_wang@163.com", // 发件地址
	to : "13480275110@139.com", // 收件列表
	subject : "Hello world", // 标题
	text : 'Hello world ?', // 标题
	html : '<b>Hello world ?</b>' // html 内容
}

// 发送邮件
transporter.sendMail(mailOptions, function(error, response) {
	if (error) {
		console.log(error);
	} else {
		console.log(response);
	}
	transporter.close(); // 如果没用，关闭连接池
});