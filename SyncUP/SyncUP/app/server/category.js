"use server"

/* eslint-disable import/extensions,import/no-unresolved,radix */
import prisma from "@/src/lib/prisma"
import { createNotification } from "./NotificationCreating"

export const createTask = async (category, boardId, color,boarduser) => {
  await prisma.task.create({
    data: {
      category,
      boardId: parseInt(boardId),
      color,
    },
  })
  await createNotification(`New Category "${category}" has been created`,[boarduser])
}

export const showAllData = async (boardId) => {
  const tasks = await prisma.task.findMany({
    where: {
      boardId: parseInt(boardId),
    },
    orderBy: {
      order: "asc",
    },
  })
  return tasks
}
export const createcategory = async (category, boardid, color) => {
  await prisma.task.create({
    data: {
      category,
      boardId: boardid,
      color,
    },
  })
}
