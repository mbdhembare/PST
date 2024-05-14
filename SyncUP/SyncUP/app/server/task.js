"use server"

/* eslint-disable import/extensions,import/no-unresolved,radix,consistent-return,no-console,@typescript-eslint/no-unused-vars */
import prisma from "@/src/lib/prisma"
import { createNotification } from "./NotificationCreating"

export const createTitle = async ({ title }, id,boarduser) => {
  if (title.trim() !== "") {
    await prisma.Card.create({
      data: {
        name: title,
        taskId: id,
      },
    })
    await createNotification(`New Card "${title}" has been created`,[boarduser])
  }
}

export const updateCard = async ({ description, label, updateId }) => {
  await prisma.Card.update({
    where: {
      id: parseInt(updateId),
    },
    data: {
      description,
      label,
    },
  })
}
export const deleteTask = async (taskId,boarduser) => {
  const card = await prisma.card.findUnique({
    where: {
      id: parseInt(taskId),
    },
    select: {
      name: true,
    },
  })

  await prisma.Card.delete({
    where: {
      id: taskId,
    },
  })
  await createNotification(`The Card "${card.name}" has deleted`,[boarduser])
}

export const updateCardTitle = async ({ updateId, name }) => {
  await prisma.Card.update({
    where: {
      id: parseInt(updateId),
    },
    data: {
      name,
    },
  })
}

export const updateInfo = async ({
  updateId,
  description,
  isBold,
  isItalic,
}) => {
  await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      description,
      isBold,
      isItalic,
    },
  })
}

export const updateUser = async ({ selectedUserId, updateId }) => {
  await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      assignedUsers: selectedUserId
        ? {
            connect: selectedUserId.map((id) => ({ id })),
          }
        : [],
    },
  })
}
export const unassignUser = async ({ selectedUserId, updateId }) => {
  const userId = selectedUserId
  await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      assignedUsers: {
        disconnect: selectedUserId ? [{ id: userId }] : [],
      },
    },
  })
}

export const cardUsers = async ({ updateId }) => {
  try {
    if (updateId) {
      const card = await prisma.card.findUnique({
        where: {
          id: updateId,
        },
        include: {
          assignedUsers: true,
        },
      })
      return card?.assignedUsers
    }
  } catch (error) {
    console.error("Error fetching card users:", error)
    throw error
  }
}

export const cardData = async ({ updateId }) => {
  const card = await prisma.card.findUnique({
    where: {
      id: updateId,
    },
    include: {
      assignedUsers: true,
      label: true,
      task: true,
      comments: true,
    },
  })
  return card
}

export const updateDates = async ({ updateId, startValue, endValue }) => {
  const formattedStartDate = startValue.toISOString()
  const formattedEndDate = endValue.toISOString()
  await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      createdAt: formattedStartDate,
      dueDate: formattedEndDate,
    },
  })
}
export const checkCompleted = async ({ updateId, isChecked }) => {
  if (updateId) {
    await prisma.card.update({
      where: {
        id: updateId,
      },
      data: {
        isCompleted: isChecked,
      },
    })
  }
}
