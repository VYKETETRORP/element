import { Meteor } from 'meteor/meteor'

Meteor.startup(() => {
  // Gmail (don't work)
  // const server = 'smtp.gmail.com',
  //   port = 587,
  //   username = 'yuom.theara@gmail.com',
  //   password = 'tharea$power$555'

  // process.env.MAIL_URL = `smtp://${username}:${password}@${server}:${port}`

  // Mailgun
  const server = 'smtp.mailgun.org',
    port = 587,
    username = 'postmaster@sandbox27dd9c8351b14e7f9bb61665b6061119.mailgun.org',
    password = 'f0609b1d2eb21175865c69d93f2360fe-1b65790d-83197961'

  process.env.MAIL_URL = `smtp://${username}:${password}@${server}:${port}`
})
