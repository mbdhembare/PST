"use server"

/* eslint-disable import/extensions, import/no-unresolved,react/react-in-jsx-scope */
import prisma from "@/src/lib/prisma"

export default async function LoginValidation(params: any) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: params.email,
    },
  })
  if (existingUser) {
    return existingUser
  }
  return false
}
