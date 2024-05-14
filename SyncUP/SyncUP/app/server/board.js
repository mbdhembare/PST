"use server"

/* eslint-disable import/extensions, import/no-unresolved, no-console, no-console, radix */
import prisma from "@/src/lib/prisma"
import { createNotification } from "./NotificationCreating"

export const getAllboards = async (email) => {
  relationLoadStrategy: 'join'
  const boards = await prisma.board.findMany({
    where: {
      OR: [
        {
          users: {
            some: {
              email,
            },
          },
        },
        {
          visibility: "PUBLIC",
        },
      ],
    },
    include: {
      users: true,
    },
  })
  return boards
}
export const createboard = async (
  boardName,
  visibility,
  selectedBackground,
  selectedUsers,
) => {
  const uniqueSelectedUsers = Array.from(
    new Set(selectedUsers.filter((id) => id !== undefined && id !== null)),
  ).map((id) => ({ id: parseInt(id) }))
  const newBoard = await prisma.board.create({
    data: {
      name: boardName,
      visibility,
      background: selectedBackground,
      users: {
        connect: uniqueSelectedUsers,
      },
    },
  })
  await createNotification(`New Board "${boardName}" has been created`,[selectedUsers])
  return newBoard.id
}
export const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  })
  return user?.id
}
export async function updateBoard(
  boardId,
  name,
  background,
  visibility,
  selectedUsers,
  usertounassign,
  selecteduser
) {
  const selectedUserIds = selectedUsers.map((user) => parseInt(user.id))
  const usersToUnassignIds = selectedUserIds.length === 0 ? [] : usertounassign.map(user => parseInt(user.id));
  const updatedBoard = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(name && { name }),
      ...(background && { background }),
      ...(visibility && { visibility }),
      users: {
        connect: selectedUserIds.map((id) => ({ id })),
        disconnect: usersToUnassignIds.map((id) => ({ id })),
      },
    },
  })
  await createNotification(`The Upadated name of board is "${name}"`,[selecteduser])
  return updatedBoard
}
export async function deleteBoard(boardId, boardname,boarduser) {
  relationLoadStrategy: 'join'
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
    include: {
      tasks: {
        include: {
          cards: true,
        },
      },
    },
  })
  await createNotification(` The Board "${boardname}" has deleted`,[boarduser.map(user => user.id)])
  const cardDeletionPromises = board.tasks.flatMap((task) =>
    task.cards.map((card) =>
      prisma.card.delete({
        where: {
          id: card.id,
        },
      }),
    ),
  )
  await Promise.all(cardDeletionPromises)
  const taskDeletionPromises = board.tasks.map((task) =>
    prisma.task.delete({
      where: {
        id: task.id,
      },
    }),
  )
  await Promise.all(taskDeletionPromises)
  const deletedBoard = await prisma.board.delete({
    where: {
      id: boardId,
    },
  })
  return deletedBoard
}
export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany()
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
export async function fetchBoardName(boardId) {
  try {
    const board = await prisma.board.findUnique({
      where: {
        id: parseInt(boardId.id),
      },
      select: {
        name: true,
      },
    })
    return board.name
  } catch (error) {
    console.error("Error fetching board name:", error)
    throw error
  }
}
export async function fetchBoarduser(boardId) {
  try {
    const board = await prisma.board.findUnique({
      where: {
        id: parseInt(boardId),
      },
      select: {
        users: true,
      },
    })
    return board.users
  } catch (error) {
    console.error("Error fetching board name:", error)
    throw error
  }
}

