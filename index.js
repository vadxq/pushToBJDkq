'use strict'
const schedule = require('node-schedule'),
  nodemailer = require('nodemailer'),
  // http = require('http'),  
  axios = require('axios'),
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

// 请求天气
const getWeather = () => {
  return axios.get('http://www.sojson.com/open/api/weather/json.shtml', {
      params: {
        city: '海淀区'
      }
    })
    .then(res => {
      // console.log(res.data)
      if (res.status = 200) {
        return Promise.resolve(res.data)
      } else {
        logger(res.data, 'ERROR')
      }
    })
    .catch(error => {
      console.log(error)
      logger(error, 'ERROR')
    })
  }

// 早上　天气（温度，ｔｙｐｅ，湿度，感冒，污染情况，ｐｍ２．５，) 一句励志或者是温馨的话　工作进度汇报

const conWeather = () => {
  var resData = getWeather()
  // request('http://www.sojson.com/open/api/weather/json.shtml?city=海淀区', function (error, res, body) {
  //   if (!error && res.statusCode == 200) {
  //     console.log(body) // 打印google首页
  //     resData = 
  //   }
  // })
  // var resData = http.get('http://www.sojson.com/open/api/weather/json.shtml?city=海淀区', (res) => {
  //   var body = ''
  //   console.log('ddd'+res)
  //   res.on('data', (d) => {
  //     body += d
  //   })
  //   res.on('end', function() {
  //     // Data reception is done, do whatever with it!
  //     var parsed = JSON.parse(body)
  //     if (parsed.status = 200) {
  //       return parsed.data
          
  //     } else {
  //       logger(parsed.data, 'ERROR')
  //     }
  // })
  // }).on('error', function(e) {
  //   console.log("Got error: " + e.message)
  //   logger(e.message, 'ERROR')
  // })

  console.log(resData)
  let reData = resData.forecast
  let time = new Date()
  let day = time.getDate()
  let mon = time.getMonth() + 1
  let year = time.getFullYear()
  let min = time.getMinutes()
  let sec = time.getSeconds()
  let hour = time.getHours()
  return `
  现在是北京时间${year}-${mon}-${day} ${hour}:${min}:${sec}。
  温度：${resData.wendu}℃，
  湿度：${resData.shidu}，
  PM2.5:${resData.pm25}，
  属${resData.quality}，${resData.ganmao}。


  接下来今明三天天气情况：
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
  `
}

let con = conWeather()
console.log(con)
// const getWeather = axios.get('http://www.sojson.com/open/api/weather/json.shtml', {
//     params: {
//       city: '海淀区'
//     }
//   })
//   .then(res => {
//     console.log(res.data)
//     if (res.status = 200) {
//       await conWeather(res.data)
//     } else {
//       logger(res.data, 'ERROR')
//     }
//   })
//   .catch(error => {
//     console.log(error)
//     logger(error, 'ERROR')
//   })

const scheduleTask = (time, data) => {
  schedule.scheduleJob(time, () => {
    console.log(data)
    logger(time, 'WARN')
    logger(data, 'data')
    mails(data)
  })
}

//邮件服务
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