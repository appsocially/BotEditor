const nodemailer = require('nodemailer')
const gmailEmail = 'app.bot.editor@gmail.com'
const gmailPassword = 'interstella55'
// const adminEmail = 'hello@appsocial.ly'

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
})

// 管理者用のメールテンプレート
const adminContents = data => {
  return `TruffleのLPからKeep in Touchの要望がありました。
  メールアドレス：
  ${data}
  `
}

module.exports = async function (email, subject, text) {
  // メール設定
  let adminMail = {
    from: gmailEmail,
    to: email,
    subject: subject,
    text: text
  }

  // 管理者へのメール送信
  mailTransport.sendMail(adminMail, (err, info) => {
    if (err) {
      return console.error(`send failed. ${err}`)
    }
    return console.log('send success.')
  })
}

// var testSend = (email, subject, text) => {
//   // メール設定
//   let adminMail = {
//     from: gmailEmail,
//     to: email,
//     subject: subject,
//     text: text
//   }

//   // 管理者へのメール送信
//   mailTransport.sendMail(adminMail, (err, info) => {
//     if (err) {
//       return console.error(`send failed. ${err}`)
//     }
//     return console.log('send success.')
//   })
// }

// testSend('as.it.were.kou@gmail.com', '[Chatcenter.Ai] ボットにアクセスがありました。', 'メールテストだよ \n 改行はできているかな？？')
