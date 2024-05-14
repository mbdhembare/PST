"use client"

/* eslint-disable @typescript-eslint/no-unused-vars, react/react-in-jsx-scope */
import { createContext } from "react"
import { DragDropContext, DropResult } from "react-beautiful-dnd"

export function DndContext({
  children,
  onDragEnd,
}: {
  children: React.ReactNode
  onDragEnd: (result: DropResult) => void
}) {
  return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
}
