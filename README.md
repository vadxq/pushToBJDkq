# pushToBJDkq
weather and to remind of the time and others

## how to run 

1. 配置运行环境，本项目需要node v7.6.0+版本。
2. 进入目录，安装依赖
```
cd pushToBJDkq
npm i
```
3. 配置邮件账户，目录文件auth.js，修改你的配置。

```
exports.auth = {
  user: 'dongxianlin@vadxq.com',
  pass: '*********' // 授权码，不是密码
}

exports.port = {
  port: 465,
  secure: true, // true for 465, false for other ports
  host: 'smtp.qq.com' //mail host
}

exports.mymail = '"vadxq" <dongxianlin@vadxq.com>' // 发件用户名和邮箱
exports.tomail = 'dongxianlin@vadxq.com,aaa@qq.com' // 接收邮件列表，多邮箱逗号隔开

```
4. 配置config.js，修改你需要定时提醒的服务

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)


比如：``` 10 30 07 * * 1 ```表示在周一7：30：10时间发送。``` 10 30 07 * * * ```表示在每天7：30：10时间发送。

５. 自定义化邮件内容,index.js修改文本

６. 
配置无误后，本地运行
``` 
npm start 
```

服务器部署,需要先安装pm2
``` 
npm i -g pm2
pm2 start app.js

```

#### 欢迎大家提出建议和意见，谢谢～

#### license：Apache Licens Version 2.0