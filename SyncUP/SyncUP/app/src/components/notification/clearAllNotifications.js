"use server"

/* eslint-disable  import/extensions, import/no-unresolved, no-console */
import prisma from "@/src/lib/prisma"

const deleteNotification = async () => {
  try {
    await prisma.notification.deleteMany()
  } catch (error) {
    console.error("Error clearing notifications:", error)
    throw error
  }
}

export default deleteNotification
