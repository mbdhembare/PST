"use server"

/* eslint-disable import/extensions, import/no-unresolved, radix, import/no-unresolved */
import bcrypt from "bcryptjs"
import { signJwt, verifyJwt } from "../jwt"
import { compileResetPassTemplate, sendMail } from "../mail"
import prisma from "../prisma"

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) throw new Error("The User Does Not Exist!")

  const jwtUserId = signJwt({
    id: user.id,
  })
  const resetPassUrl = `${process.env.NEXTAUTH_URL}/auth/resetPass/${jwtUserId}`
  const body = compileResetPassTemplate(user.name, resetPassUrl)
  const sendResult = await sendMail({
    to: user.email,
    subject: "Reset Password",
    body,
    sendgrid_key: process.env.SENDGRID_API_KEY,
    smtp_email: process.env.SENDGRID_SMTP_EMAIL,
  })
  return sendResult
}

type ResetPasswordFunc = (
  jwtUserId: string,
  password: string,
) => Promise<"userNotExist" | "success">

export const resetPassword: ResetPasswordFunc = async (jwtUserId, password) => {
  const payload = verifyJwt(jwtUserId)
  if (!payload) return "userNotExist"
  const userId = payload.id
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (!user) return "userNotExist"

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: bcrypt.hashSync(password, parseInt(process.env.BCRYPT_SALT)),
    },
  })
  if (result) return "success"
  throw new Error("Something went wrong!")
}
