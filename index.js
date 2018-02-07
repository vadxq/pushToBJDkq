'use strict'
const schedule = require('node-schedule'),
  nodemailer = require('nodemailer'),
  request = require('request'),
  fs = require('fs'),
  config = require('./config'),
  auth = require('./auth')

// logs
const logger = (msg, info) => {
  let time = (new Date).toLocaleString()
  let stackInfoStr = stackInfo()
  msg = info + ' ' + time + ` ${stackInfoStr.file}:${stackInfoStr.line} ` + msg + '\n'
  fs.writeFile('./logs.log', msg, { 'flag': 'a' }, (err) => {
    if (err) {
      throw err
    }
    console.log('Saved.')
  })
}

//　天气
const getWeather = () => {
  request.get({url: 'http://www.sojson.com/open/api/weather/json.shtml', qs: {'city': '海淀区'}}, function (error, res, body) {
    // console.log(body)
    if (!error && res.statusCode == 200) {
      // resData = body.data
      let data = JSON.parse(body)
      if (data.status = 200) {
        // console.log(data)
        conWeather(data)
      } else {
        logger(data, 'ERROR')
      }
    }
  })
}

const conWeather = (resData) => {
  var reData = []
  console.log(resData)
  reData = resData.data.forecast
  console.log(reData)
  let time = new Date()
  let day = time.getDate()
  let mon = time.getMonth() + 1
  let year = time.getFullYear()
  let min = time.getMinutes()
  let sec = time.getSeconds()
  let hour = time.getHours()
  let i = 10*Math.random().toFixed(1)
  
  let conts = `

    现在是北京时间${year}-${mon}-${day} ${hour}:${min}:${sec}。
    你所在地海淀区此时的气候为：
    温度：${resData.data.wendu}℃，
    湿度：${resData.data.shidu}，
    PM2.5:${resData.data.pm25}，
    属${resData.data.quality}，${resData.data.ganmao}。


    接下来今明两天天气情况：
    ${reData[0].date}：
    ${reData[0].high}，${reData[0].low}，
    ${reData[0].type},
    日出：${reData[0].sunrise}，日落：${reData[0].sunset}，
    空气指数（PM2.5）：${reData[0].aqi}，
    ${reData[0].fl}${reData[0].fx},
    ${reData[0].notice}。

    ${reData[1].date}：
    ${reData[1].high}，${reData[1].low}，
    ${reData[1].type},
    日出：${reData[1].sunrise}，日落：${reData[1].sunset}，
    空气指数（PM2.5）：${reData[1].aqi}，
    ${reData[1].fl}${reData[1].fx},
    ${reData[1].notice}


    早安物语:
    ${config.morings[i]}


    当然啦，还有昨天的工作汇报～回复邮件等我起床即可收到哟～

    end 
    by vadxq
  `
  console.log(conts)
  mails(conts)
}

//　定时
const scheduleTask = (time) => {
  schedule.scheduleJob(time, () => {
    // console.log(data)
    // logger(time, 'WARN')
    // logger(data, 'data')
    getWeather()
  })
}
let atime = '00 00 07 * * *'
scheduleTask(atime)

// 邮件服务
const mails = (data) => {
  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
      host: auth.port.host,
      port: auth.port.port,
      secure: auth.port.secure,
      auth: auth.auth
    })

    let mailOptions = {
      from: auth.mymail, 
      to: auth.tomail, 
      subject: config.detailMail.subject,
      text: config.detailMail.text,
      html: data
    }
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return logger(error, 'error')
      }
      console.log('Message sent: %s', info.messageId)
      logger('Message sent: %s' + info.messageId, 'success')
    })
  })
}

/**
* 追踪日志输出文件名,方法名,行号等信息
* @returns Object
*/
const stackInfo = () => {
  let path = require('path')
  let stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i
  let stackReg2 = /at\s+()(.*):(\d*):(\d*)/i
  let stacklist = (new Error()).stack.split('\n').slice(3)
  let s = stacklist[0]
  let sp = stackReg.exec(s) || stackReg2.exec(s)
  let data = {}
  if (sp && sp.length === 5) {
    data.method = sp[1]
    data.path = sp[2]
    data.line = sp[3]
    data.pos = sp[4]
    data.file = path.basename(data.path)
  }
  return data
}