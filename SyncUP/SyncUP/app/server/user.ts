"use server"

/* eslint-disable import/extensions,import/no-unresolved,no-param-reassign,radix,no-console */
import bcrypt from "bcryptjs"
import prisma from "@/src/lib/prisma"

export default async function UserInsert(params: any) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: params.email,
    },
  })
  if (existingUser) {
    return { message: "User already Exists" }
  }
  params.password = bcrypt.hashSync(
    params.password,
    parseInt(process.env.BCRYPT_SALT),
  )
  const user = await prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      password: params.password,
    },
  })
  return user
}
export const User = async ({ userEmail }) => {
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
    include: {
      boards: true,
    },
  })

  return user
}

export const updateUser = async ({
  name,
  role,
  phone,
  password,
  userEmail,
}) => {
  try {
    await prisma.user.update({
      where: {
        email: userEmail,
      },
      data: {
        name,
        role,
        phone,
        password,
      },
    })

    return true
  } catch (error) {
    console.error("Error updating user:", error)
    return false
  }
}
export const updateProfile = async ({ imagePath, userEmail }) => {
  await prisma.user.update({
    where: { email: userEmail },
    data: {
      photo: imagePath,
    },
  })
}

export const labels = async () => {
  return ["SyncUP", "Avkash", "Project", "Project", "Project"]
}

export const userList = async () => {
  const user = await prisma.user.findMany({})
  return user
}
