/* eslint-disable import/extensions,import/no-unresolved,no-return-await, no-empty */
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import prisma from "@/src/lib/prisma"
import { sendMail } from "@/src/lib/mail"

const handler = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const userFromdb = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        })
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          userFromdb.password,
        )
        if (userFromdb && isPasswordValid) {
          return {
            id: String(userFromdb.id),
            name: userFromdb.name,
            email: userFromdb.email,
          }
        }
        return null
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return await Promise.resolve({
        ...session,
        user: {
          ...session.user,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
          id: token.id,
        },
        error: token.error,
      })
    },
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        const { email, name } = profile
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email,
              name,
            },
          })
        }

        await sendMail({
          to: email,
          subject: "Welcome to SyncUP",
          body: `
            <p>Hello ${name},</p>
            <p>Welcome to SyncUP! You've successfully logged in with name:${name}, and Email: ${email}.</p>
            <p>Your account is now active and ready to use.</p>
            <p>Best regards,<br>SyncUP Team</p>
          `,
          smtp_email: process.env.SENDGRID_SMTP_EMAIL,
          sendgrid_key: process.env.SENDGRID_API_KEY,
        })
      } else if (account.provider === "CredentialsProvider") {
      }
      return true
    },
  },
})

export { handler as GET, handler as POST }
