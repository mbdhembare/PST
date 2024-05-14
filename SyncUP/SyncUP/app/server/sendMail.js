"use server"

/* eslint-disable import/extensions,import/no-unresolved , @typescript-eslint/no-unused-vars,no-console */
import { sendMail } from "../src/lib/mail"
import appConfig from "@/app.config"

export const mentionMail = async ({ email, link, title }) => {
  const body = `
<p>Hello,</p>
<p>You have been mentioned in our ${appConfig.PROJECT_NAME} platform:</p>
<p>Card Title: ${title}</p>
<p>Link: ${link}</p>
<p>Please click on the link above to view the details.</p>
<p>Best regards,<br>${appConfig.PROJECT_NAME}</p>
`
  const subject = `Mention in Comment: ${title}`
  const emailPromises = email.map(async (userEmail) => {
    try {
      await sendMail({
        to: userEmail,
        subject,
        body,
        sendgrid_key: process.env.SENDGRID_API_KEY,
        smtp_email: process.env.SENDGRID_SMTP_EMAIL,
      })
    } catch (error) {
      console.error(`Error sending email to ${userEmail}:`, error)
    }
  })
}
