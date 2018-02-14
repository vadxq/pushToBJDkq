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
const getWeather = (addr) => {
  request.get({url: 'http://www.sojson.com/open/api/weather/json.shtml', qs: {'city': addr}}, function (error, res, body) {
    // console.log(body)
    if (!error && res.statusCode == 200) {
      // resData = body.data
      let data = JSON.parse(body)
      if (data.status = 200) {
        // console.log(data)
        conWeather(data, addr)
      } else {
        logger(data, 'ERROR')
        setTimeout(getWeather(), 2000)
      }
    }
  })
}

const conWeather = (resData, addr) => {
  var reData = []
  // console.log(resData)
  reData = resData.data.forecast
  // console.log(reData)
  let time = new Date()
  let day = time.getDate()
  let mon = time.getMonth() + 1
  let year = time.getFullYear()
  let min = time.getMinutes()
  let sec = time.getSeconds()
  let hour = time.getHours()
  let i = 10*Math.random().toFixed(1)
  let j = 10 + 10*Math.random().toFixed(1)
  
  let conts = `
    <b>哈喽丁胖子～</b>
    <br/><br/>
    现在是北京时间${year}-${mon}-${day} ${hour}:${min}:${sec}。<br/>
    你所在地${addr}此时的气候为：<br/>
    温度：${resData.data.wendu}℃，<br/>
    湿度：${resData.data.shidu}，<br/>
    PM2.5:${resData.data.pm25}，<br/>
    属${resData.data.quality}，${resData.data.ganmao}。<br/>
    <br/><br/>

    接下来今明两天天气情况：<br/>
    ${reData[0].date}：<br/>
    ${reData[0].high}，${reData[0].low}，<br/>
    ${reData[0].type},<br/>
    日出：${reData[0].sunrise}，日落：${reData[0].sunset}，<br/>
    空气指数（PM2.5）：${reData[0].aqi}，<br/>
    ${reData[0].fl}${reData[0].fx},<br/>
    ${reData[0].notice}。<br/>
    <br/><br/>
    ${reData[1].date}：<br/>
    ${reData[1].high}，${reData[1].low}，<br/>
    ${reData[1].type},<br/>
    日出：${reData[1].sunrise}，日落：${reData[1].sunset}，<br/>
    空气指数（PM2.5）：${reData[1].aqi}，<br/>
    ${reData[1].fl}${reData[1].fx},<br/>
    ${reData[1].notice}<br/>

    <br/><br/>
    伴你物语:<br/>
    ${config.morings[i]}<br/>
    <br/>
    ${config.morings[j]}<br/>
    <br/><br/>

    愿你路途平安～不管在哪，我都愿能在这个寒假与你分享，与你相伴～<br/>
    除夕快乐～新年快乐～
    <br/><br/>
    end <br/>
    by vadxq<br/>
  `
  console.log(conts)
  mails(conts)
}

//　定时
const scheduleTask = (time, data) => {
  schedule.scheduleJob(time, () => {
    console.log(data)
    // logger(time, 'WARN')
    logger(data, 'data')
    getWeather(data)
  })
}

let hdTime = '59 59 04 * * *'
let tjTime = '30 30 07 * * *'
let ncTime = '59 30 11 * * *'
let gzTime = '30 40 16 * * *'

let hdAddr = '海淀区'
let tjAddr = '天津'
let ncAddr = '南昌'
let gzAddr = '宁都'

// test
// let hdTime = '59 50 19 * * *'
// let tjTime = '30 50 19 * * *'
// let ncTime = '40 50 19 * * *'
// let gzTime = '20 50 19 * * *'

scheduleTask(hdTime, hdAddr)
scheduleTask(tjTime, tjAddr)
scheduleTask(ncTime, ncAddr)
scheduleTask(gzTime, gzAddr)

// 邮件服务
const mails = (conts) => {
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
      html: conts
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
