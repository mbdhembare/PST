"use server"

/* eslint-disable no-undef,no-console */
export const updateCardPositionInDB = async (
  cardId,
  newTaskId,
  newPosition,
) => {
  try {
    const existingCardsCount = await prisma.card.count({
      where: { taskId: newTaskId },
    })
    const correctedPosition = Math.min(newPosition, existingCardsCount)
    await prisma.Card.update({
      where: { id: cardId },
      data: {
        taskId: newTaskId,
        order: correctedPosition,
      },
    })
  } catch (error) {
    console.error(`Error updating card position: ${error}`)
    throw new Error("Failed to update card position")
  }
}

export const moveCardToList = async (cardId, fromListId, toListId) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    })

    if (!card) {
      console.error(`Card with ID ${cardId} not found.`)
      return
    }
    await updateCardPositionInDB(cardId, toListId, card.order)
  } catch (error) {
    console.error(`Error moving card ${cardId} to list ${toListId}: ${error}`)
  }
}
