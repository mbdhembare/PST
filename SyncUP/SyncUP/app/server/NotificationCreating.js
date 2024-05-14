"use server"

/* eslint-disable import/extensions, import/no-unresolved, radix, no-console */
import prisma from "@/src/lib/prisma"

export const createNotification = async (message,[user]) => {
  relationLoadStrategy: 'join'
  try {
    await prisma.Notification.create({
      data: {
        message,
        users: {
          connect:  user?.map(userId => ({ id: parseInt(userId) }))
        }
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}
