exports.auth = {
  user: 'dongxianlin@vadxq.com',
  pass: '********' // 授权码，不是密码
}

exports.port = {
  port: 465,
  secure: true, // true for 465, false for other ports
  host: 'smtp.qq.com' //mail host
}

exports.mymail = '"vadxq" <dongxianlin@vadxq.com>' // 发件用户名和邮箱
exports.tomail = 'dongxianlin@vadxq.com' // 接收邮件列表，多邮箱逗号隔开