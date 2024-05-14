"use client"

/* eslint-disable @typescript-eslint/no-unused-vars,import/extensions,no-shadow,no-console,import/no-unresolved,jsx-a11y/anchor-is-valid,react/jsx-key */
import React, { useState } from "react"
import Link from "next/link"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Card,
} from "@nextui-org/react"
import { GrAdd } from "react-icons/gr"
import { MdOutlinePublic } from "react-icons/md"
import { BiSolidLock } from "react-icons/bi"
import { SlOptionsVertical } from "react-icons/sl"
import { deleteBoard } from "@/server/board"
import AddBoardModal from "./boardmodal"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"
import { hasAccess, Permissions } from "@/src/roleManagement/roleManagement"

function Board() {
  const [openPopoverId, setOpenPopoverId] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  const [selectedBoardData, setSelectedBoardData] = useState(null)
  const { boardData, setBoardData, userInfo } = useGlobalSyncupContext()

  const handleModalOpen = () => {
    setOpenModal(true)
    setSelectedBoardData(null)
  }

  const handleEdit = (board) => {
    setSelectedBoardData(board)
    setOpenModal(true)
    setOpenPopoverId(null)
  }
  const handleDelete = async (boardId, boardname,boarduser) => {
    try {
      await deleteBoard(boardId, boardname,boarduser)
      setBoardData(boardData.filter((board) => board.id !== boardId))
    } catch (error) {
      console.error("Error deleting board:", error)
    } finally {
      setOpenPopoverId(null)
    }
  }
  const handleModalClose = () => {
    setOpenModal(false)
  }

  return (
    <div className="flex">
      <div className="flex flex-row flex-wrap ml-5 mt-5">
        {boardData.map((board) => (
          <div className="relative p-1">
            {hasAccess(Permissions.createBoard) && (
              <Popover
                isOpen={openPopoverId === board.id}
                onOpenChange={(isOpen) =>
                  isOpen ? setOpenPopoverId(board.id) : setOpenPopoverId(null)
                }
                placement="bottom-start"
                offset={-10}
              >
                <PopoverTrigger>
                  <Button
                    className="absolute top-0 right-0 z-10 text-white"
                    isIconOnly
                    variant="light"
                    onClick={() => setSelectedBoardId(board.id)}
                  >
                    <SlOptionsVertical />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-20 h-20">
                  <Button
                    color="secondary"
                    variant="light"
                    onClick={() =>
                      handleEdit(
                        boardData.find((b) => b.id === selectedBoardId),
                      )
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    color="danger"
                    variant="light"
                    onClick={() => handleDelete(selectedBoardId, board.name,board.users)}
                  >
                    Delete
                  </Button>
                </PopoverContent>
              </Popover>
            )}

            <Link legacyBehavior href={`/board/${board.id}`} passHref>
              <a
                className="cursor-pointer"
                style={{ textDecoration: "none", height: "100%" }}
              >
                <Card
                  className="flex flex-col overflow-hidden p-7 text-white rounded-lg shadow-md bg-cover bg-center bg-no-repeat"
                  style={{
                    width: "10.3rem",
                    height: "100px",
                    backgroundImage: board.background
                      ? `url(${board.background})`
                      : "linear-gradient(to right, #ff9a44, #ff4e00)",
                    opacity: 0.9,
                    textAlign: "center",
                    wordWrap: "break-word",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px 0 0 0",
                      width: "20px",
                      height: "20px",
                    }}
                  >
                    {board.visibility === "PUBLIC" ? (
                      <MdOutlinePublic />
                    ) : (
                      <BiSolidLock size={80} />
                    )}
                  </div>
                  <span className="font-bold overflow-ellipsis block text-xl leading-tight text-white">
                    {board.name}
                  </span>
                </Card>
              </a>
            </Link>
          </div>
        ))}

        {hasAccess(Permissions.createBoard) && (
          <div className="mt-1.5 ml-1">
            <Card
              className="h-[100px] w-[10.3rem] flex flex-col justify-center  text-center transition-transform duration-300 ease-in-out bg-[#7CB86E] bg-opacity-90 text-white rounded-lg shadow-md dark:bg-700 dark:text-black"
              onPress={handleModalOpen}
              isPressable
            >
              <GrAdd style={{ fontSize: 40, marginLeft: "60px" }} />
            </Card>
          </div>
        )}
      </div>
      <AddBoardModal
        open={openModal}
        onClose={handleModalClose}
        boardData={selectedBoardData}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      />
    </div>
  )
}
export default Board
