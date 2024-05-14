"use server"

/* eslint-disable import/extensions, import/no-unresolved, no-console */
import prisma from "@/src/lib/prisma"

export const fetchNotifications = async (lastSeenNotificationId,email) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    const notifications = await prisma.notification.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return notifications.map((notification) => ({
      ...notification,
      new: !lastSeenNotificationId || notification.id > lastSeenNotificationId,
    }))
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}
