/* eslint-disable import/extensions, import/no-unresolved, no-async-promise-executor, camelcase, no-console */
import Handlebars from "handlebars"

import * as sgMail from "@sendgrid/mail"
import { resetPasswordTemplate } from "./emailTemplate/resetPass"

export function sendMail({
  to,
  subject,
  body,
  sendgrid_key,
  smtp_email,
}: {
  to: string
  subject: string
  body: string
  sendgrid_key: string
  smtp_email: string
}): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      sgMail.setApiKey(sendgrid_key)
      const msg = {
        from: { email: smtp_email },
        to,
        subject,
        html: body,
      }
      sgMail.send(msg).then(
        () => {},
        (error) => {
          console.error(error)

          if (error.response) {
            console.error(error.response.body)
          }
        },
      )
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

export function compileResetPassTemplate(name: string, url: string) {
  const template = Handlebars.compile(resetPasswordTemplate)
  const htmlBody = template({
    name,
    url,
  })
  return htmlBody
}
