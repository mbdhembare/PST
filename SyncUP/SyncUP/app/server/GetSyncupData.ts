"use server"

/* eslint-disable import/extensions, import/no-unresolved, radix, no-console */
import prisma from "@/src/lib/prisma"

export default async function GetSyncupData(boardId) {
  relationLoadStrategy: 'join'
  try {
    const data = await prisma.task.findMany({
      where: {
        boardId: parseInt(boardId),
      },
      include: {
        user: true,
        cards: {
          orderBy: {
            order: "asc",
          },
          include: {
            assignedUsers: true,
            label: true,
            comments: true,
            attachments: true,
          },
        },
      },
    })
    return data.map((task) => ({
      id: task.id,
      title: task.category,
      color: task.color,
      cards: task.cards.map((card) => ({
        id: card.id,
        name: card.name,
        description: card.description,
        photo: card.photo,
        order: card.order,
        dueDate: card.dueDate,
        isCompleted: card.isCompleted,
        isBold: card.isBold,
        isItalic: card.isItalic,
        assignedUsers: card.assignedUsers.map((user) => ({
          name: user.name,
          email: user.email,
          photo: user.photo,
        })),
        label: card.label.map((label) => ({
          id: label.id,
          name: label.name,
          color: label.color,
        })),
        comments: card.comments.map((comments) => ({
          id: comments.id,
          description: comments.name,
        })),
        attachments: card.attachments.map((attachments) => ({
          id: attachments.id,
        })),
      })),
    }))
  } catch (error) {
    console.error("Error fetching data:", error)
    return []
  }
}
