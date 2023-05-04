import { SESV2 } from 'aws-sdk'
import { IAuthCode } from '@/models/authCode'

const sesv2 = new SESV2({
  region: 'us-east-1',
})

export const onAuthCodeChanged = async (item: IAuthCode) => {
  const subject = `New Login Code: ${item.code}`
  const expire_at_str = new Date(item.expire_at * 1000)
  const htmlBody = `Your login code is <b>${item.code}</b>.<br /><br />Code will expire at <b>${expire_at_str}</b>`
  const textBody = `Your login code is: ${item.code}. Code will expire at ${expire_at_str}`
  const toAddress = item.email
  const fromAddress = 'auth@mail.colanderapp.io'
  await sesv2
    .sendEmail({
      Content: {
        Simple: {
          Body: {
            Html: { Charset: 'UTF-8', Data: htmlBody },
            Text: { Charset: 'UTF-8', Data: textBody },
          },
          Subject: { Charset: 'UTF-8', Data: subject },
        },
      },
      Destination: {
        ToAddresses: [toAddress],
      },
      FromEmailAddress: fromAddress,
    })
    .promise()
}
